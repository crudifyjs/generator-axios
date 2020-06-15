import { UpdateAPI } from '@crudifyjs/api';
import { AxiosInstance } from 'axios';

import { buildPath } from '@/helpers/path';

export interface UpdateApiOptions<UPDATE, ID, RESULT> {
    axiosInstance: AxiosInstance;
    basePath: string;
    updatePath?: ((id: ID) => string) | string | false;
    updateParams?: (id: ID) => unknown;
    transformUpdateRequest?: (data: UPDATE) => unknown | Promise<unknown>;
    transformUpdateResponse?: (data: unknown) => RESULT | Promise<RESULT>;
}

export function generateUpdateAPI<UPDATE, ID extends number | string, RESULT = void>(
    options: UpdateApiOptions<UPDATE, ID, RESULT>,
): UpdateAPI<UPDATE, ID, RESULT> {
    return {
        async update(id: ID, request: UPDATE): Promise<RESULT> {
            let path: string;
            if (typeof options.updatePath === 'string') {
                path = options.updatePath;
            } else if (typeof options.updatePath === 'function') {
                path = options.updatePath(id);
            } else if (options.updatePath === undefined) {
                path = `${id}`;
            } else {
                path = '';
            }

            const params = options.updateParams?.(id);

            const data = options.transformUpdateRequest
                ? await Promise.resolve(options.transformUpdateRequest(request))
                : request;

            const response = await options.axiosInstance(buildPath(options.basePath, path), {
                method: 'PUT',
                params,
                data,
            });

            return options.transformUpdateResponse
                ? options.transformUpdateResponse(response.data)
                : response.data as RESULT;
        },
    };
}
