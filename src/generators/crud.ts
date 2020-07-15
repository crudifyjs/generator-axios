import { CreateAPI, DeleteAPI, ReadAPI, ReadFilteredAPI, UpdateAPI } from '@crudifyjs/api';

import { CreateApiOptions, generateCreateAPI } from '@/generators/create';
import { DeleteApiOptions, generateDeleteAPI } from '@/generators/delete';
import { generateReadAPI, generateReadFilteredAPI, ReadApiOptions, ReadFilteredApiOptions } from '@/generators/read';
import { generateUpdateAPI, UpdateApiOptions } from '@/generators/update';

export type CrudApiOptions<CREATE, READ, UPDATE, ID, CREATED, UPDATED> =
    CreateApiOptions<CREATE, CREATED>
    & ReadApiOptions<READ, ID>
    & UpdateApiOptions<UPDATE, ID, UPDATED>
    & DeleteApiOptions<ID>;

export function generateCrudAPI<CREATE,
    READ,
    UPDATE = CREATE,
    ID extends number | string = number,
    CREATED = void,
    UPDATED = void>(
    options: CrudApiOptions<CREATE, READ, UPDATE, ID, CREATED, UPDATED>,
): CreateAPI<CREATE, CREATED> & ReadAPI<READ, ID> & UpdateAPI<UPDATE, ID, UPDATED> & DeleteAPI<ID> {
    return {
        ...generateCreateAPI(options),
        ...generateReadAPI(options),
        ...generateUpdateAPI(options),
        ...generateDeleteAPI(options),
    };
}

export type CrudFilteredApiOptions<CREATE, READ, FILTER, UPDATE, ID, CREATED, UPDATED> =
    CreateApiOptions<CREATE, CREATED>
    & ReadFilteredApiOptions<READ, FILTER, ID>
    & UpdateApiOptions<UPDATE, ID, UPDATED>
    & DeleteApiOptions<ID>;

export function generateCrudFilteredAPI<CREATE,
    READ,
    FILTER,
    UPDATE = CREATE,
    ID extends number | string = number,
    CREATED = void,
    UPDATED = void>(
    options: CrudFilteredApiOptions<CREATE, READ, FILTER, UPDATE, ID, CREATED, UPDATED>,
): CreateAPI<CREATE, CREATED> & ReadFilteredAPI<READ, FILTER, ID> & UpdateAPI<UPDATE, ID, UPDATED> & DeleteAPI<ID> {
    return {
        ...generateCreateAPI(options),
        ...generateReadFilteredAPI(options),
        ...generateUpdateAPI(options),
        ...generateDeleteAPI(options),
    };
}
