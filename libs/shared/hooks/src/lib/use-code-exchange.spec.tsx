import { act, renderHook } from '@testing-library/react';
import { useCodeExchange } from './use-code-exchange';
import { faker } from '@faker-js/faker';
import fetchMock from 'jest-fetch-mock';
import mockRouter from 'next-router-mock';
import { AuthenticationStatus } from '@alekol/shared/enums';

const service = faker.company.name();
const code = faker.random.numeric(17);
const mockState = faker.random.alphaNumeric(32);

describe('useCodeExchange', () => {
  test('should redirect if the state is not present (in the sessionStorage)', async () => {
    fetchMock.mockResponse(JSON.stringify({ hello: 'world' }));
    mockRouter.query.code = code;
    mockRouter.query.state = mockState;
    await act(async () => {
      renderHook(() => useCodeExchange(service));
    });
    expect(mockRouter).toMatchObject({
      asPath: '/auth',
      pathname: '/auth',
    });
  });
  test('should redirect if the state is not present (in the request)', async () => {
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
  test('should redirect if the state is different', async () => {
    fetchMock.mockResponse(JSON.stringify({ hello: 'world' }));
    mockRouter.query.code = code;
    mockRouter.query.state = mockState;
    sessionStorage.setItem('state', `abc${mockState}123`);
    await act(async () => {
      renderHook(() => useCodeExchange(service));
    });
    expect(mockRouter).toMatchObject({
      asPath: '/auth',
      pathname: '/auth',
    });
  });
  it('should fetch user related to service', async () => {
    fetchMock.mockResponse(JSON.stringify({ hello: 'world' }));
    mockRouter.query.state = mockState;
    mockRouter.query.code = code;
    sessionStorage.setItem('state', mockState);
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
  it("should redirect to '/dashboard' on authentication", async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        hello: 'world',
        status: AuthenticationStatus.Authenticated,
      })
    );
    mockRouter.query.state = mockState;
    mockRouter.query.code = code;
    sessionStorage.setItem('state', mockState);
    await act(async () => {
      renderHook(() => useCodeExchange(service));
    });

    expect(mockRouter).toMatchObject({
      asPath: '/dashboard',
      pathname: '/dashboard',
    });
  });
  it("should redirect to '/auth' on success", async () => {
    fetchMock.mockResponse(JSON.stringify({ hello: 'world' }));
    mockRouter.query.state = mockState;
    mockRouter.query.code = code;
    sessionStorage.setItem('state', mockState);
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
    mockRouter.query.state = mockState;
    mockRouter.query.code = code;
    sessionStorage.setItem('state', mockState);
    await act(async () => {
      renderHook(() => useCodeExchange(service));
    });

    expect(mockRouter).toMatchObject({
      asPath: '/auth',
      pathname: '/auth',
    });
  });
});
