import { CreateAPI } from '@crudifyjs/api';
import { AxiosInstance } from 'axios';

import { buildPath } from '@/helpers/path';

export interface CreateApiOptions<CREATE, RESULT> {
    axiosInstance: AxiosInstance;
    basePath: string;
    createPath?: string;
    transformCreateRequest?: (data: CREATE) => unknown | Promise<unknown>;
    transformCreateResponse?: (data: unknown) => RESULT | Promise<RESULT>;
}

export function generateCreateAPI<CREATE, RESULT = void>(
    options: CreateApiOptions<CREATE, RESULT>,
): CreateAPI<CREATE, RESULT> {
    return {
        async create(request: CREATE): Promise<RESULT> {
            const data = options.transformCreateRequest
                ? await Promise.resolve(options.transformCreateRequest(request))
                : request;

            const response = await options.axiosInstance(buildPath(options.basePath, options.createPath), {
                method: 'POST',
                data,
            });

            return options.transformCreateResponse
                ? options.transformCreateResponse(response.data)
                : response.data as RESULT;
        },
    };
}
