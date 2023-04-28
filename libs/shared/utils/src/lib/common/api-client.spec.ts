import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import parseLinkHeader from 'parse-link-header';
import { of } from 'rxjs';
import { AccessToken, ClientCredentials } from 'simple-oauth2';
import { ApiClient, ApiRequestOptions } from './api-client';
import { AutofillTokenBucket } from './autofill-token-bucket';
import { AutofillTokenBucketToken } from './autofill-token-bucket-token';

jest.mock('parse-link-header');
jest.mock('simple-oauth2');
jest.mock('./autofill-token-bucket');
jest.mock('./autofill-token-bucket-token');

const accessToken = faker.random.numeric(17);
const baseUrl = faker.internet.url();
const clientId = faker.random.alphaNumeric(17);
const clientSecret = faker.random.alphaNumeric(17);
const maxRequestsPerInterval = parseInt(faker.random.numeric(1));
const rateLimitInterval = parseInt(faker.random.numeric(1));
const mockAccessToken: jest.Mocked<AccessToken> = {
  token: {
    access_token: accessToken,
  },
  expired: jest.fn().mockReturnValue(false),
  refresh: jest.fn().mockReturnThis(),
  revoke: jest.fn().mockResolvedValue(undefined),
  revokeAll: jest.fn().mockResolvedValue(undefined),
};
const mockAxiosResponse = {
  data: [
    {
      hello: 'world',
      id: 3,
      [faker.random.word()]: faker.random.word(),
    },
  ],
  headers: {
    link: {
      url: faker.internet.url(),
      rel: 'next',
    },
  },
};
const mockParseLinkHeader = parseLinkHeader as jest.MockedFn<
  typeof parseLinkHeader
>;
const uriComponent = '/api/route';

beforeEach(() => {
  jest.clearAllMocks();
});
const url = faker.internet.url();

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let httpService: DeepMocked<HttpService>;
  let bucket: jest.Mocked<AutofillTokenBucket>;
  let oauth2Client: jest.Mocked<ClientCredentials>;

  beforeEach(() => {
    httpService = createMock<HttpService>();
    apiClient = new ApiClient(httpService, {
      baseUrl,
      clientId,
      clientSecret,
      maxRequestsPerInterval,
      rateLimitInterval,
      scope: 'public',
    });
    bucket = apiClient.bucket as jest.Mocked<AutofillTokenBucket>;
    oauth2Client = apiClient.client as jest.Mocked<ClientCredentials>;
  });

  describe('populateAccessToken', () => {
    beforeEach(() => {
      oauth2Client.getToken.mockResolvedValue(mockAccessToken);
    });

    describe('if the access token is undefined', () => {
      it('should get the token', async () => {
        await apiClient.populateAccessToken();
        expect(oauth2Client.getToken).toHaveBeenCalledWith({ scope: 'public' });
      });
    });

    describe('if the access token is expired', () => {
      beforeEach(() => {
        apiClient.accessToken = mockAccessToken;
        mockAccessToken.expired.mockReturnValueOnce(true);
      });

      it('should the expiracy of the token', async () => {
        await apiClient.populateAccessToken();
        expect(mockAccessToken.expired).toHaveBeenCalled();
      });
      it('should refresh the token', async () => {
        await apiClient.populateAccessToken();
        expect(mockAccessToken.refresh).toHaveBeenCalledWith({
          scope: 'public',
        });
      });
    });

    describe('if the access token is still valid', () => {
      beforeEach(() => {
        apiClient.accessToken = mockAccessToken;
      });

      it('should the expiracy of the token', async () => {
        await apiClient.populateAccessToken();
        expect(mockAccessToken.expired).toHaveBeenCalledWith();
      });
      it('should not refresh the token', async () => {
        await apiClient.populateAccessToken();
        expect(mockAccessToken.refresh).not.toHaveBeenCalled();
      });
      it('should not get a new token', async () => {
        await apiClient.populateAccessToken();
        expect(oauth2Client.getToken).not.toHaveBeenCalled();
      });
    });
  });

  describe('getAccessToken', () => {
    beforeEach(() => {
      apiClient.populateAccessToken = jest.fn().mockResolvedValue(undefined);
      apiClient.accessToken = mockAccessToken;
    });

    it('should populate the access token', async () => {
      await apiClient.getAccessToken();
      expect(apiClient.populateAccessToken).toHaveBeenCalled();
    });
    it('should return the access token as a string', async () => {
      const result = await apiClient.getAccessToken();
      expect(result).toBe(mockAccessToken.token.access_token);
    });
  });

  describe.each<{ config?: ApiRequestOptions; uri: string }>([
    { uri: uriComponent },
    { uri: url },
    { config: { authenticated: true }, uri: uriComponent },
    { config: { authenticated: false }, uri: uriComponent },
    { config: { authenticated: true }, uri: url },
    { config: { authenticated: false }, uri: url },
    { config: { method: 'get' }, uri: uriComponent },
    { config: { method: 'get' }, uri: url },
    { config: { method: 'post' }, uri: uriComponent },
    { config: { method: 'post' }, uri: url },
    { config: { authenticated: true, method: 'get' }, uri: uriComponent },
    { config: { authenticated: false, method: 'get' }, uri: uriComponent },
    { config: { authenticated: true, method: 'get' }, uri: url },
    { config: { authenticated: false, method: 'get' }, uri: url },
    { config: { authenticated: true, method: 'post' }, uri: uriComponent },
    { config: { authenticated: false, method: 'post' }, uri: uriComponent },
    { config: { authenticated: true, method: 'post' }, uri: url },
    { config: { authenticated: false, method: 'post' }, uri: url },
  ])('baseRequest (%p)', ({ config, uri }) => {
    const mockToken = new AutofillTokenBucketToken(jest.fn());
    const fullUrl = `${/^http(s)?:\/\//.test(uri) ? '' : baseUrl}${uri}`;

    beforeEach(() => {
      bucket.getToken.mockResolvedValue(mockToken);
      apiClient.getAccessToken = jest.fn().mockResolvedValue(accessToken);
      httpService[config?.method || 'get'].mockImplementationOnce(() =>
        of(mockAxiosResponse as unknown as AxiosResponse)
      );
    });

    it('should get a token from the bucket', async () => {
      await apiClient.baseRequest(fullUrl, config);
      expect(bucket.getToken).toHaveBeenCalled();
    });
    it(`should ${
      config?.authenticated ? '' : 'not'
    } get an access token`, async () => {
      await apiClient.baseRequest(fullUrl, config);
      if (config?.authenticated)
        expect(apiClient.getAccessToken).toHaveBeenCalled();
      else expect(apiClient.getAccessToken).not.toHaveBeenCalled();
    });
    it('should do the HTTP request', async () => {
      await apiClient.baseRequest(fullUrl, config);
      expect(httpService[config?.method || 'get']).toHaveBeenCalledWith(
        fullUrl,
        {
          headers: {
            Authorization: config?.authenticated
              ? `Bearer ${accessToken}`
              : undefined,
          },
        }
      );
    });
    it('should set the token date', async () => {
      await apiClient.baseRequest(fullUrl, config);
      expect(mockToken.setDate).toHaveBeenCalled();
    });
  });

  describe.each([
    { uri: uriComponent },
    { uri: url },
    { config: { authenticated: true }, uri: uriComponent },
    { config: { authenticated: true }, uri: url },
  ])('request', ({ config, uri }) => {
    beforeEach(() => {
      apiClient.baseRequest = jest.fn().mockResolvedValue(mockAxiosResponse);
    });

    it('should make an HTTP request', async () => {
      await apiClient.request(uri, config);
      expect(apiClient.baseRequest).toHaveBeenCalledWith(uri, config);
    });
    it('should return the data', async () => {
      const result = await apiClient.request(uri, config);
      expect(result).toStrictEqual(mockAxiosResponse.data);
    });
  });

  describe.each([
    { uri: uriComponent },
    { uri: url },
    { config: { authenticated: true }, uri: uriComponent },
    { config: { authenticated: true }, uri: url },
  ])('requestLoopOverLinkHeader (%p)', ({ config, uri }) => {
    beforeEach(() => {
      apiClient.baseRequest = jest.fn().mockResolvedValue(mockAxiosResponse);
      mockParseLinkHeader.mockReset();
      mockParseLinkHeader.mockReturnValue(null);
      for (let i = 0; i < 3; i++) {
        mockParseLinkHeader.mockReturnValueOnce({
          next: {
            url: `${mockAxiosResponse.headers.link.url}/${i}`,
            rel: mockAxiosResponse.headers.link.rel,
          },
        });
      }
    });

    it('should perform requests', async () => {
      await apiClient.requestLoopOverLinkHeader(uri, config);
      expect(apiClient.baseRequest).toHaveBeenCalledTimes(4);
      expect(apiClient.baseRequest).toHaveBeenCalledWith(uri, config);
      for (let i = 0; i < 3; i++) {
        expect(apiClient.baseRequest).toHaveBeenCalledWith(
          `${mockAxiosResponse.headers.link.url}/${i}`,
          config
        );
      }
    });
    it('should stop if the condition returns true', async () => {
      let i = 0;
      await apiClient.requestLoopOverLinkHeader(uri, config, () => {
        return i++ < 2;
      });
      expect(apiClient.baseRequest).toHaveBeenCalledTimes(3);
    });
    it('should parse the next link', async () => {
      await apiClient.requestLoopOverLinkHeader(uri, config);
      expect(mockParseLinkHeader).toHaveBeenCalledTimes(4);
      expect(mockParseLinkHeader).toHaveBeenCalledWith(
        mockAxiosResponse.headers.link
      );
    });
    it('should return the aggregated data', async () => {
      const result = await apiClient.requestLoopOverLinkHeader(uri, config);
      expect(result).toHaveLength(4);
    });
  });
});
