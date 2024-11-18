import { HttpClient } from '../core/http-client';
import { RequestOptions } from '../types/config';
import {ResourceResponse} from "../types/responses";
import {ENDPOINTS} from "../constants/endpoints";

export class ResourcesService {
    constructor(private client: HttpClient) {}

    async list(companyId: string, options?: RequestOptions): Promise<ResourceResponse[]> {
        return this.client.get({
            ...ENDPOINTS.resources.list,
            path: ENDPOINTS.resources.list.path.replace('{companyId}', companyId),
        }, options);
    }

    async get(
        companyId: string,
        resourceId: string,
        options?: RequestOptions
    ): Promise<ResourceResponse> {
        return this.client.get({
            ...ENDPOINTS.resources.get,
            path: ENDPOINTS.resources.get.path.replace('{companyId}', companyId).replace('{id}', resourceId),
        }, options);
    }
}