export interface AuthState {
    isAuthenticated: boolean;
    accessToken?: string;
    expiresAt?: number;
}