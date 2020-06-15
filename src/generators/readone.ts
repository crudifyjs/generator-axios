import { ReadOneAPI } from '@crudifyjs/api';
import { AxiosInstance } from 'axios';

import { buildPath } from '@/helpers/path';

export interface ReadOneApiOptions<READ, ID> {
    axiosInstance: AxiosInstance;
    basePath: string;
    readOnePath?: ((id: ID) => string) | string | false;
    readOneParams?: (id: ID) => unknown;
    transformOneResponse?: (data: unknown) => READ | Promise<READ>;
}

export function generateReadOneAPI<READ, ID extends number | string>(
    options: ReadOneApiOptions<READ, ID>,
): ReadOneAPI<READ, ID> {
    return {
        async readOne(id: ID): Promise<READ> {
            let path: string | undefined;
            if (typeof options.readOnePath === 'string') {
                path = options.readOnePath;
            } else if (typeof options.readOnePath === 'function') {
                path = options.readOnePath(id);
            } else if (options.readOnePath === undefined) {
                path = `${id}`;
            }

            const params = options.readOneParams?.(id);

            const response = await options.axiosInstance(buildPath(options.basePath, path), {
                method: 'GET',
                params,
            });

            return options.transformOneResponse
                ? options.transformOneResponse(response.data)
                : response.data as READ;
        },
    };
}
