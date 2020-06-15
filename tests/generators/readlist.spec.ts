import fc from 'fast-check';

import { generateReadListAPI, ReadListApiOptions } from '@/generators/readlist';
import { buildPath } from '@/helpers/path';

import { asJson, paramsArb, responseArrayArb } from '../arbitraries';
import { useAxiosWithMock } from '../mocks';

const optionsArb = fc.record<Omit<ReadListApiOptions<unknown>, 'axiosInstance'>>({
    basePath: fc.string(),
    readListPath: fc.option(
        fc.string(),
        {
            nil: undefined,
        },
    ),
    readListParams: fc.option(
        paramsArb,
        {
            nil: undefined,
        },
    ),
    transformListResponse: fc.option(
        fc.func(responseArrayArb),
        {
            nil: undefined,
        },
    ),
});

test('should send request to base path if additional path not provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readListPath === undefined),
        async (options) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadListAPI({
                ...options,
                axiosInstance,
            }).readList();

            expect(axiosMock.history.get[0].url).toEqual(options.basePath);
        },
    ));
});

test('should send request to combined path if additional path provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readListPath !== undefined),
        async (options) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadListAPI({
                ...options,
                axiosInstance,
            }).readList();

            expect(axiosMock.history.get[0].url).toEqual(buildPath(options.basePath, options.readListPath));
        },
    ));
});

test('should not send params if no params provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readListParams === undefined),
        async (options) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadListAPI({
                ...options,
                axiosInstance,
            }).readList();

            expect(axiosMock.history.get[0].params).toBeUndefined();
        },
    ));
});

test('should send params if params provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readListParams !== undefined),
        async (options) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadListAPI({
                ...options,
                axiosInstance,
            }).readList();

            expect(axiosMock.history.get[0].params).toEqual(options.readListParams);
        },
    ));
});

test('should return original response data if exist and no transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformListResponse === undefined),
        asJson(responseArrayArb),
        async (options, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200, response);
            const expectedData = JSON.parse(response);

            const result = await generateReadListAPI({
                ...options,
                axiosInstance,
            }).readList();

            expect(result).toEqual(expectedData);
        },
    ));
});

test('should return transformed response data if exist and transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformListResponse !== undefined),
        asJson(responseArrayArb),
        async (options, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200, response);
            const expectedData = options.transformListResponse!(JSON.parse(response));

            const result = await generateReadListAPI({
                ...options,
                axiosInstance,
            }).readList();

            expect(result).toEqual(expectedData);
        },
    ));
});
