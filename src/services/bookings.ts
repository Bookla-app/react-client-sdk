import { z } from "zod";
import { HttpClient } from "../core/http-client";
import { RequestOptions } from "../types/config";
import { RequestBookingRequest } from "../types/requests";
import { BookingListResponse, BookingResponse } from "../types/responses";
import { ENDPOINTS } from "../constants/endpoints";

export class BookingsService {
  constructor(private client: HttpClient) {}

  async list(options?: RequestOptions): Promise<BookingListResponse> {
    return this.client.get(ENDPOINTS.bookings.list, options);
  }

  async get(id: string, options?: RequestOptions): Promise<BookingResponse> {
    return this.client.get<BookingResponse>(
      {
        ...ENDPOINTS.bookings.get,
        path: ENDPOINTS.bookings.get.path.replace("{id}", id),
      },
      options,
    );
  }

  async request(
    data: RequestBookingRequest,
    options?: RequestOptions,
  ): Promise<BookingResponse> {
    this.validateCreateBookingRequest(data);
    return this.client.post(ENDPOINTS.bookings.create, data, options);
  }

  async cancel(bookingId: string, reason: string, options?: RequestOptions) {
    return this.client.post(
      {
        ...ENDPOINTS.bookings.cancel,
        path: ENDPOINTS.bookings.cancel.path.replace("{Id}", bookingId),
      },
      { reason },
      options,
    );
  }

  private validateCreateBookingRequest(data: RequestBookingRequest) {
    const schema = z.object({
      companyID: z.string().min(1),
      serviceID: z.string().min(1),
      resourceID: z.string().optional(),
      startTime: z.string().datetime(),
      spots: z.number().optional(),
      duration: z.string().optional(),
      metaData: z.record(z.unknown()).optional(),
      pluginData: z.record(z.unknown()).optional(),
      tickets: z.record(z.number()).optional(),
      customPurchaseDescription: z.string().optional(),
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

    return schema.parse(data);
  }
}
