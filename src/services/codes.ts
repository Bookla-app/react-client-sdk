import { HttpClient } from '../core/http-client';
import { RequestOptions } from '../types/config';
import { CodeValidateResponse } from '../types/responses';
import { ENDPOINTS } from '../constants/endpoints';

export class CodesService {
    constructor(private client: HttpClient) {}

    async validateCode(code: string, options?: RequestOptions): Promise<CodeValidateResponse> {
        return this.client.post<CodeValidateResponse>({
            ...ENDPOINTS.codes.validate,
            path: ENDPOINTS.codes.validate.path.replace('{code}', code)
        }, {}, options);
    }
}