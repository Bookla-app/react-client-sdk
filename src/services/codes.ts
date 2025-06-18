import { z } from "zod";
import { HttpClient } from "../core/http-client";
import { RequestOptions } from "../types/config";
import { CodeValidateResponse } from "../types/responses";
import { CodeValidateRequest } from "../types/requests";
import { ENDPOINTS } from "../constants/endpoints";

export class CodesService {
  constructor(private client: HttpClient) {}

  async validateCode(
    code: string,
    data: CodeValidateRequest,
    options?: RequestOptions,
  ): Promise<CodeValidateResponse> {
    this.validateCodeRequest(data);
    return this.client.post<CodeValidateResponse>(
      {
        ...ENDPOINTS.codes.validate,
        path: ENDPOINTS.codes.validate.path.replace("{code}", code),
      },
      data,
      options,
    );
  }

  private validateCodeRequest(data: CodeValidateRequest) {
    const schema = z.object({
      companyID: z.string().min(1),
      serviceID: z.string().min(1),
      resourceID: z.string().min(1),
      startTime: z.string().datetime(),
      duration: z.string().optional(),
      spots: z.number().min(1),
      tickets: z.record(z.number()).optional(),
    });

    return schema.parse(data);
  }
}
