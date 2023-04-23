import { LinkableService } from '@alekol/shared/enums';
import {
  DiscordAuthorizationCodeExchangeResponse,
  DiscordUser,
} from '@alekol/shared/interfaces';
import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDiscordUser } from '../../tests/users';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { DiscordService } from './discord.service';

const accessToken = faker.random.numeric(17);
const code = faker.random.numeric(17);

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

describe('DiscordService', () => {
  let service: DiscordService;
  let configService: DeepMocked<ConfigService>;
  let httpService: DeepMocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [config] })],
      providers: [
        DiscordService,
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
      ],
    }).compile();

    service = module.get<DiscordService>(DiscordService);
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
        } as AxiosResponse<DiscordAuthorizationCodeExchangeResponse>)
      );
    });

    it('should exchange the code', async () => {
      await service.exchangeCode(code);
      expect(httpService.post).toHaveBeenCalledWith(
        `${configService.get(
          `${LinkableService.Discord}.api.baseUrl`
        )}/oauth2/token`,
        new URLSearchParams({
          client_id: `${configService.get(
            `${LinkableService.Discord}.api.clientId`
          )}`,
          client_secret: `${configService.get(
            `${LinkableService.Discord}.api.clientSecret`
          )}`,
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${configService.get(
            `${LinkableService.Discord}.api.redirectUri`
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
          data: mockDiscordUser,
        } as AxiosResponse<DiscordUser>)
      );
    });

    it('should exchange the code with an access token', async () => {
      await service.exchangeCodeWithUser(code);
      expect(service.exchangeCodeWithAccessToken).toHaveBeenCalledWith(code);
    });
    it('should fetch the user', async () => {
      await service.exchangeCodeWithUser(code);
      expect(httpService.get).toHaveBeenCalledWith(
        `${configService.get(
          `${LinkableService.Discord}.api.baseUrl`
        )}/users/@me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    });
    it('should return the raw Discord user', async () => {
      const response = await service.exchangeCodeWithUser(code);
      expect(response).toStrictEqual(mockDiscordUser);
    });
  });
});
