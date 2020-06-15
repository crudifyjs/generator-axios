import fc from 'fast-check';

import { generateReadFilteredListAPI, ReadFilteredListApiOptions } from '@/generators/readfilteredlist';
import { buildPath } from '@/helpers/path';

import { asJson, filterArb, paramsArb, responseArrayArb } from '../arbitraries';
import { useAxiosWithMock } from '../mocks';

const optionsArb = fc.record<Omit<ReadFilteredListApiOptions<unknown, unknown>, 'axiosInstance'>>({
    basePath: fc.string(),
    readFilteredListPath: fc.option(
        fc.string(),
        {
            nil: undefined,
        },
    ),
    readFilteredListParams: fc.func(paramsArb),
    transformListResponse: fc.option(
        fc.func(responseArrayArb),
        {
            nil: undefined,
        },
    ),
});

test('should send request to base path if additional path not provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readFilteredListPath === undefined),
        filterArb,
        async (options, filter) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadFilteredListAPI({
                ...options,
                axiosInstance,
            }).readFilteredList(filter);

            expect(axiosMock.history.get[0].url).toEqual(options.basePath);
        },
    ));
});

test('should send request to combined path if additional path provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readFilteredListPath !== undefined),
        filterArb,
        async (options, filter) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadFilteredListAPI({
                ...options,
                axiosInstance,
            }).readFilteredList(filter);

            expect(axiosMock.history.get[0].url).toEqual(buildPath(options.basePath, options.readFilteredListPath));
        },
    ));
});

test('should send params by params builder', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb,
        filterArb,
        async (options, filter) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);
            const expectedParams = options.readFilteredListParams(filter);

            await generateReadFilteredListAPI({
                ...options,
                axiosInstance,
            }).readFilteredList(filter);

            expect(axiosMock.history.get[0].params).toEqual(expectedParams);
        },
    ));
});

test('should return original response data if exist and no transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformListResponse === undefined),
        filterArb,
        asJson(responseArrayArb),
        async (options, filter, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200, response);
            const expectedData = JSON.parse(response);

            const result = await generateReadFilteredListAPI({
                ...options,
                axiosInstance,
            }).readFilteredList(filter);

            expect(result).toEqual(expectedData);
        },
    ));
});

test('should return transformed response data if exist and transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformListResponse !== undefined),
        filterArb,
        asJson(responseArrayArb),
        async (options, filter, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200, response);
            const expectedData = options.transformListResponse!(JSON.parse(response));

            const result = await generateReadFilteredListAPI({
                ...options,
                axiosInstance,
            }).readFilteredList(filter);

            expect(result).toEqual(expectedData);
        },
    ));
});
