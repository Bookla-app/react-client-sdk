import { HttpClient } from "../core/http-client";
import { z } from "zod";
import { RequestOptions } from "../types/config";
import {
    PurchaseGiftCardResponse,
    GiftCardContract,
    CompanyGiftCard,
} from "../types/responses";
import {
  CreatGiftCardPurchaseRequest,
} from "../types/requests";
import { ENDPOINTS } from "../constants/endpoints";

export class ClientGiftCardsService {
  constructor(private client: HttpClient) {}

  async getPurchases(
    companyId: string,
    options?: RequestOptions,
  ): Promise<GiftCardContract[]> {
    return this.client.get<GiftCardContract[]>(
      {
        ...ENDPOINTS.giftCards.purchases.list,
        path: ENDPOINTS.giftCards.purchases.list.path.replace(
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
  ): Promise<GiftCardContract> {
    return this.client.get<GiftCardContract>(
      {
        ...ENDPOINTS.giftCards.purchases.get,
        path: ENDPOINTS.giftCards.purchases.get.path
          .replace("{companyId}", companyId)
          .replace("{itemId}", itemId),
      },
      options,
    );
  }

  async getAvailableGiftCards(
    companyId: string,
    ids?: string[],
    options?: RequestOptions,
  ): Promise<CompanyGiftCard[]> {
    const queryParams = ids ? `?ids=${ids.join(",")}` : "";

    return this.client.get<CompanyGiftCard[]>(
      {
        ...ENDPOINTS.giftCards.available,
        path: `${ENDPOINTS.giftCards.available.path.replace("{companyId}", companyId)}${queryParams}`,
      },
      options,
    );
  }

  async createPurchase(
    companyId: string,
    data: CreatGiftCardPurchaseRequest,
    options?: RequestOptions,
  ): Promise<PurchaseGiftCardResponse> {
    const schema = z.object({
      giftCardID: z.string().min(1),
      metaData: z.record(z.unknown()).optional(),
      client: z
        .object({
          id: z.string().optional(),
          booklaID: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().email().optional(),
        })
        .nullish(),
    });
    const validatedData = schema.parse(data);
    return this.client.post<PurchaseGiftCardResponse>(
      {
        ...ENDPOINTS.giftCards.purchases.create,
        path: ENDPOINTS.giftCards.purchases.create.path.replace(
          "{companyId}",
          companyId,
        ),
      },
      validatedData,
      options,
    );
  }
}
