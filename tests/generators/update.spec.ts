import fc from 'fast-check';

import { generateUpdateAPI, UpdateApiOptions } from '@/generators/update';
import { buildPath } from '@/helpers/path';

import { asJson, idArb, paramsArb, requestArb, responseObjectArb } from '../arbitraries';
import { useAxiosWithMock } from '../mocks';

const optionsArb = fc.record<Omit<UpdateApiOptions<unknown, unknown, unknown>, 'axiosInstance'>>({
    basePath: fc.string(),
    updatePath: fc.option(
        fc.oneof(
            fc.func(fc.string()),
            fc.string(),
            fc.constant(false as const),
        ),
        {
            nil: undefined,
        },
    ),
    updateParams: fc.option(
        fc.func(paramsArb),
        {
            nil: undefined,
        },
    ),
    transformUpdateRequest: fc.option(
        fc.func(requestArb),
        {
            nil: undefined,
        },
    ),
    transformUpdateResponse: fc.option(
        fc.func(responseObjectArb),
        {
            nil: undefined,
        },
    ),
});

test('should send request to path with id if additional path not provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.updatePath === undefined),
        idArb,
        requestArb,
        async (options, id, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPut().replyOnce(200);

            await generateUpdateAPI({
                ...options,
                axiosInstance,
            }).update(id, request);

            expect(axiosMock.history.put[0].url).toEqual(buildPath(options.basePath, `${id}`));
        },
    ));
});

test('should send request to combined path if additional path provided as string', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => typeof options.updatePath === 'string'),
        idArb,
        requestArb,
        async (options, id, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPut().replyOnce(200);

            await generateUpdateAPI({
                ...options,
                axiosInstance,
            }).update(id, request);

            expect(axiosMock.history.put[0].url).toEqual(buildPath(options.basePath, options.updatePath as string));
        },
    ));
});

test('should send request to combined path if additional path builder provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => typeof options.updatePath === 'function'),
        idArb,
        requestArb,
        async (options, id, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPut().replyOnce(200);
            const expectedAdditionalPath = (options.updatePath as (id: number) => string)(id);

            await generateUpdateAPI({
                ...options,
                axiosInstance,
            }).update(id, request);

            expect(axiosMock.history.put[0].url).toEqual(buildPath(options.basePath, expectedAdditionalPath));
        },
    ));
});

test('should send request to base path if additional path is disabled', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.updatePath === false),
        idArb,
        requestArb,
        async (options, id, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPut().replyOnce(200);

            await generateUpdateAPI({
                ...options,
                axiosInstance,
            }).update(id, request);

            expect(axiosMock.history.put[0].url).toEqual(options.basePath);
        },
    ));
});

test('should not send params if no params builder provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.updateParams === undefined),
        idArb,
        requestArb,
        async (options, id, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPut().replyOnce(200);

            await generateUpdateAPI({
                ...options,
                axiosInstance,
            }).update(id, request);

            expect(axiosMock.history.put[0].params).toBeUndefined();
        },
    ));
});

test('should send params if params builder provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.updateParams !== undefined),
        idArb,
        requestArb,
        async (options, id, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPut().replyOnce(200);
            const params = options.updateParams!(id);

            await generateUpdateAPI({
                ...options,
                axiosInstance,
            }).update(id, request);

            expect(axiosMock.history.put[0].params).toEqual(params);
        },
    ));
});

test('should send original request if no transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformUpdateRequest === undefined),
        idArb,
        requestArb,
        async (options, id, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPut().replyOnce(200);

            await generateUpdateAPI({
                ...options,
                axiosInstance,
            }).update(id, request);

            expect(axiosMock.history.put[0].data).toEqual(JSON.stringify(request));
        },
    ));
});

test('should send transformed request if transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformUpdateRequest !== undefined),
        idArb,
        requestArb,
        async (options, id, request) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPut().replyOnce(200);
            const expectedData = options.transformUpdateRequest!(request);

            await generateUpdateAPI({
                ...options,
                axiosInstance,
            }).update(id, request);

            expect(axiosMock.history.put[0].data).toEqual(JSON.stringify(expectedData));
        },
    ));
});

test('should return original response data if exist and no transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformUpdateResponse === undefined),
        idArb,
        requestArb,
        asJson(responseObjectArb),
        async (options, id, request, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPut().replyOnce(200, response);
            const expectedData = JSON.parse(response);

            const result = await generateUpdateAPI({
                ...options,
                axiosInstance,
            }).update(id, request);

            expect(result).toEqual(expectedData);
        },
    ));
});

test('should return transformed response data if exist and transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformUpdateResponse !== undefined),
        idArb,
        requestArb,
        asJson(responseObjectArb),
        async (options, id, request, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onPut().replyOnce(200, response);
            const expectedData = options.transformUpdateResponse!(JSON.parse(response));

            const result = await generateUpdateAPI({
                ...options,
                axiosInstance,
            }).update(id, request);

            expect(result).toEqual(expectedData);
        },
    ));
});
