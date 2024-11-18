import {CancelToken} from "../core/cancel-token";

export interface SDKConfig {
    apiUrl: string;
    apiKey: string;
    timeout?: number;
    debug?: boolean;
    retry?: {
        maxAttempts: number;
        delayMs: number;
        statusCodesToRetry: number[];
    };
    onTokenRefreshError?: (error: Error) => void;
}

export type AuthType = 'none' | 'bearer' | 'apiKey';

export interface EndpointConfig {
    auth: AuthType;
    path: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
}

export interface RequestConfig {
    method: string;
    url: string;
    auth: AuthType;
    data?: any;
    headers?: Record<string, string>;
    timeout?: number;
    cancelToken?: CancelToken;
}

export interface RequestOptions {
    cancelToken?: CancelToken;
}