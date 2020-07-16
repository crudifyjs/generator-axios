import fc from 'fast-check';

import { generateReadFilteredPageAPI, ReadFilteredPageApiOptions } from '@/generators/readfilteredpage';
import { buildPath } from '@/helpers/path';

import {
    asJson, filterArb, pageArb, paginationArb, paramsArb,
} from '../arbitraries';
import { useAxiosWithMock } from '../mocks';

const optionsArb = fc.record<Omit<ReadFilteredPageApiOptions<unknown, unknown>, 'axiosInstance'>>({
    basePath: fc.string(),
    readFilteredPagePath: fc.option(
        fc.string(),
        {
            nil: undefined,
        },
    ),
    readFilteredPageParams: fc.func(paramsArb),
    transformPageResponse: fc.option(
        fc.func(pageArb),
        {
            nil: undefined,
        },
    ),
});

test('should send request to base path if additional path not provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readFilteredPagePath === undefined),
        filterArb,
        paginationArb,
        async (options, filter, pagination) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadFilteredPageAPI({
                ...options,
                axiosInstance,
            }).readFilteredPage(filter, pagination);

            expect(axiosMock.history.get[0].url).toEqual(options.basePath);
        },
    ));
});

test('should send request to combined path if additional path provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readFilteredPagePath !== undefined),
        filterArb,
        paginationArb,
        async (options, filter, pagination) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadFilteredPageAPI({
                ...options,
                axiosInstance,
            }).readFilteredPage(filter, pagination);

            expect(axiosMock.history.get[0].url).toEqual(buildPath(options.basePath, options.readFilteredPagePath));
        },
    ));
});

test('should send params by params builder', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb,
        filterArb,
        paginationArb,
        async (options, filter, pagination) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);
            const expectedParams = options.readFilteredPageParams(filter, pagination);

            await generateReadFilteredPageAPI({
                ...options,
                axiosInstance,
            }).readFilteredPage(filter, pagination);

            expect(axiosMock.history.get[0].params).toEqual(expectedParams);
        },
    ));
});

test('should return original response data if exist and no transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformPageResponse === undefined),
        filterArb,
        paginationArb,
        asJson(pageArb),
        async (options, filter, pagination, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200, response);
            const expectedData = JSON.parse(response);

            const result = await generateReadFilteredPageAPI({
                ...options,
                axiosInstance,
            }).readFilteredPage(filter, pagination);

            expect(result).toEqual(expectedData);
        },
    ));
});

test('should return transformed response data if exist and transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformPageResponse !== undefined),
        filterArb,
        paginationArb,
        asJson(pageArb),
        async (options, filter, pagination, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200, response);
            const expectedData = options.transformPageResponse!(JSON.parse(response));

            const result = await generateReadFilteredPageAPI({
                ...options,
                axiosInstance,
            }).readFilteredPage(filter, pagination);

            expect(result).toEqual(expectedData);
        },
    ));
});
