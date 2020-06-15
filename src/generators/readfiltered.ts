import { ReadFilteredAPI } from '@crudifyjs/api';

import { generateReadAPI, ReadApiOptions } from '@/generators/read';
import { generateReadFilteredListAPI, ReadFilteredListApiOptions } from '@/generators/readfilteredlist';
import { generateReadFilteredPageAPI, ReadFilteredPageApiOptions } from '@/generators/readfilteredpage';

export type ReadFilteredApiOptions<READ, FILTER, ID> =
    ReadApiOptions<READ, ID>
    & ReadFilteredListApiOptions<READ, FILTER>
    & ReadFilteredPageApiOptions<READ, FILTER>;

export function generateReadFilteredAPI<READ, FILTER, ID extends number | string>(options: ReadFilteredApiOptions<READ, FILTER, ID>): ReadFilteredAPI<READ, FILTER, ID> {
    return {
        ...generateReadAPI(options),
        ...generateReadFilteredListAPI(options),
        ...generateReadFilteredPageAPI(options),
    };
}
