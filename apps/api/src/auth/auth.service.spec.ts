import { LinkableService } from '@alekol/shared/enums';
import {
  DiscordAuthorizationCodeExchangeResponse,
  DiscordUser,
  FtAuthorizationCodeExchangeResponse,
  FtUser,
  User,
} from '@alekol/shared/interfaces';
import { generateDiscordUserAvatarUrl } from '@alekol/shared/utils';
import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PrismaClient } from '@prisma/client';
import { AxiosResponse } from 'axios';
import { IronSession } from 'iron-session';
import { of } from 'rxjs';
import { PrismaService } from '../prisma.service';
import { AuthService } from './auth.service';
import {
  mockDiscordUser,
  mockFtUser,
  mockLinkedDiscord,
  mockLinkedFt,
  mockUser,
} from '../../tests/users';

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
let mockSession: IronSession;

beforeEach(() => {
  mockSession = {
    destroy: jest.fn().mockResolvedValueOnce(undefined),
    save: jest.fn().mockResolvedValueOnce(undefined),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let configService: DeepMocked<ConfigService>;
  let httpService: DeepMocked<HttpService>;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [config] })],
      providers: [
        AuthService,
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);
    prisma = module.get(PrismaService);
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
          data: mockDiscordUser,
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
      const response = await service.exchangeDiscordCodeWithUser(code);
      expect(response).toStrictEqual(mockDiscordUser);
    });
  });

  describe('exchangeFtCode', () => {
    beforeEach(() => {
      httpService.post.mockImplementationOnce(() =>
        of({
          data: { access_token: accessToken },
        } as AxiosResponse<FtAuthorizationCodeExchangeResponse>)
      );
    });

    it('should exchange the code', async () => {
      await service.exchangeFtCode(code);
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
      const response = await service.exchangeFtCode(code);
      expect(response).toStrictEqual({ access_token: accessToken });
    });
  });

  describe('exchangeFtCodeWithAccessToken', () => {
    beforeEach(() => {
      service.exchangeFtCode = jest
        .fn()
        .mockResolvedValueOnce({ access_token: accessToken });
    });

    it('should exchange the code', async () => {
      await service.exchangeFtCodeWithAccessToken(code);
      expect(service.exchangeFtCode).toHaveBeenCalledWith(code);
    });
    it('should return the access token from the raw data', async () => {
      const response = await service.exchangeFtCodeWithAccessToken(code);
      expect(response).toBe(accessToken);
    });
  });

  describe('exchangeFtCodeWithUser', () => {
    beforeEach(() => {
      service.exchangeFtCodeWithAccessToken = jest
        .fn()
        .mockResolvedValueOnce(accessToken);
      httpService.get.mockImplementationOnce(() =>
        of({
          data: mockFtUser,
        } as AxiosResponse<FtUser>)
      );
    });

    it('should exchange the code with an access token', async () => {
      await service.exchangeFtCodeWithUser(code);
      expect(service.exchangeFtCodeWithAccessToken).toHaveBeenCalledWith(code);
    });
    it('should fetch the user', async () => {
      await service.exchangeFtCodeWithUser(code);
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
      const response = await service.exchangeFtCodeWithUser(code);
      expect(response).toStrictEqual(mockFtUser);
    });
  });

  describe.each([
    {
      accountLinking: { [LinkableService.Discord]: mockLinkedDiscord },
      initialSession: { [LinkableService.Ft]: mockLinkedFt },
    },
    {
      accountLinking: { [LinkableService.Ft]: mockLinkedFt },
      initialSession: { [LinkableService.Discord]: mockLinkedDiscord },
    },
    {
      accountLinking: {
        [LinkableService.Discord]: mockLinkedDiscord,
        [LinkableService.Ft]: mockLinkedFt,
      },
      initialSession: {},
    },
  ])('linkServices', ({ accountLinking, initialSession }) => {
    it('should save the user in the session', async () => {
      await service.linkServices(mockSession, accountLinking);
      expect(mockSession.user?.accountLinking).toStrictEqual(accountLinking);
    });
    it('should not overwrite other fields of the session', async () => {
      mockSession.user = {
        accountLinking: initialSession,
      };
      await service.linkServices(mockSession, accountLinking);
      expect(mockSession.user.accountLinking).toStrictEqual({
        ...initialSession,
        ...accountLinking,
      });
    });
    it('should save the session', async () => {
      await service.linkServices(mockSession, accountLinking);
      expect(mockSession.save).toHaveBeenCalled();
    });
  });

  describe('saveDiscordUserInSession', () => {
    it('should save the Discord user in the session', async () => {
      service.linkServices = jest.fn().mockResolvedValueOnce(undefined);
      await service.saveDiscordUserInSession(mockSession, mockDiscordUser);
      expect(service.linkServices).toHaveBeenCalledWith(mockSession, {
        [LinkableService.Discord]: {
          id: mockDiscordUser.id,
          name: `${mockDiscordUser.username}#${mockDiscordUser.discriminator}`,
          avatarUrl: generateDiscordUserAvatarUrl(mockDiscordUser),
        },
      });
    });
  });

  describe('saveFtUserInSession', () => {
    it('should save the 42 user in the session', async () => {
      service.linkServices = jest.fn().mockResolvedValueOnce(undefined);
      await service.saveFtUserInSession(mockSession, mockFtUser);
      expect(service.linkServices).toHaveBeenCalledWith(mockSession, {
        [LinkableService.Ft]: {
          id: mockFtUser.id,
          name: mockFtUser.login,
          avatarUrl: mockFtUser.image.link,
        },
      });
    });
  });

  describe('unlinkService', () => {
    it('should remove the Discord user in the session', async () => {
      const mockDiscordUser = {
        id: faker.random.numeric(17),
        name: faker.internet.userName(),
        avatarUrl: faker.internet.url(),
      };
      mockSession.user = {
        accountLinking: {
          [LinkableService.Discord]: mockDiscordUser,
        },
      };
      await service.unlinkService(mockSession, LinkableService.Discord);
      expect(
        mockSession.user.accountLinking[LinkableService.Discord]
      ).toBeUndefined();
    });
    it('should not do anything if the Discord user does not exist', async () => {
      mockSession.user = {
        accountLinking: {},
      };
      await service.unlinkService(mockSession, LinkableService.Discord);
      expect(
        mockSession.user.accountLinking[LinkableService.Discord]
      ).toBeUndefined();
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
      mockSession.user = {
        accountLinking: {
          [LinkableService.Discord]: mockDiscordUser,
          [LinkableService.Ft]: mockFtUser,
        },
      };
      await service.unlinkService(mockSession, LinkableService.Discord);
      expect(
        mockSession.user.accountLinking[LinkableService.Discord]
      ).toBeUndefined();
      expect(mockSession.user.accountLinking[LinkableService.Ft]).toStrictEqual(
        mockFtUser
      );
    });
    it('should save the session', async () => {
      mockSession.user = {
        accountLinking: {},
      };
      await service.unlinkService(mockSession, LinkableService.Discord);
      expect(mockSession.save).toHaveBeenCalled();
    });
  });

  describe.each(Object.values(LinkableService))(
    'getLinkedServiceAccount (%s)',
    (serviceKey) => {
      let mockUserAccountLinking: Required<User['accountLinking']>;
      const mockFindUniqueUserResult = {
        id: faker.datatype.uuid(),
        discordId: mockLinkedDiscord.id,
        ftLogin: mockLinkedFt.name,
      };
      let services: { [key in LinkableService]: [string, string] };

      beforeEach(() => {
        mockUserAccountLinking = {
          discord: mockLinkedDiscord,
          ft: mockLinkedFt,
        };
        services = {
          [LinkableService.Discord]: [
            'discordId',
            mockUserAccountLinking[LinkableService.Discord].id,
          ],
          [LinkableService.Ft]: [
            'ftLogin',
            mockUserAccountLinking[LinkableService.Ft].name,
          ],
        };
        prisma.user.findUnique.mockResolvedValue(null);
      });

      it('should check the database', async () => {
        await service.getLinkedServiceAccount(
          serviceKey,
          mockUserAccountLinking[serviceKey]
        );
        const [key, value] = services[serviceKey];
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: {
            [key]: value,
          },
        });
      });
      it('should return the user on already registered', async () => {
        prisma.user.findUnique.mockResolvedValue(mockFindUniqueUserResult);
        const result = await service.getLinkedServiceAccount(
          serviceKey,
          mockUserAccountLinking[serviceKey]
        );
        expect(result).toStrictEqual(mockFindUniqueUserResult);
      });
      it('should return null on not already registered', async () => {
        const result = await service.getLinkedServiceAccount(
          serviceKey,
          mockUserAccountLinking[serviceKey]
        );
        expect(result).toBeNull();
      });
    }
  );

  describe.each(Object.values(LinkableService))(
    'serviceIsAlreadyRegistered',
    (serviceKey) => {
      let mockUserAccountLinking: Required<User['accountLinking']>;
      const mockFindUniqueUserResult = {
        id: faker.datatype.uuid(),
        discordId: mockLinkedDiscord.id,
        ftLogin: mockLinkedFt.name,
      };

      beforeEach(() => {
        mockUserAccountLinking = {
          discord: mockLinkedDiscord,
          ft: mockLinkedFt,
        };
        service.getLinkedServiceAccount = jest.fn().mockResolvedValue(null);
      });

      test('should get the registered user', async () => {
        await service.serviceIsAlreadyRegistered(
          serviceKey,
          mockUserAccountLinking[serviceKey]
        );
        expect(service.getLinkedServiceAccount).toHaveBeenCalledWith(
          serviceKey,
          mockUserAccountLinking[serviceKey]
        );
      });
      test('should return true on service already registered', async () => {
        service.getLinkedServiceAccount = jest
          .fn()
          .mockResolvedValue(mockFindUniqueUserResult);
        const result = await service.serviceIsAlreadyRegistered(
          serviceKey,
          mockUserAccountLinking[serviceKey]
        );
        expect(result).toBe(true);
      });
      test('should return false on service not already registered', async () => {
        const result = await service.serviceIsAlreadyRegistered(
          serviceKey,
          mockUserAccountLinking[serviceKey]
        );
        expect(result).toBe(false);
      });
    }
  );

  describe('oneOfServicesIsAlreadyRegistered', () => {
    let mockUserAccountLinking: User['accountLinking'];

    beforeEach(() => {
      mockUserAccountLinking = {
        discord: mockLinkedDiscord,
        ft: mockLinkedFt,
      };
      service.serviceIsAlreadyRegistered = jest.fn().mockResolvedValue(false);
    });

    it('should return false on no service already registered', async () => {
      const result = await service.oneOfServicesIsAlreadyRegistered({});
      expect(result).toBe(false);
    });
    it.each(Object.values(LinkableService))(
      'should return true on %s already registered',
      async (serviceKey) => {
        service.serviceIsAlreadyRegistered = jest.fn(
          async (key: LinkableService) => key === serviceKey
        );
        const result = await service.oneOfServicesIsAlreadyRegistered(
          mockUserAccountLinking
        );
        expect(result).toBe(true);
      }
    );
    it('should return true on all services already registered', async () => {
      service.serviceIsAlreadyRegistered = jest.fn().mockResolvedValue(true);
      const result = await service.oneOfServicesIsAlreadyRegistered(
        mockUserAccountLinking
      );
      expect(result).toBe(true);
    });
  });

  describe('allServicesAreLinked', () => {
    let mockUserAccountLinking: User['accountLinking'];

    beforeEach(() => {
      mockUserAccountLinking = {
        discord: mockLinkedDiscord,
        ft: mockLinkedFt,
      };
    });

    it('should return true on all services linked', () => {
      const result = service.allServicesAreLinked(mockUserAccountLinking);
      expect(result).toBe(true);
    });
    it.each(Object.values(LinkableService))(
      'should check that %s is linked',
      (serviceKey) => {
        delete mockUserAccountLinking[serviceKey];
        const result = service.allServicesAreLinked(mockUserAccountLinking);
        expect(result).toBe(false);
      }
    );
    it('should return false on no services linked', () => {
      const result = service.allServicesAreLinked({});
      expect(result).toBe(false);
    });
  });

  describe('createAccount', () => {
    const mockCreateUserResult = {
      id: faker.datatype.uuid(),
      discordId: mockLinkedDiscord.id,
      ftLogin: mockLinkedFt.name,
    };

    beforeEach(() => {
      mockSession.user = {
        accountLinking: {
          discord: mockLinkedDiscord,
          ft: mockLinkedFt,
        },
      };
      service.allServicesAreLinked = jest.fn().mockReturnValue(true);
      service.oneOfServicesIsAlreadyRegistered = jest
        .fn()
        .mockResolvedValue(false);
      prisma.user.create.mockResolvedValue(mockCreateUserResult);
    });

    it('should check that all services are linked', async () => {
      await service.createAccount(mockSession);
      expect(service.allServicesAreLinked).toHaveBeenCalledWith(
        mockSession.user?.accountLinking
      );
    });
    it('should throw if not all services are linked', async () => {
      service.allServicesAreLinked = jest.fn().mockReturnValue(false);
      await expect(() => service.createAccount(mockSession)).rejects.toThrow(
        'You did not link third-party services'
      );
    });
    it('should check that none of the services is already registered', async () => {
      await service.createAccount(mockSession);
      expect(service.oneOfServicesIsAlreadyRegistered).toHaveBeenCalledWith(
        mockSession.user?.accountLinking
      );
    });
    it('should throw if one of the services is already registered', async () => {
      service.oneOfServicesIsAlreadyRegistered = jest
        .fn()
        .mockResolvedValue(true);
      await expect(() => service.createAccount(mockSession)).rejects.toThrow(
        'One of your services is already linked to another account'
      );
    });
    it('should save the user in the database', async () => {
      await service.createAccount(mockSession);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            discordId: mockLinkedDiscord.id,
            ftLogin: mockLinkedFt.name,
          },
        })
      );
    });
    it("should set the session user's id", async () => {
      await service.createAccount(mockSession);
      expect(mockSession.user?.id).toBe(mockCreateUserResult.id);
      expect(mockSession.save).toHaveBeenCalled();
    });
    it('should return the created user', async () => {
      const result = await service.createAccount(mockSession);
      expect(result).toStrictEqual(mockCreateUserResult);
    });
  });

  describe('logout', () => {
    it('should destroy the user session', () => {
      service.logout(mockSession);
      expect(mockSession.destroy).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should reset accountLinking property', async () => {
      mockSession.user = {
        accountLinking: {
          discord: mockLinkedDiscord,
          ft: mockLinkedFt,
        },
      };
      await service.login(mockSession, mockUser);
      expect(mockSession.user?.accountLinking).toStrictEqual({});
    });
    it("should add the user's id", async () => {
      await service.login(mockSession, mockUser);
      expect(mockSession.user?.id).toBe(mockUser.id);
    });
    it("should overwrite the user's id", async () => {
      mockSession.user = {
        id: faker.datatype.uuid(),
        accountLinking: {},
      };
      await service.login(mockSession, mockUser);
      expect(mockSession.user?.id).toBe(mockUser.id);
    });
    it('should save the session', async () => {
      await service.login(mockSession, mockUser);
      expect(mockSession.save).toHaveBeenCalled();
    });
  });
});
