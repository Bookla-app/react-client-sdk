import { HttpClient } from "../core/http-client";
import { z } from "zod";
import { RequestOptions } from "../types/config";
import {
  SubscriptionCartResponse,
  PurchaseSubscriptionsResponse,
  SubscriptionContract,
  CompanySubscription,
} from "../types/responses";
import { AddToCartRequest, RenewPurchasesRequest } from "../types/requests";
import { ENDPOINTS } from "../constants/endpoints";

export class ClientSubscriptionService {
  constructor(private client: HttpClient) {}

  private validateAddToCartRequest(data: AddToCartRequest) {
    const schema = z.object({
      items: z.array(
        z.object({
          subscriptionID: z.string().min(1),
        }),
      ),
    });

    return schema.parse(data);
  }

  private validateRenewRequest(data: RenewPurchasesRequest) {
    const schema = z.object({
      ids: z.array(z.string().min(1)),
    });

    return schema.parse(data);
  }

  async getCart(
    companyId: string,
    options?: RequestOptions,
  ): Promise<SubscriptionCartResponse> {
    return this.client.get<SubscriptionCartResponse>(
      {
        ...ENDPOINTS.subscriptions.cart.get,
        path: ENDPOINTS.subscriptions.cart.get.path.replace(
          "{companyId}",
          companyId,
        ),
      },
      options,
    );
  }

  async addToCart(
    companyId: string,
    data: AddToCartRequest,
    options?: RequestOptions,
  ): Promise<SubscriptionCartResponse> {
    this.validateAddToCartRequest(data);

    return this.client.post<SubscriptionCartResponse>(
      {
        ...ENDPOINTS.subscriptions.cart.add,
        path: ENDPOINTS.subscriptions.cart.add.path.replace(
          "{companyId}",
          companyId,
        ),
      },
      data,
      options,
    );
  }

  async removeFromCart(
    companyId: string,
    itemId: string,
    options?: RequestOptions,
  ): Promise<SubscriptionCartResponse> {
    return this.client.delete<SubscriptionCartResponse>(
      {
        ...ENDPOINTS.subscriptions.cart.remove,
        path: ENDPOINTS.subscriptions.cart.remove.path
          .replace("{companyId}", companyId)
          .replace("{itemId}", itemId),
      },
      options,
    );
  }

  async checkout(
    companyId: string,
    options?: RequestOptions,
  ): Promise<PurchaseSubscriptionsResponse> {
    return this.client.post<PurchaseSubscriptionsResponse>(
      {
        ...ENDPOINTS.subscriptions.cart.checkout,
        path: ENDPOINTS.subscriptions.cart.checkout.path.replace(
          "{companyId}",
          companyId,
        ),
      },
      undefined,
      options,
    );
  }

  async getPurchases(
    companyId: string,
    options?: RequestOptions,
  ): Promise<SubscriptionContract[]> {
    return this.client.get<SubscriptionContract[]>(
      {
        ...ENDPOINTS.subscriptions.purchases.list,
        path: ENDPOINTS.subscriptions.purchases.list.path.replace(
          "{companyId}",
          companyId,
        ),
      },
      options,
    );
  }

  async getPurchase(
    companyId: string,
    itemId: string,
    options?: RequestOptions,
  ): Promise<SubscriptionContract> {
    return this.client.get<SubscriptionContract>(
      {
        ...ENDPOINTS.subscriptions.purchases.get,
        path: ENDPOINTS.subscriptions.purchases.get.path
          .replace("{companyId}", companyId)
          .replace("{itemId}", itemId),
      },
      options,
    );
  }

  async renewPurchases(
    companyId: string,
    data: RenewPurchasesRequest,
    options?: RequestOptions,
  ): Promise<PurchaseSubscriptionsResponse> {
    this.validateRenewRequest(data);

    return this.client.post<PurchaseSubscriptionsResponse>(
      {
        ...ENDPOINTS.subscriptions.purchases.renew,
        path: ENDPOINTS.subscriptions.purchases.renew.path.replace(
          "{companyId}",
          companyId,
        ),
      },
      data,
      options,
    );
  }

  async getAvailableSubscriptions(
    companyId: string,
    ids?: string[],
    options?: RequestOptions,
  ): Promise<CompanySubscription[]> {
    const queryParams = ids ? `?ids=${ids.join(",")}` : "";

    return this.client.get<CompanySubscription[]>(
      {
        ...ENDPOINTS.subscriptions.available,
        path: `${ENDPOINTS.subscriptions.available.path.replace("{companyId}", companyId)}${queryParams}`,
      },
      options,
    );
  }
}
