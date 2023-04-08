import {
  DiscordAuthorizationCodeExchangeResponse,
  DiscordUser,
} from '@alekol/shared/interfaces';
import { generateDiscordUserAvatarUrl } from '@alekol/shared/utils';
import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { IronSession } from 'iron-session';
import { of } from 'rxjs';
import { AuthService } from './auth.service';

const accessToken = faker.random.numeric(17);
const code = faker.random.numeric(17);
const config = () => ({
  discord: {
    api: {
      baseUrl: faker.internet.url(),
      clientId: faker.random.numeric(17),
      clientSecret: faker.random.numeric(17),
      redirectUri: faker.internet.url(),
    },
  },
});
const discordUser: DiscordUser = {
  id: faker.random.numeric(17),
  username: faker.internet.userName(),
  discriminator: faker.random.numeric(4),
  avatar: faker.random.numeric(17),
};

describe('AuthService', () => {
  let service: AuthService;
  let configService: DeepMocked<ConfigService>;
  let httpService: DeepMocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [config] })],
      providers: [
        AuthService,
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exchangeDiscordCode', () => {
    beforeEach(() => {
      httpService.post.mockImplementationOnce(() =>
        of({
          data: { access_token: accessToken },
        } as AxiosResponse<DiscordAuthorizationCodeExchangeResponse>)
      );
    });

    it('should exchange the code', async () => {
      await service.exchangeDiscordCode(code);
      expect(httpService.post).toHaveBeenCalledWith(
        `${configService.get('discord.api.baseUrl')}/oauth2/token`,
        new URLSearchParams({
          client_id: configService.get('discord.api.clientId'),
          client_secret: configService.get('discord.api.clientSecret'),
          grant_type: 'authorization_code',
          code,
          redirect_uri: configService.get('discord.api.redirectUri'),
        })
      );
    });
    it('should return raw data', async () => {
      const response = await service.exchangeDiscordCode(code);
      expect(response).toStrictEqual({ access_token: accessToken });
    });
  });

  describe('exchangeDiscordCodeWithAccessToken', () => {
    beforeEach(() => {
      service.exchangeDiscordCode = jest
        .fn()
        .mockResolvedValueOnce({ access_token: accessToken });
    });

    it('should exchange the code', async () => {
      await service.exchangeDiscordCodeWithAccessToken(code);
      expect(service.exchangeDiscordCode).toHaveBeenCalledWith(code);
    });
    it('should return the access token from the raw data', async () => {
      const response = await service.exchangeDiscordCodeWithAccessToken(code);
      expect(response).toBe(accessToken);
    });
  });

  describe('exchangeDiscordCodeWithUser', () => {
    beforeEach(() => {
      service.exchangeDiscordCodeWithAccessToken = jest
        .fn()
        .mockResolvedValueOnce(accessToken);
      httpService.get.mockImplementationOnce(() =>
        of({
          data: discordUser,
        } as AxiosResponse<DiscordUser>)
      );
    });

    it('should exchange the code with an access token', async () => {
      await service.exchangeDiscordCodeWithUser(code);
      expect(service.exchangeDiscordCodeWithAccessToken).toHaveBeenCalledWith(
        code
      );
    });
    it('should fetch the user', async () => {
      await service.exchangeDiscordCodeWithUser(code);
      expect(httpService.get).toHaveBeenCalledWith(
        `${configService.get('discord.api.baseUrl')}/users/@me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    });
    it('should return the raw Discord user', async () => {
      const response = await service.exchangeDiscordCodeWithUser(code);
      expect(response).toStrictEqual(discordUser);
    });
  });

  describe('saveDiscordUserInSession', () => {
    let session: IronSession;

    beforeEach(() => {
      session = {
        destroy: jest.fn().mockResolvedValueOnce(undefined),
        save: jest.fn().mockResolvedValueOnce(undefined),
      };
    });

    it('should save the Discord user in the session', async () => {
      await service.saveDiscordUserInSession(session, discordUser);
      expect(session.user.accountLinking.discord).toStrictEqual({
        id: discordUser.id,
        name: `${discordUser.username}#${discordUser.discriminator}`,
        avatarUrl: generateDiscordUserAvatarUrl(discordUser),
      });
    });
    it('should not overwrite other fields of the session', async () => {
      const ftUser = {
        id: faker.random.numeric(17),
        name: faker.internet.userName(),
        avatarUrl: faker.internet.url(),
      };
      session.user = {
        accountLinking: {
          ft: ftUser,
        },
      };
      await service.saveDiscordUserInSession(session, discordUser);
      expect(session.user.accountLinking.discord).toStrictEqual({
        id: discordUser.id,
        name: `${discordUser.username}#${discordUser.discriminator}`,
        avatarUrl: generateDiscordUserAvatarUrl(discordUser),
      });
      expect(session.user.accountLinking.ft).toStrictEqual(ftUser);
    });
    it('should save the session', async () => {
      await service.saveDiscordUserInSession(session, discordUser);
      expect(session.save).toHaveBeenCalled();
    });
  });
});
