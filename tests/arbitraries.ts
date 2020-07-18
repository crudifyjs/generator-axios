import { Page, Pagination } from '@crudifyjs/api';
import fc from 'fast-check';
import deepEqual from 'fast-deep-equal';

export const positiveIntegerArb = fc.nat().filter(number => number > 0);

export const idArb = positiveIntegerArb;

export const requestArb = fc.object()
    .filter(object => deepEqual(object, JSON.parse(JSON.stringify(object))));

export const responseObjectArb = fc.jsonObject();
export const responseArrayArb = fc.array(fc.jsonObject().filter(object => !Array.isArray(object)));

export const paramsArb = fc.dictionary(fc.string().filter(string => string.length > 0), fc.string());

export const paginationArb = fc.record<Pagination>({
    page: positiveIntegerArb,
    rowsPerPage: positiveIntegerArb,
    sortBy: fc.array(fc.string().filter(string => string.length > 0)),
    descending: fc.array(fc.boolean()),
});

export const pageArb = fc.record<Page<unknown>>({
    content: responseArrayArb,
    totalElements: positiveIntegerArb,
    totalPages: positiveIntegerArb,
});

export const filterArb = fc.dictionary(fc.string().filter(string => string.length > 0), fc.anything());

export function asJson(arbitrary: fc.Arbitrary<unknown>) {
    return arbitrary.map(object => JSON.stringify(object));
}
