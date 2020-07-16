import axios, { AxiosInstance } from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';

export function useAxiosWithMock(): [AxiosInstance, AxiosMockAdapter] {
    const axiosInstance = axios.create();
    const axiosMock = new AxiosMockAdapter(axiosInstance);
    return [axiosInstance, axiosMock];
}
