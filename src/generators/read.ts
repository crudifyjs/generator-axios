import { ReadAPI, ReadFilteredAPI } from '@crudifyjs/api';

import { generateReadFilteredListAPI, ReadFilteredListApiOptions } from '@/generators/readfilteredlist';
import { generateReadFilteredPageAPI, ReadFilteredPageApiOptions } from '@/generators/readfilteredpage';
import { generateReadListAPI, ReadListApiOptions } from '@/generators/readlist';
import { generateReadOneAPI, ReadOneApiOptions } from '@/generators/readone';
import { generateReadPageAPI, ReadPageApiOptions } from '@/generators/readpage';

export type ReadApiOptions<READ, ID> =
    ReadOneApiOptions<READ, ID>
    & ReadListApiOptions<READ>
    & ReadPageApiOptions<READ>;

export function generateReadAPI<READ,
    ID extends number | string = number>(
    options: ReadApiOptions<READ, ID>,
): ReadAPI<READ, ID> {
    return {
        ...generateReadOneAPI(options),
        ...generateReadListAPI(options),
        ...generateReadPageAPI(options),
    };
}

export type ReadFilteredApiOptions<READ, FILTER, ID> =
    ReadApiOptions<READ, ID>
    & ReadFilteredListApiOptions<READ, FILTER>
    & ReadFilteredPageApiOptions<READ, FILTER>;

export function generateReadFilteredAPI<READ,
    FILTER,
    ID extends number | string = number>(
    options: ReadFilteredApiOptions<READ, FILTER, ID>,
): ReadFilteredAPI<READ, FILTER, ID> {
    return {
        ...generateReadAPI(options),
        ...generateReadFilteredListAPI(options),
        ...generateReadFilteredPageAPI(options),
    };
}
