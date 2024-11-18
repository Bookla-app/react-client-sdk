import {AuthTokens} from "../types/config";

export const storage = {
  setTokens(tokens: AuthTokens) {
    localStorage.setItem('bookla_access_token', tokens.accessToken);
    localStorage.setItem('bookla_refresh_token', tokens.refreshToken);
    localStorage.setItem('bookla_expires_at', tokens.expiresAt);
  },

  getTokens(): AuthTokens | null {
    const accessToken = localStorage.getItem('bookla_access_token');
    const refreshToken = localStorage.getItem('bookla_refresh_token');
    const expiresAt = localStorage.getItem('bookla_expires_at');

    if (accessToken && refreshToken && expiresAt) {
      return { accessToken, refreshToken, expiresAt};
    }

    return null;
  },

  clearTokens() {
    localStorage.removeItem('bookla_access_token');
    localStorage.removeItem('bookla_refresh_token');
    localStorage.removeItem('bookla_expires_at');
  }
};