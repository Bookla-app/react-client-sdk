import { HttpClient } from '../core/http-client';
import { z } from 'zod';
import { RequestOptions } from '../types/config';
import {ServiceResponse, TimesResponse} from "../types/responses";
import {GetTimesRequest} from "../types/requests";
import {ENDPOINTS} from "../constants/endpoints";

export class ServicesService {
    constructor(private client: HttpClient) {}

    async list(companyId: string, options?: RequestOptions): Promise<ServiceResponse[]> {
        return this.client.get<ServiceResponse[]>({
            ...ENDPOINTS.services.list,
            path: ENDPOINTS.services.list.path.replace('{companyId}', companyId)
        }, options);
    }

    async get(companyId: string, serviceId: string, options?: RequestOptions): Promise<ServiceResponse> {
        return this.client.get({
            ...ENDPOINTS.services.list,
            path: ENDPOINTS.services.get.path.replace('{companyId}', companyId).replace('{id}', serviceId),
        }, options);
    }

    async getTimes(
        companyId: string,
        serviceId: string,
        data: GetTimesRequest,
        options?: RequestOptions
    ): Promise<TimesResponse> {
        this.validateGetTimesRequest(data);

        return this.client.post({
                ...ENDPOINTS.services.getTimes,
            path: ENDPOINTS.services.getTimes.path.replace('{companyId}', companyId).replace('{id}', serviceId),
        }, data, options);
    }

    private validateGetTimesRequest(data: GetTimesRequest) {
        const schema = z.object({
            from: z.string().datetime(),
            to: z.string().datetime(),
            duration: z.string().optional(),
            spots: z.number().optional(),
            resourceIDs: z.array(z.string()).optional(),
            tickets: z.record(z.number()).optional()
        });

        return schema.parse(data);
    }
}