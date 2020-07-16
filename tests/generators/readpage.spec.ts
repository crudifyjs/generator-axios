import fc from 'fast-check';

import { generateReadPageAPI, ReadPageApiOptions } from '@/generators/readpage';
import { buildPath } from '@/helpers/path';

import { asJson, pageArb, paginationArb, paramsArb } from '../arbitraries';
import { useAxiosWithMock } from '../mocks';

const optionsArb = fc.record<Omit<ReadPageApiOptions<unknown>, 'axiosInstance'>>({
    basePath: fc.string(),
    readPagePath: fc.option(
        fc.string(),
        {
            nil: undefined,
        },
    ),
    readPageParams: fc.func(paramsArb),
    transformPageResponse: fc.option(
        fc.func(pageArb),
        {
            nil: undefined,
        },
    ),
});

test('should send request to base path if additional path not provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readPagePath === undefined),
        paginationArb,
        async (options, pagination) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadPageAPI({
                ...options,
                axiosInstance,
            }).readPage(pagination);

            expect(axiosMock.history.get[0].url).toEqual(options.basePath);
        },
    ));
});

test('should send request to combined path if additional path provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readPagePath !== undefined),
        paginationArb,
        async (options, pagination) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadPageAPI({
                ...options,
                axiosInstance,
            }).readPage(pagination);

            expect(axiosMock.history.get[0].url).toEqual(buildPath(options.basePath, options.readPagePath));
        },
    ));
});

test('should send params by params builder', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb,
        paginationArb,
        async (options, pagination) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);
            const expectedParams = options.readPageParams(pagination);

            await generateReadPageAPI({
                ...options,
                axiosInstance,
            }).readPage(pagination);

            expect(axiosMock.history.get[0].params).toEqual(expectedParams);
        },
    ));
});

test('should return original response data if exist and no transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformPageResponse === undefined),
        paginationArb,
        asJson(pageArb),
        async (options, pagination, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200, response);
            const expectedData = JSON.parse(response);

            const result = await generateReadPageAPI({
                ...options,
                axiosInstance,
            }).readPage(pagination);

            expect(result).toEqual(expectedData);
        },
    ));
});

test('should return transformed response data if exist and transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformPageResponse !== undefined),
        paginationArb,
        asJson(pageArb),
        async (options, pagination, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200, response);
            const expectedData = options.transformPageResponse!(JSON.parse(response));

            const result = await generateReadPageAPI({
                ...options,
                axiosInstance,
            }).readPage(pagination);

            expect(result).toEqual(expectedData);
        },
    ));
});
