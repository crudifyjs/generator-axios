import fc from 'fast-check';

import { generateReadOneAPI, ReadOneApiOptions } from '@/generators/readone';
import { buildPath } from '@/helpers/path';

import { asJson, idArb, paramsArb, responseObjectArb } from '../arbitraries';
import { useAxiosWithMock } from '../mocks';

const optionsArb = fc.record<Omit<ReadOneApiOptions<unknown, unknown>, 'axiosInstance'>>({
    basePath: fc.string(),
    readOnePath: fc.option(
        fc.oneof(
            fc.func(fc.string()),
            fc.string(),
            fc.constant(false as const),
        ),
        {
            nil: undefined,
        },
    ),
    readOneParams: fc.option(
        fc.func(paramsArb),
        {
            nil: undefined,
        },
    ),
    transformOneResponse: fc.option(
        fc.func(responseObjectArb),
        {
            nil: undefined,
        },
    ),
});

test('should send request to path with id if additional path not provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readOnePath === undefined),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadOneAPI({
                ...options,
                axiosInstance,
            }).readOne(id);

            expect(axiosMock.history.get[0].url).toEqual(buildPath(options.basePath, `${id}`));
        },
    ));
});

test('should send request to combined path if additional path provided as string', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => typeof options.readOnePath === 'string'),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadOneAPI({
                ...options,
                axiosInstance,
            }).readOne(id);

            expect(axiosMock.history.get[0].url).toEqual(buildPath(options.basePath, options.readOnePath as string));
        },
    ));
});

test('should send request to combined path if additional path builder provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => typeof options.readOnePath === 'function'),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);
            const expectedAdditionalPath = (options.readOnePath as (id: number) => string)(id);

            await generateReadOneAPI({
                ...options,
                axiosInstance,
            }).readOne(id);

            expect(axiosMock.history.get[0].url).toEqual(buildPath(options.basePath, expectedAdditionalPath));
        },
    ));
});

test('should send request to base path if additional path is disabled', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readOnePath === false),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadOneAPI({
                ...options,
                axiosInstance,
            }).readOne(id);

            expect(axiosMock.history.get[0].url).toEqual(options.basePath);
        },
    ));
});

test('should not send params if no params builder provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readOneParams === undefined),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);

            await generateReadOneAPI({
                ...options,
                axiosInstance,
            }).readOne(id);

            expect(axiosMock.history.get[0].params).toBeUndefined();
        },
    ));
});

test('should send params if params builder provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.readOneParams !== undefined),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200);
            const params = options.readOneParams!(id);

            await generateReadOneAPI({
                ...options,
                axiosInstance,
            }).readOne(id);

            expect(axiosMock.history.get[0].params).toEqual(params);
        },
    ));
});

test('should return original response data if no transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformOneResponse === undefined),
        idArb,
        asJson(responseObjectArb),
        async (options, id, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200, response);
            const expectedData = JSON.parse(response);

            const result = await generateReadOneAPI({
                ...options,
                axiosInstance,
            }).readOne(id);

            expect(result).toEqual(expectedData);
        },
    ));
});

test('should return transformed response data if transformer provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.transformOneResponse !== undefined),
        idArb,
        asJson(responseObjectArb),
        async (options, id, response) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onGet().replyOnce(200, response);
            const expectedData = options.transformOneResponse!(JSON.parse(response));

            const result = await generateReadOneAPI({
                ...options,
                axiosInstance,
            }).readOne(id);

            expect(result).toEqual(expectedData);
        },
    ));
});
