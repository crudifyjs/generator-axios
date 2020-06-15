import { Page, Pagination, ReadFilteredPageAPI } from '@crudifyjs/api';
import { AxiosInstance } from 'axios';

import { buildPath } from '@/helpers/path';

export interface ReadFilteredPageApiOptions<READ, FILTER> {
    axiosInstance: AxiosInstance;
    basePath: string;
    readFilteredPagePath?: string;
    readFilteredPageParams: (filter: FILTER, pagination: Pagination) => unknown;
    transformPageResponse?: (data: unknown) => Page<READ> | Promise<Page<READ>>;
}

export function generateReadFilteredPageAPI<READ, FILTER>(
    options: ReadFilteredPageApiOptions<READ, FILTER>,
): ReadFilteredPageAPI<READ, FILTER> {
    return {
        async readFilteredPage(filter: FILTER, pagination: Pagination): Promise<Page<READ>> {
            const response = await options.axiosInstance(buildPath(options.basePath, options.readFilteredPagePath), {
                method: 'GET',
                params: options.readFilteredPageParams(filter, pagination),
            });

            return options.transformPageResponse
                ? options.transformPageResponse(response.data)
                : response.data as Page<READ>;
        },
    };
}
