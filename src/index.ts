import { HttpClient } from './core/http-client';
import { BookingsService } from './services/bookings';
import { ServicesService } from './services/services';
import { ResourcesService } from './services/resources';
import { SDKConfig, AuthTokens } from './types/config';
import {AuthState} from "./types/auth";

export class BooklaSDK {
    private readonly client: HttpClient;
    public bookings: BookingsService;
    public services: ServicesService;
    public resources: ResourcesService;

    constructor(config: SDKConfig) {
        this.client = new HttpClient(config);
        this.bookings = new BookingsService(this.client);
        this.services = new ServicesService(this.client);
        this.resources = new ResourcesService(this.client);
    }

    setAuthTokens(tokens: AuthTokens) {
        this.client.setTokens(tokens);
    }

    isAuthenticated(): AuthState {
        return this.client.isAuthenticated();
    }

    clearAuth(): void {
        return this.client.clearAuth();
    }

    get interceptors() {
        return this.client.interceptors;
    }

    createCancelToken() {
        return this.client.createCancelToken();
    }

    isCancelledError(error: any) {
        return this.client.isCancelledError(error);
    }
}

// Export types and classes
export * from './types/config';
export * from './types/errors';
export * from './core/cancel-token';