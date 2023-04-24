import { LinkableService } from '@alekol/shared/enums';
import {
  FtAuthorizationCodeExchangeResponse,
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

jest.mock('simple-oauth2');

const accessToken = faker.random.numeric(17);
const code = faker.random.numeric(17);

const mockAccessTokenObject: jest.Mocked<AccessToken> = {
  token: {
    access_token: accessToken,
  },
  expired: jest.fn().mockReturnValue(false),
  refresh: jest.fn().mockReturnThis(),
  revoke: jest.fn().mockResolvedValue(undefined),
  revokeAll: jest.fn().mockResolvedValue(undefined),
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
  let configService: DeepMocked<ConfigService>;
  let httpService: DeepMocked<HttpService>;
  let oauth2Client: jest.Mocked<ClientCredentials>;

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
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);
    oauth2Client = service.client as jest.Mocked<ClientCredentials>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('populateAccessToken', () => {
    beforeEach(() => {
      oauth2Client.getToken.mockResolvedValue(mockAccessTokenObject);
    });

    describe('if the access token is undefined', () => {
      it('should get the token', async () => {
        await service.populateAccessToken();
        expect(oauth2Client.getToken).toHaveBeenCalledWith({ scope: 'public' });
      });
    });

    describe('if the access token is expired', () => {
      beforeEach(() => {
        service.accessToken = mockAccessTokenObject;
        mockAccessTokenObject.expired.mockReturnValueOnce(true);
      });

      it('should the expiracy of the token', async () => {
        await service.populateAccessToken();
        expect(mockAccessTokenObject.expired).toHaveBeenCalled();
      });
      it('should refresh the token', async () => {
        await service.populateAccessToken();
        expect(mockAccessTokenObject.refresh).toHaveBeenCalledWith({
          scope: 'public',
        });
      });
    });

    describe('if the access token is still valid', () => {
      beforeEach(() => {
        service.accessToken = mockAccessTokenObject;
      });

      it('should the expiracy of the token', async () => {
        await service.populateAccessToken();
        expect(mockAccessTokenObject.expired).toHaveBeenCalledWith();
      });
      it('should not refresh the token', async () => {
        await service.populateAccessToken();
        expect(mockAccessTokenObject.refresh).not.toHaveBeenCalled();
      });
      it('should not get a new token', async () => {
        await service.populateAccessToken();
        expect(oauth2Client.getToken).not.toHaveBeenCalled();
      });
    });
  });

  describe('getAccessToken', () => {
    beforeEach(() => {
      service.populateAccessToken = jest.fn().mockResolvedValue(undefined);
      service.accessToken = mockAccessTokenObject;
    });

    it('should populate the access token', async () => {
      await service.getAccessToken();
      expect(service.populateAccessToken).toHaveBeenCalled();
    });
    it('should return the access token as a string', async () => {
      const result = await service.getAccessToken();
      expect(result).toBe(mockAccessTokenObject.token.access_token);
    });
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
});
