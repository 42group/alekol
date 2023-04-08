import { act, renderHook } from '@testing-library/react';
import { useCodeExchange } from './use-code-exchange';
import { faker } from '@faker-js/faker';
import fetchMock from 'jest-fetch-mock';
import mockRouter from 'next-router-mock';

const service = faker.company.name();
const code = faker.random.numeric(17);

describe('useCodeExchange', () => {
  it('should fetch user related to service', async () => {
    fetchMock.mockResponse(JSON.stringify({ hello: 'world' }));
    mockRouter.query.code = code;
    await act(async () => {
      renderHook(() => useCodeExchange(service));
    });

    expect(fetchMock).toHaveBeenCalledWith(`/api/auth/oauth2/${service}/code`, {
      method: 'POST',
      body: JSON.stringify({
        code: code,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });
  it("should redirect to '/auth' on success", async () => {
    fetchMock.mockResponse(JSON.stringify({ hello: 'world' }));
    mockRouter.query.code = code;
    await act(async () => {
      renderHook(() => useCodeExchange(service));
    });

    expect(mockRouter).toMatchObject({
      asPath: '/auth',
      pathname: '/auth',
    });
  });
  it("should redirect to '/auth' on error", async () => {
    fetchMock.mockReject(new Error('invalid code'));
    mockRouter.query.code = code;
    await act(async () => {
      renderHook(() => useCodeExchange(service));
    });

    expect(mockRouter).toMatchObject({
      asPath: '/auth',
      pathname: '/auth',
    });
  });
});
