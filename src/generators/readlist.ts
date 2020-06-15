import { ReadListAPI } from '@crudifyjs/api';
import { AxiosInstance } from 'axios';

import { buildPath } from '@/helpers/path';

export interface ReadListApiOptions<READ> {
    axiosInstance: AxiosInstance;
    basePath: string;
    readListPath?: string;
    readListParams?: unknown;
    transformListResponse?: (data: unknown) => READ[] | Promise<READ[]>;
}

export function generateReadListAPI<READ>(
    options: ReadListApiOptions<READ>,
): ReadListAPI<READ> {
    return {
        async readList(): Promise<READ[]> {
            const response = await options.axiosInstance(buildPath(options.basePath, options.readListPath), {
                method: 'GET',
                params: options.readListParams,
            });

            return options.transformListResponse
                ? options.transformListResponse(response.data)
                : response.data as READ[];
        },
    };
}
