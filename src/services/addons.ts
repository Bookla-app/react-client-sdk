import { HttpClient } from "../core/http-client";
import { z } from "zod";
import { RequestOptions } from "../types/config";
import {
  DiscoverAddonsResponse,
  ValidateAddonsResponse,
} from "../types/responses";
import { ValidateAddonsRequest } from "../types/requests";
import { ENDPOINTS } from "../constants/endpoints";

export class ClientAddonsService {
  constructor(private client: HttpClient) {}

  private validateAddonsRequest(data: ValidateAddonsRequest) {
    const schema = z.object({
      addons: z.array(
        z.object({
          addonID: z.string().min(1),
          quantity: z.number().min(1),
          metadata: z.record(z.unknown()).optional(),
        }),
      ),
    });

    return schema.parse(data);
  }

  async discoverAddons(
    companyId: string,
    serviceId: string,
    options?: RequestOptions,
  ): Promise<DiscoverAddonsResponse> {
    return this.client.get<DiscoverAddonsResponse>(
      {
        ...ENDPOINTS.addons.discover,
        path: ENDPOINTS.addons.discover.path
          .replace("{companyId}", companyId)
          .replace("{serviceId}", serviceId),
      },
      options,
    );
  }

  async validateAddons(
    companyId: string,
    serviceId: string,
    data: ValidateAddonsRequest,
    options?: RequestOptions,
  ): Promise<ValidateAddonsResponse> {
    this.validateAddonsRequest(data);

    return this.client.post<ValidateAddonsResponse>(
      {
        ...ENDPOINTS.addons.validate,
        path: ENDPOINTS.addons.validate.path
          .replace("{companyId}", companyId)
          .replace("{serviceId}", serviceId),
      },
      data,
      options,
    );
  }
}
