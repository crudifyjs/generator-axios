import { Page, Pagination, ReadPageAPI } from '@crudifyjs/api';
import { AxiosInstance } from 'axios';

import { buildPath } from '@/helpers/path';

export interface ReadPageApiOptions<READ> {
    axiosInstance: AxiosInstance;
    basePath: string;
    readPagePath?: string;
    readPageParams: (pagination: Pagination) => unknown;
    transformPageResponse?: (data: unknown) => Page<READ> | Promise<Page<READ>>;
}

export function generateReadPageAPI<READ>(
    options: ReadPageApiOptions<READ>,
): ReadPageAPI<READ> {
    return {
        async readPage(pagination: Pagination): Promise<Page<READ>> {
            const response = await options.axiosInstance(buildPath(options.basePath, options.readPagePath), {
                method: 'GET',
                params: options.readPageParams(pagination),
            });

            return options.transformPageResponse
                ? options.transformPageResponse(response.data)
                : response.data as Page<READ>;
        },
    };
}
