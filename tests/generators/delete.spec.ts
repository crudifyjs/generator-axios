import fc from 'fast-check';

import { DeleteApiOptions, generateDeleteAPI } from '@/generators/delete';
import { buildPath } from '@/helpers/path';

import { asJson, idArb, paramsArb, requestArb, responseObjectArb } from '../arbitraries';
import { useAxiosWithMock } from '../mocks';

const optionsArb = fc.record<Omit<DeleteApiOptions<unknown>, 'axiosInstance'>>({
    basePath: fc.string(),
    deletePath: fc.option(
        fc.oneof(
            fc.func(fc.string()),
            fc.string(),
            fc.constant(false as const),
        ),
        {
            nil: undefined,
        },
    ),
    deleteParams: fc.option(
        fc.func(paramsArb),
        {
            nil: undefined,
        },
    ),
});

test('should send request to path with id if additional path not provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.deletePath === undefined),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onDelete().replyOnce(200);

            await generateDeleteAPI({
                ...options,
                axiosInstance,
            }).delete(id);

            expect(axiosMock.history.delete[0].url).toEqual(buildPath(options.basePath, `${id}`));
        },
    ));
});

test('should send request to combined path if additional path provided as string', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => typeof options.deletePath === 'string'),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onDelete().replyOnce(200);

            await generateDeleteAPI({
                ...options,
                axiosInstance,
            }).delete(id);

            expect(axiosMock.history.delete[0].url).toEqual(buildPath(options.basePath, options.deletePath as string));
        },
    ));
});

test('should send request to combined path if additional path builder provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => typeof options.deletePath === 'function'),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onDelete().replyOnce(200);
            const expectedAdditionalPath = (options.deletePath as (id: number) => string)(id);

            await generateDeleteAPI({
                ...options,
                axiosInstance,
            }).delete(id);

            expect(axiosMock.history.delete[0].url).toEqual(buildPath(options.basePath, expectedAdditionalPath));
        },
    ));
});

test('should send request to base path if additional path is disabled', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.deletePath === false),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onDelete().replyOnce(200);

            await generateDeleteAPI({
                ...options,
                axiosInstance,
            }).delete(id);

            expect(axiosMock.history.delete[0].url).toEqual(options.basePath);
        },
    ));
});

test('should not send params if no params builder provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.deleteParams === undefined),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onDelete().replyOnce(200);

            await generateDeleteAPI({
                ...options,
                axiosInstance,
            }).delete(id);

            expect(axiosMock.history.delete[0].params).toBeUndefined();
        },
    ));
});

test('should send params if params builder provided', async () => {
    await fc.assert(fc.asyncProperty(
        optionsArb.filter(options => options.deleteParams !== undefined),
        idArb,
        async (options, id) => {
            const [axiosInstance, axiosMock] = useAxiosWithMock();
            axiosMock.onDelete().replyOnce(200);
            const params = options.deleteParams!(id);

            await generateDeleteAPI({
                ...options,
                axiosInstance,
            }).delete(id);

            expect(axiosMock.history.delete[0].params).toEqual(params);
        },
    ));
});
