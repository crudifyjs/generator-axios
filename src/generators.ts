import { DeleteAPI } from '@crudifyjs/api';
import { AxiosInstance } from 'axios';

export interface DeleteApiOptions<ID> {
    axiosInstance: AxiosInstance;
    baseUrl: string;
    deletePath?: ((id: ID) => string) | string | false;
    deleteParams?: (id: ID) => unknown;
}

export function generateDeleteAPI<ID extends number | string>(
    options: DeleteApiOptions<ID>,
): DeleteAPI<ID> {
    return {
        async delete(id: ID): Promise<void> {
            let path: string;
            if (typeof options.deletePath === 'string') {
                path = options.deletePath;
            } else if (typeof options.deletePath === 'function') {
                path = options.deletePath(id);
            } else if (options.deletePath === undefined) {
                path = `${id}`;
            } else {
                path = '';
            }

            const params = options.deleteParams?.(id);

            await options.axiosInstance({
                method: 'DELETE',
                baseURL: options.baseUrl,
                url: path,
                params,
            });
        },
    };
}
