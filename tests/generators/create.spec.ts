import fc from 'fast-check';

import { CreateApiOptions, generateCreateAPI } from '@/generators/create';
import { buildPath } from '@/helpers/path';

import { asJson, requestArb, responseObjectArb } from '../arbitraries';
import { useAxiosWithMock } from '../mocks';

const optionsArb = fc.record<Omit<CreateApiOptions<unknown, unknown>, 'axiosInstance'>>({
    basePath: fc.string(),
    createPath: fc.option(
        fc.string(),
        {
            nil: undefined,
        },
    ),
    transformCreateRequest: fc.option(
        fc.func(requestArb),
        {
            nil: undefined,
        },
    ),
    transformCreateResponse: fc.option(
        fc.func(responseObjectArb),
        {
            nil: undefined,
        },
    ),
});

test('should send request to base path if additional path not provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.createPath === undefined),
        requestArb,
        async (options, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPost().replyOnce(200);

            await generateCreateAPI({
                ...options,
                axiosInstance,
            }).create(request);

            expect(axiosMock.history.post[0].url).toEqual(options.basePath);
        },
    ));
});

test('should send request to combined path if additional path provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.createPath !== undefined),
        requestArb,
        async (options, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPost().replyOnce(200);

            await generateCreateAPI({
                ...options,
                axiosInstance,
            }).create(request);

            expect(axiosMock.history.post[0].url).toEqual(buildPath(options.basePath, options.createPath));
        },
    ));
});

test('should send original request if no transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformCreateRequest === undefined),
        requestArb,
        async (options, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPost().replyOnce(200);

            await generateCreateAPI({
                ...options,
                axiosInstance,
            }).create(request);

            expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(request));
        },
    ));
});

test('should send transformed request if transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformCreateRequest !== undefined),
        requestArb,
        async (options, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPost().replyOnce(200);
            const expectedData = options.transformCreateRequest!(request);

            await generateCreateAPI({
                ...options,
                axiosInstance,
            }).create(request);

            expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(expectedData));
        },
    ));
});

test('should return original response data if exist and no transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformCreateResponse === undefined),
        requestArb,
        asJson(responseObjectArb),
        async (options, request, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPost().replyOnce(200, response);
            const expectedData = JSON.parse(response);

            const result = await generateCreateAPI({
                ...options,
                axiosInstance,
            }).create(request);

            expect(result).toEqual(expectedData);
        },
    ));
});

test('should return transformed response data if exist and transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformCreateResponse !== undefined),
        requestArb,
        asJson(responseObjectArb),
        async (options, request, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPost().replyOnce(200, response);
            const expectedData = options.transformCreateResponse!(JSON.parse(response));

            const result = await generateCreateAPI({
                ...options,
                axiosInstance,
            }).create(request);

            expect(result).toEqual(expectedData);
        },
    ));
});
