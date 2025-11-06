import {
  AuthTokens,
  AuthType,
  EndpointConfig,
  RequestConfig,
  RequestOptions,
  SDKConfig,
} from "../types/config";
import { InterceptorManager } from "./interceptors";
import { BooklaError } from "../types/errors";
import { CancelToken } from "./cancel-token";
import { AuthState } from "../types/auth";
import { storage } from "../utils/storage";
import { ClientAuthResponse } from "../types/responses";
import { ENDPOINTS } from "../constants/endpoints";

export class HttpClient {
  private readonly baseURL: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private retry: Required<NonNullable<SDKConfig["retry"]>>;
  private readonly debug: boolean;
  private tokens: AuthTokens | null = null;

  // Request deduplication: tracks in-flight requests to prevent duplicates
  private pendingRequests = new Map<string, Promise<any>>();

  // Development warnings: tracks request patterns to detect potential issues
  private requestHistory = new Map<
    string,
    { count: number; lastTime: number; times: number[] }
  >();

  public interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager(),
  };

  constructor(config: SDKConfig) {
    this.baseURL = config.apiUrl;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.retry = config.retry || {
      maxAttempts: 3,
      delayMs: 1000,
      statusCodesToRetry: [408, 429, 500, 502, 503, 504],
    };
    this.debug = config.debug || false;
  }

  setTokens(tokens: AuthTokens) {
    this.tokens = tokens;
    this.saveTokensToStorage(tokens);
  }

  async isAuthenticated(): Promise<AuthState> {
    if (this.tokens?.accessToken) {
      const expiresAt = Date.parse(this.tokens.expiresAt);
      if (expiresAt < Date.now()) {
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          this.clearAuth();
          return { isAuthenticated: false };
        }
        return {
          isAuthenticated: true,
          accessToken: this.tokens.accessToken,
          expiresAt: Date.parse(this.tokens.expiresAt),
        };
      }

      return {
        isAuthenticated: true,
        accessToken: this.tokens.accessToken,
        expiresAt: Date.parse(this.tokens.expiresAt),
      };
    }

    // Check localStorage as fallback
    const storedTokens = this.loadTokensFromStorage();
    if (storedTokens) {
      this.tokens = storedTokens; // Update current tokens
      const expiresAt = Date.parse(storedTokens.expiresAt);
      if (expiresAt < Date.now()) {
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          this.clearAuth();
          return { isAuthenticated: false };
        }
        return {
          isAuthenticated: true,
          accessToken: this.tokens.accessToken,
          expiresAt: Date.parse(this.tokens.expiresAt),
        };
      }

      return {
        isAuthenticated: true,
        accessToken: storedTokens.accessToken,
        expiresAt: expiresAt,
      };
    }

    return { isAuthenticated: false };
  }

  clearAuth(): void {
    this.tokens = null;
    storage.clearTokens();
  }

  private saveTokensToStorage(tokens: AuthTokens) {
    storage.setTokens(tokens);
  }

  private loadTokensFromStorage(): AuthTokens | null {
    return storage.getTokens();
  }

  private validateAuth(config: RequestConfig & { auth: AuthType }) {
    if (config.auth === "bearer" && !this.tokens?.accessToken) {
      throw new BooklaError(
        "Authentication required for this endpoint",
        "AUTH_REQUIRED",
      );
    }
  }

  /**
   * Generates a unique key for request deduplication
   * Format: METHOD:URL:BODY_HASH
   */
  private getRequestKey(config: RequestConfig): string {
    const body = config.data ? JSON.stringify(config.data) : "";
    return `${config.method}:${config.url}:${body}`;
  }

  /**
   * Tracks request patterns and warns about potential issues in debug mode
   */
  private trackRequest(requestKey: string): void {
    if (!this.debug) return;

    const now = Date.now();
    const history = this.requestHistory.get(requestKey) || {
      count: 0,
      lastTime: 0,
      times: [],
    };

    history.count++;
    history.times.push(now);
    history.lastTime = now;

    // Keep only last 10 seconds of history
    history.times = history.times.filter((time) => now - time < 10000);

    this.requestHistory.set(requestKey, history);

    // Warning 1: Rapid identical requests (potential infinite loop)
    const timeSinceLastRequest =
      history.lastTime - (history.times[history.times.length - 2] || 0);
    if (timeSinceLastRequest < 100 && history.times.length > 1) {
      console.warn(
        `[Bookla SDK] ⚠️  Rapid identical request detected (${timeSinceLastRequest}ms since last)`,
        `\n  Request: ${requestKey.split(":")[0]} ${requestKey.split(":")[1]}`,
        `\n  This might indicate an infinite loop in your React component.`,
        `\n  Check useEffect dependencies or use the SDK's cancelToken feature.`,
      );
    }

    // Warning 2: High frequency requests (> 10 in 1 second)
    const recentRequests = history.times.filter((time) => now - time < 1000);
    if (recentRequests.length > 10) {
      console.warn(
        `[Bookla SDK] ⚠️  High request frequency detected: ${recentRequests.length} requests in 1 second`,
        `\n  Request: ${requestKey.split(":")[0]} ${requestKey.split(":")[1]}`,
        `\n  Consider implementing proper request cancellation or debouncing in your application.`,
      );
    }

    // Warning 3: Many identical requests over time (> 50 in 10 seconds)
    if (history.times.length > 50) {
      console.warn(
        `[Bookla SDK] ⚠️  Excessive identical requests: ${history.times.length} requests in 10 seconds`,
        `\n  Request: ${requestKey.split(":")[0]} ${requestKey.split(":")[1]}`,
        `\n  This is likely a bug in your application code.`,
      );
    }
  }

  private async request<T>(
    config: RequestConfig & { auth: AuthType },
  ): Promise<T> {
    this.validateAuth(config);

    // Generate unique key for this request
    const requestKey = this.getRequestKey(config);

    // Track request patterns for development warnings
    this.trackRequest(requestKey);

    // Request deduplication: if identical request is in-flight, return existing promise
    const pendingRequest = this.pendingRequests.get(requestKey);
    if (pendingRequest) {
      if (this.debug) {
        console.log(
          `[Bookla SDK] 🔄 Deduplicating request: ${config.method} ${config.url}`,
          "\n  Returning existing in-flight request instead of creating a duplicate.",
        );
      }
      return pendingRequest;
    }

    // Create new request promise
    const requestPromise = this.executeRequest<T>(config);

    // Store in pending requests
    this.pendingRequests.set(requestKey, requestPromise);

    // Clean up when done (success or failure)
    requestPromise
      .then(() => {
        this.pendingRequests.delete(requestKey);
      })
      .catch(() => {
        this.pendingRequests.delete(requestKey);
      });

    return requestPromise;
  }

  private async executeRequest<T>(
    config: RequestConfig & { auth: AuthType },
  ): Promise<T> {
    let attempt = 0;

    while (attempt < this.retry.maxAttempts) {
      try {
        // Check for cancellation
        if (config.cancelToken?.cancelled) {
          throw new BooklaError("Request cancelled", "REQUEST_CANCELLED");
        }

        // Apply request interceptors
        const modifiedConfig = await this.interceptors.request.execute({
          ...config,
          headers: this.getHeaders(config),
        });

        // Make request
        if (this.debug) {
          console.log(`[Bookla SDK] Making request:`, modifiedConfig);
        }

        const response = await fetch(`${this.baseURL}${config.url}`, {
          method: config.method,
          headers: modifiedConfig.headers,
          body: config.data ? JSON.stringify(config.data) : undefined,
          signal: AbortSignal.timeout(config.timeout || this.timeout),
        });

        // Handle response
        if (!response.ok) {
          throw new BooklaError(
            response.statusText,
            "API_ERROR",
            response.status,
          );
        }

        const data = await response.json();

        // Apply response interceptors
        const modifiedResponse = await this.interceptors.response.execute(data);

        if (this.debug) {
          console.log(`[Bookla SDK] Response received:`, modifiedResponse);
        }

        return modifiedResponse;
      } catch (error) {
        // Handle specific error cases
        if (error instanceof BooklaError) {
          if (error.code === "REQUEST_CANCELLED") {
            throw error;
          }

          if (error.status === 401) {
            const refreshed = await this.refreshToken();
            if (!refreshed) {
              throw new BooklaError(
                "Token refresh failed",
                "TOKEN_REFRESH_FAILED",
              );
            }
            // Retry with new token
            attempt++;
            continue;
          }

          if (!this.retry.statusCodesToRetry.includes(error.status || 0)) {
            throw error;
          }
        }

        // Retry logic
        attempt++;
        if (attempt === this.retry.maxAttempts) {
          throw new BooklaError(
            "Max retry attempts reached",
            "MAX_RETRIES_EXCEEDED",
          );
        }

        await new Promise((resolve) =>
          setTimeout(resolve, this.retry.delayMs * attempt),
        );
      }
    }

    throw new BooklaError("Request failed", "REQUEST_FAILED");
  }

  private getHeaders(config: RequestConfig): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (
      (config.auth === "bearer" || config.auth === "apiKeyOrBearer") &&
      this.tokens?.accessToken
    ) {
      headers["Authorization"] = `Bearer ${this.tokens.accessToken}`;
    } else {
      headers["X-API-Key"] = this.apiKey;
    }

    return headers;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      if (!this.tokens?.refreshToken) {
        return false;
      }

      const response = await fetch(
        `${this.baseURL}${ENDPOINTS.auth.refresh.path}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.tokens.refreshToken}`,
          },
        },
      );

      if (!response.ok) {
        return false;
      }

      const newTokens: ClientAuthResponse = await response.json();
      this.setTokens(newTokens);
      return true;
    } catch (error) {
      return false;
    }
  }

  async get<T>(endpoint: EndpointConfig, options?: RequestOptions): Promise<T> {
    return this.request<T>({
      method: "GET",
      url: endpoint.path,
      auth: endpoint.auth,
      ...options,
    });
  }

  async post<T>(
    endpoint: EndpointConfig,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>({
      method: "POST",
      url: endpoint.path,
      data,
      auth: endpoint.auth,
      ...options,
    });
  }

  async delete<T>(
    endpoint: EndpointConfig,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>({
      method: "DELETE",
      url: endpoint.path,
      auth: endpoint.auth,
      ...options,
    });
  }

  createCancelToken(): CancelToken {
    return new CancelToken();
  }

  isCancelledError(error: any): boolean {
    return error instanceof BooklaError && error.code === "REQUEST_CANCELLED";
  }
}
