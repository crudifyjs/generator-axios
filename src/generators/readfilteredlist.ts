import { ReadFilteredListAPI } from '@crudifyjs/api';
import { AxiosInstance } from 'axios';

import { buildPath } from '@/helpers/path';

export interface ReadFilteredListApiOptions<READ, FILTER> {
    axiosInstance: AxiosInstance;
    basePath: string;
    readFilteredListPath?: string;
    readFilteredListParams: (filter: FILTER) => unknown;
    transformListResponse?: (data: unknown) => READ[] | Promise<READ[]>;
}

export function generateReadFilteredListAPI<READ, FILTER>(
    options: ReadFilteredListApiOptions<READ, FILTER>,
): ReadFilteredListAPI<READ, FILTER> {
    return {
        async readFilteredList(filter: FILTER): Promise<READ[]> {
            const response = await options.axiosInstance(buildPath(options.basePath, options.readFilteredListPath), {
                method: 'GET',
                params: options.readFilteredListParams(filter),
            });

            return options.transformListResponse
                ? options.transformListResponse(response.data)
                : response.data as READ[];
        },
    };
}
