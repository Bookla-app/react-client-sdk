import { HttpClient } from "./core/http-client";
import { BookingsService } from "./services/bookings";
import { ServicesService } from "./services/services";
import { ResourcesService } from "./services/resources";
import { CodesService } from "./services/codes";
import { SDKConfig, AuthTokens } from "./types/config";
import { AuthState } from "./types/auth";
import { ClientSubscriptionService } from "./services/subscriptions";
import { ClientGiftCardsService } from "./services/giftcards";
import { ClientAddonsService } from "./services/addons";

export class BooklaSDK {
  private readonly client: HttpClient;
  public bookings: BookingsService;
  public services: ServicesService;
  public resources: ResourcesService;
  public codes: CodesService;
  public subscriptions: ClientSubscriptionService;
  public giftCards: ClientGiftCardsService;
  public addons: ClientAddonsService;

  constructor(config: SDKConfig) {
    this.client = new HttpClient(config);
    this.bookings = new BookingsService(this.client);
    this.services = new ServicesService(this.client);
    this.resources = new ResourcesService(this.client);
    this.codes = new CodesService(this.client);
    this.subscriptions = new ClientSubscriptionService(this.client);
    this.giftCards = new ClientGiftCardsService(this.client);
    this.addons = new ClientAddonsService(this.client);
  }

  setAuthTokens(tokens: AuthTokens) {
    this.client.setTokens(tokens);
  }

  async isAuthenticated(): Promise<AuthState> {
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
export * from "./types/config";
export * from "./types/errors";
export * from "./core/cancel-token";
export * from "./types/responses";
export * from "./types/requests";
