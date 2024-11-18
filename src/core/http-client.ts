import {AuthTokens, AuthType, EndpointConfig, RequestConfig, RequestOptions, SDKConfig} from "../types/config";
import {InterceptorManager} from "./interceptors";
import {BooklaError} from "../types/errors";
import {CancelToken} from "./cancel-token";
import {AuthState} from "../types/auth";
import {storage} from "../utils/storage";

export class HttpClient {
    private readonly baseURL: string;
    private readonly apiKey: string;
    private readonly timeout: number;
    private retry: Required<NonNullable<SDKConfig['retry']>>;
    private readonly debug: boolean;
    private tokens: AuthTokens | null = null;

    public interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    };

    constructor(config: SDKConfig) {
        this.baseURL = config.apiUrl;
        this.apiKey = config.apiKey;
        this.timeout = config.timeout || 30000;
        this.retry = config.retry || {
            maxAttempts: 3,
            delayMs: 1000,
            statusCodesToRetry: [408, 429, 500, 502, 503, 504]
        };
        this.debug = config.debug || false;
    }

    setTokens(tokens: AuthTokens) {
        this.tokens = tokens;
        this.saveTokensToStorage(tokens);
    }

    isAuthenticated(): AuthState {
        if (this.tokens?.accessToken) {
            return {
                isAuthenticated: true,
                accessToken: this.tokens.accessToken,
                expiresAt: Date.parse(this.tokens.expiresAt)
            };
        }

        // Check localStorage as fallback
        const storedTokens = this.loadTokensFromStorage();
        if (storedTokens) {
            this.tokens = storedTokens; // Update current tokens
            const expiresAt = Date.parse(storedTokens.expiresAt);
            if (expiresAt < Date.now()) {
                this.clearAuth();
                return { isAuthenticated: false };
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
        if (config.auth === 'bearer' && !this.tokens?.accessToken) {
            throw new BooklaError(
                'Authentication required for this endpoint',
                'AUTH_REQUIRED'
            );
        }
    }

    private async request<T>(config: RequestConfig & { auth: AuthType }): Promise<T> {
        this.validateAuth(config);

        let attempt = 0;

        while (attempt < this.retry.maxAttempts) {
            try {
                // Check for cancellation
                if (config.cancelToken?.cancelled) {
                    throw new BooklaError('Request cancelled', 'REQUEST_CANCELLED');
                }

                // Apply request interceptors
                const modifiedConfig = await this.interceptors.request.execute({
                    ...config,
                    headers: this.getHeaders(config)
                });

                // Make request
                if (this.debug) {
                    console.log(`[Bookla SDK] Making request:`, modifiedConfig);
                }

                const response = await fetch(`${this.baseURL}${config.url}`, {
                    method: config.method,
                    headers: modifiedConfig.headers,
                    body: config.data ? JSON.stringify(config.data) : undefined,
                    signal: AbortSignal.timeout(config.timeout || this.timeout)
                });

                // Handle response
                if (!response.ok) {
                    throw new BooklaError(
                        response.statusText,
                        'API_ERROR',
                        response.status
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
                    if (error.code === 'REQUEST_CANCELLED') {
                        throw error;
                    }

                    if (error.status === 401) {
                        const refreshed = await this.refreshToken();
                        if (!refreshed) {
                            throw new BooklaError(
                                'Token refresh failed',
                                'TOKEN_REFRESH_FAILED'
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
                        'Max retry attempts reached',
                        'MAX_RETRIES_EXCEEDED'
                    );
                }

                await new Promise(resolve =>
                    setTimeout(resolve, this.retry.delayMs * attempt)
                );
            }
        }

        throw new BooklaError('Request failed', 'REQUEST_FAILED');
    }

    private getHeaders(config: RequestConfig): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
        };

        if (config.auth === 'bearer' && this.tokens?.accessToken) {
            headers['Authorization'] = `Bearer ${this.tokens.accessToken}`;
        }

        return headers;
    }

    private async refreshToken(): Promise<boolean> {
        try {
            if (!this.tokens?.refreshToken) {
                return false;
            }

            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify({
                    refreshToken: this.tokens.refreshToken
                })
            });

            if (!response.ok) {
                return false;
            }

            const newTokens = await response.json();
            this.setTokens(newTokens);
            return true;
        } catch (error) {
            return false;
        }
    }

    async get<T>(endpoint: EndpointConfig, options?: RequestOptions): Promise<T> {
        return this.request<T>({
            method: 'GET',
            url: endpoint.path,
            auth: endpoint.auth,
            ...options
        });
    }

    async post<T>(endpoint: EndpointConfig, data?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>({
            method: 'POST',
            url: endpoint.path,
            data,
            auth: endpoint.auth,
            ...options
        });
    }

    createCancelToken(): CancelToken {
        return new CancelToken();
    }

    isCancelledError(error: any): boolean {
        return error instanceof BooklaError && error.code === 'REQUEST_CANCELLED';
    }
}