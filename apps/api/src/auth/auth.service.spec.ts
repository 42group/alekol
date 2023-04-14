import { LinkableService } from '@alekol/shared/enums';
import {
  DiscordAuthorizationCodeExchangeResponse,
  DiscordUser,
  FtAuthorizationCodeExchangeResponse,
  FtUser,
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
  ft: {
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
const ftUser: FtUser = {
  id: faker.random.numeric(17),
  login: faker.internet.userName(),
  image: {
    link: faker.internet.avatar(),
  },
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

  describe('exchange42Code', () => {
    beforeEach(() => {
      httpService.post.mockImplementationOnce(() =>
        of({
          data: { access_token: accessToken },
        } as AxiosResponse<FtAuthorizationCodeExchangeResponse>)
      );
    });

    it('should exchange the code', async () => {
      await service.exchange42Code(code);
      expect(httpService.post).toHaveBeenCalledWith(
        `${configService.get('ft.api.baseUrl')}/oauth/token`,
        new URLSearchParams({
          client_id: configService.get('ft.api.clientId'),
          client_secret: configService.get('ft.api.clientSecret'),
          grant_type: 'authorization_code',
          code,
          redirect_uri: configService.get('ft.api.redirectUri'),
        })
      );
    });
    it('should return raw data', async () => {
      const response = await service.exchange42Code(code);
      expect(response).toStrictEqual({ access_token: accessToken });
    });
  });

  describe('exchange42CodeWithAccessToken', () => {
    beforeEach(() => {
      service.exchange42Code = jest
        .fn()
        .mockResolvedValueOnce({ access_token: accessToken });
    });

    it('should exchange the code', async () => {
      await service.exchange42CodeWithAccessToken(code);
      expect(service.exchange42Code).toHaveBeenCalledWith(code);
    });
    it('should return the access token from the raw data', async () => {
      const response = await service.exchange42CodeWithAccessToken(code);
      expect(response).toBe(accessToken);
    });
  });

  describe('exchange42CodeWithUser', () => {
    beforeEach(() => {
      service.exchange42CodeWithAccessToken = jest
        .fn()
        .mockResolvedValueOnce(accessToken);
      httpService.get.mockImplementationOnce(() =>
        of({
          data: ftUser,
        } as AxiosResponse<FtUser>)
      );
    });

    it('should exchange the code with an access token', async () => {
      await service.exchange42CodeWithUser(code);
      expect(service.exchange42CodeWithAccessToken).toHaveBeenCalledWith(code);
    });
    it('should fetch the user', async () => {
      await service.exchange42CodeWithUser(code);
      expect(httpService.get).toHaveBeenCalledWith(
        `${configService.get('ft.api.baseUrl')}/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    });
    it('should return the raw 42 user', async () => {
      const response = await service.exchange42CodeWithUser(code);
      expect(response).toStrictEqual(ftUser);
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
      const mockFtUser = {
        id: faker.random.numeric(17),
        name: faker.internet.userName(),
        avatarUrl: faker.internet.avatar(),
      };
      session.user = {
        accountLinking: {
          ft: mockFtUser,
        },
      };
      await service.saveDiscordUserInSession(session, discordUser);
      expect(session.user.accountLinking.discord).toStrictEqual({
        id: discordUser.id,
        name: `${discordUser.username}#${discordUser.discriminator}`,
        avatarUrl: generateDiscordUserAvatarUrl(discordUser),
      });
      expect(session.user.accountLinking.ft).toStrictEqual(mockFtUser);
    });
    it('should save the session', async () => {
      await service.saveDiscordUserInSession(session, discordUser);
      expect(session.save).toHaveBeenCalled();
    });
  });

  describe('save42UserInSession', () => {
    let session: IronSession;

    beforeEach(() => {
      session = {
        destroy: jest.fn().mockResolvedValueOnce(undefined),
        save: jest.fn().mockResolvedValueOnce(undefined),
      };
    });

    it('should save the 42 user in the session', async () => {
      await service.save42UserInSession(session, ftUser);
      expect(session.user.accountLinking.ft).toStrictEqual({
        id: ftUser.id,
        name: `${ftUser.login}`,
        avatarUrl: ftUser.image.link,
      });
    });
    it('should not overwrite other fields of the session', async () => {
      const mockDiscordUser = {
        id: faker.random.numeric(17),
        name: faker.internet.userName(),
        avatarUrl: faker.internet.avatar(),
      };
      session.user = {
        accountLinking: {
          discord: mockDiscordUser,
        },
      };
      await service.save42UserInSession(session, ftUser);
      expect(session.user.accountLinking.ft).toStrictEqual({
        id: ftUser.id,
        name: `${ftUser.login}`,
        avatarUrl: ftUser.image.link,
      });
      expect(session.user.accountLinking.discord).toStrictEqual(
        mockDiscordUser
      );
    });
    it('should save the session', async () => {
      await service.save42UserInSession(session, ftUser);
      expect(session.save).toHaveBeenCalled();
    });
  });

  describe('unlinkService', () => {
    let session: IronSession;

    beforeEach(() => {
      session = {
        destroy: jest.fn().mockResolvedValueOnce(undefined),
        save: jest.fn().mockResolvedValueOnce(undefined),
      };
    });

    it('should remove the Discord user in the session', async () => {
      const mockDiscordUser = {
        id: faker.random.numeric(17),
        name: faker.internet.userName(),
        avatarUrl: faker.internet.url(),
      };
      session.user = {
        accountLinking: {
          discord: mockDiscordUser,
        },
      };
      await service.unlinkService(session, LinkableService.DISCORD);
      expect(session.user.accountLinking.discord).toBeUndefined();
    });
    it('should not do anything if the Discord user does not exist', async () => {
      session.user = {
        accountLinking: {},
      };
      await service.unlinkService(session, LinkableService.DISCORD);
      expect(session.user.accountLinking.discord).toBeUndefined();
    });
    it('should not overwrite other fields of the session', async () => {
      const mockDiscordUser = {
        id: faker.random.numeric(17),
        name: faker.internet.userName(),
        avatarUrl: faker.internet.url(),
      };
      const mockFtUser = {
        id: faker.random.numeric(17),
        name: faker.internet.userName(),
        avatarUrl: faker.internet.url(),
      };
      session.user = {
        accountLinking: {
          discord: mockDiscordUser,
          ft: mockFtUser,
        },
      };
      await service.unlinkService(session, LinkableService.DISCORD);
      expect(session.user.accountLinking.discord).toBeUndefined();
      expect(session.user.accountLinking.ft).toStrictEqual(mockFtUser);
    });
    it('should save the session', async () => {
      session.user = {
        accountLinking: {},
      };
      await service.unlinkService(session, LinkableService.DISCORD);
      expect(session.save).toHaveBeenCalled();
    });
  });
});
