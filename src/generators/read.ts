import { ReadAPI } from '@crudifyjs/api';

import { generateReadListAPI, ReadListApiOptions } from '@/generators/readlist';
import { generateReadOneAPI, ReadOneApiOptions } from '@/generators/readone';
import { generateReadPageAPI, ReadPageApiOptions } from '@/generators/readpage';

export type ReadApiOptions<READ, ID> =
    ReadOneApiOptions<READ, ID>
    & ReadListApiOptions<READ>
    & ReadPageApiOptions<READ>;

export function generateReadAPI<READ, ID extends number | string>(options: ReadApiOptions<READ, ID>): ReadAPI<READ, ID> {
    return {
        ...generateReadOneAPI(options),
        ...generateReadListAPI(options),
        ...generateReadPageAPI(options),
    };
}
