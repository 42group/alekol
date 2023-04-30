import { LinkableService } from '@alekol/shared/enums';
import {
  FtAuthorizationCodeExchangeResponse,
  FtLocation,
  FtUser,
} from '@alekol/shared/interfaces';
import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mockFtUser } from '../../tests/users';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { FtService } from './ft.service';
import { AccessToken, ClientCredentials } from 'simple-oauth2';
import { ApiClient } from '@alekol/shared/utils';

jest.mock('@alekol/shared/utils');
jest.mock('simple-oauth2');

const accessToken = faker.random.numeric(17);
const code = faker.random.numeric(17);

const mockFtLocation: FtLocation = {
  id: parseInt(faker.random.numeric(6)),
  begin_at: faker.date.recent().toString(),
  end_at: null,
  host: faker.random.alphaNumeric(6),
  user: {
    login: faker.internet.userName(),
  },
};

const config = () => ({
  [LinkableService.Discord]: {
    api: {
      baseUrl: faker.internet.url(),
      clientId: faker.random.numeric(17),
      clientSecret: faker.random.numeric(17),
      redirectUri: faker.internet.url(),
    },
  },
  [LinkableService.Ft]: {
    api: {
      baseUrl: faker.internet.url(),
      clientId: faker.random.numeric(17),
      clientSecret: faker.random.numeric(17),
      redirectUri: faker.internet.url(),
    },
  },
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FtService', () => {
  let service: FtService;
  let apiClient: jest.Mocked<ApiClient>;
  let configService: DeepMocked<ConfigService>;
  let httpService: DeepMocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [config] })],
      providers: [
        FtService,
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
      ],
    }).compile();

    service = module.get<FtService>(FtService);
    apiClient = service.apiClient as jest.Mocked<ApiClient>;
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exchangeCode', () => {
    beforeEach(() => {
      httpService.post.mockImplementationOnce(() =>
        of({
          data: { access_token: accessToken },
        } as AxiosResponse<FtAuthorizationCodeExchangeResponse>)
      );
    });

    it('should exchange the code', async () => {
      await service.exchangeCode(code);
      expect(httpService.post).toHaveBeenCalledWith(
        `${configService.get(`${LinkableService.Ft}.api.baseUrl`)}/oauth/token`,
        new URLSearchParams({
          client_id: `${configService.get(
            `${LinkableService.Ft}.api.clientId`
          )}`,
          client_secret: `${configService.get(
            `${LinkableService.Ft}.api.clientSecret`
          )}`,
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${configService.get(
            `${LinkableService.Ft}.api.redirectUri`
          )}`,
        })
      );
    });
    it('should return raw data', async () => {
      const response = await service.exchangeCode(code);
      expect(response).toStrictEqual({ access_token: accessToken });
    });
  });

  describe('exchangeCodeWithAccessToken', () => {
    beforeEach(() => {
      service.exchangeCode = jest
        .fn()
        .mockResolvedValueOnce({ access_token: accessToken });
    });

    it('should exchange the code', async () => {
      await service.exchangeCodeWithAccessToken(code);
      expect(service.exchangeCode).toHaveBeenCalledWith(code);
    });
    it('should return the access token from the raw data', async () => {
      const response = await service.exchangeCodeWithAccessToken(code);
      expect(response).toBe(accessToken);
    });
  });

  describe('exchangeCodeWithUser', () => {
    beforeEach(() => {
      service.exchangeCodeWithAccessToken = jest
        .fn()
        .mockResolvedValueOnce(accessToken);
      httpService.get.mockImplementationOnce(() =>
        of({
          data: mockFtUser,
        } as AxiosResponse<FtUser>)
      );
    });

    it('should exchange the code with an access token', async () => {
      await service.exchangeCodeWithUser(code);
      expect(service.exchangeCodeWithAccessToken).toHaveBeenCalledWith(code);
    });
    it('should fetch the user', async () => {
      await service.exchangeCodeWithUser(code);
      expect(httpService.get).toHaveBeenCalledWith(
        `${configService.get(`${LinkableService.Ft}.api.baseUrl`)}/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    });
    it('should return the raw 42 user', async () => {
      const response = await service.exchangeCodeWithUser(code);
      expect(response).toStrictEqual(mockFtUser);
    });
  });

  describe('getLatestActiveLocation', () => {
    beforeEach(() => {
      apiClient.request.mockResolvedValue([mockFtLocation, mockFtLocation]);
    });

    it('should fetch the locations', async () => {
      await service.getLatestActiveLocation();
      expect(apiClient.request).toHaveBeenCalledWith(
        '/locations?sort=-id&filter[active]=true&per_page=1',
        { authenticated: true }
      );
    });
    it('should return the first location', async () => {
      const response = await service.getLatestActiveLocation();
      expect(response).toStrictEqual(mockFtLocation);
    });
  });

  describe('getAllLocations', () => {
    beforeEach(() => {
      apiClient.requestLoopOverLinkHeader.mockResolvedValue([
        mockFtLocation,
        mockFtLocation,
      ]);
    });

    it('should fetch all active locations', async () => {
      await service.getAllLocations();
      expect(apiClient.requestLoopOverLinkHeader).toHaveBeenCalledWith(
        '/locations?sort=-id&per_page=100',
        { authenticated: true },
        expect.anything()
      );
    });
    it('should return all active locations', async () => {
      const response = await service.getAllLocations();
      expect(response).toStrictEqual([mockFtLocation, mockFtLocation]);
    });

    describe('the loop condition', () => {
      it('should return true if the ID is not specified', async () => {
        await service.getAllLocations();
        let result;
        if (apiClient.requestLoopOverLinkHeader.mock.calls[0][2]) {
          result = apiClient.requestLoopOverLinkHeader.mock.calls[0][2]([
            mockFtLocation,
          ]);
        }
        expect(result).toBe(true);
      });
      it('should return true if the last location ID is greater', async () => {
        await service.getAllLocations(mockFtLocation.id - 15);
        let result;
        if (apiClient.requestLoopOverLinkHeader.mock.calls[0][2]) {
          result = apiClient.requestLoopOverLinkHeader.mock.calls[0][2]([
            mockFtLocation,
          ]);
        }
        expect(result).toBe(true);
      });
      it('should return false if the last location ID is lower', async () => {
        await service.getAllLocations(mockFtLocation.id + 15);
        let result;
        if (apiClient.requestLoopOverLinkHeader.mock.calls[0][2]) {
          result = apiClient.requestLoopOverLinkHeader.mock.calls[0][2]([
            mockFtLocation,
          ]);
        }
        expect(result).toBe(false);
      });
      it('should return false if the last location ID is equal', async () => {
        await service.getAllLocations(mockFtLocation.id);
        let result;
        if (apiClient.requestLoopOverLinkHeader.mock.calls[0][2]) {
          result = apiClient.requestLoopOverLinkHeader.mock.calls[0][2]([
            mockFtLocation,
          ]);
        }
        expect(result).toBe(false);
      });
    });
  });

  describe('getAllActiveLocations', () => {
    beforeEach(() => {
      apiClient.requestLoopOverLinkHeader.mockResolvedValue([
        mockFtLocation,
        mockFtLocation,
      ]);
    });

    it('should fetch all active locations', async () => {
      await service.getAllActiveLocations();
      expect(apiClient.requestLoopOverLinkHeader).toHaveBeenCalledWith(
        '/locations?sort=-id&filter[active]=true&per_page=100',
        { authenticated: true },
        expect.anything()
      );
    });
    it('should return all active locations', async () => {
      const response = await service.getAllActiveLocations();
      expect(response).toStrictEqual([mockFtLocation, mockFtLocation]);
    });

    describe('the loop condition', () => {
      it('should return true if the ID is not specified', async () => {
        await service.getAllActiveLocations();
        let result;
        if (apiClient.requestLoopOverLinkHeader.mock.calls[0][2]) {
          result = apiClient.requestLoopOverLinkHeader.mock.calls[0][2]([
            mockFtLocation,
          ]);
        }
        expect(result).toBe(true);
      });
      it('should return true if the last location ID is greater', async () => {
        await service.getAllActiveLocations(mockFtLocation.id - 15);
        let result;
        if (apiClient.requestLoopOverLinkHeader.mock.calls[0][2]) {
          result = apiClient.requestLoopOverLinkHeader.mock.calls[0][2]([
            mockFtLocation,
          ]);
        }
        expect(result).toBe(true);
      });
      it('should return false if the last location ID is lower', async () => {
        await service.getAllActiveLocations(mockFtLocation.id + 15);
        let result;
        if (apiClient.requestLoopOverLinkHeader.mock.calls[0][2]) {
          result = apiClient.requestLoopOverLinkHeader.mock.calls[0][2]([
            mockFtLocation,
          ]);
        }
        expect(result).toBe(false);
      });
      it('should return false if the last location ID is equal', async () => {
        await service.getAllActiveLocations(mockFtLocation.id);
        let result;
        if (apiClient.requestLoopOverLinkHeader.mock.calls[0][2]) {
          result = apiClient.requestLoopOverLinkHeader.mock.calls[0][2]([
            mockFtLocation,
          ]);
        }
        expect(result).toBe(false);
      });
    });
  });
});
