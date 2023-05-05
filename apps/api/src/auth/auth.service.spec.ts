import { LinkableService } from '@alekol/shared/enums';
import { User } from '@alekol/shared/interfaces';
import { generateDiscordUserAvatarUrl } from '@alekol/shared/utils';
import { faker } from '@faker-js/faker';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { IronSession } from 'iron-session';
import { PrismaService } from '../prisma.service';
import { AuthService } from './auth.service';
import {
  mockDiscordUser,
  mockFtUser,
  mockLinkedDiscord,
  mockLinkedFt,
  mockSessionUser,
  mockUser,
} from '../../tests/users';
import { FtService } from '../ft/ft.service';
import { DiscordService } from '../discord/discord.service';
import { DeepMocked } from '@golevelup/ts-jest';

const code = faker.random.numeric(17);

let mockSession: IronSession;

beforeEach(() => {
  mockSession = {
    destroy: jest.fn().mockResolvedValueOnce(undefined),
    save: jest.fn().mockResolvedValueOnce(undefined),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let discordService: DeepMocked<DiscordService>;
  let ftService: DeepMocked<FtService>;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DiscordService,
          useValue: mockDeep<DiscordService>(),
        },
        {
          provide: FtService,
          useValue: mockDeep<FtService>(),
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    discordService = module.get(DiscordService);
    ftService = module.get(FtService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exchangeDiscordCodeWithUser', () => {
    beforeEach(() => {
      discordService.exchangeCodeWithUser.mockResolvedValue(mockDiscordUser);
    });

    test('should exchange the code', async () => {
      await service.exchangeDiscordCodeWithUser(code);
      expect(discordService.exchangeCodeWithUser).toHaveBeenCalledWith(code);
    });
    test('should return the user', async () => {
      const result = await service.exchangeDiscordCodeWithUser(code);
      expect(result).toStrictEqual(mockDiscordUser);
    });
  });

  describe('exchangeFtCodeWithUser', () => {
    beforeEach(() => {
      ftService.exchangeCodeWithUser.mockResolvedValue(mockFtUser);
    });

    test('should exchange the code', async () => {
      await service.exchangeFtCodeWithUser(code);
      expect(ftService.exchangeCodeWithUser).toHaveBeenCalledWith(code);
    });
    test('should return the user', async () => {
      const result = await service.exchangeFtCodeWithUser(code);
      expect(result).toStrictEqual(mockFtUser);
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

  describe('getDuplicateAccounts', () => {
    beforeEach(() => {
      service.serviceIsAlreadyRegistered = jest.fn().mockResolvedValue(true);
    });

    it('should check if the service is already registered', async () => {
      await service.getDuplicateAccounts(mockSessionUser);
      for (const linkableService of Object.values(LinkableService)) {
        expect(service.serviceIsAlreadyRegistered).toHaveBeenCalledWith(
          linkableService,
          mockSessionUser.accountLinking[linkableService]
        );
      }
    });
    it('should return every duplicate service', async () => {
      const result = await service.getDuplicateAccounts(mockSessionUser);
      expect(result).toStrictEqual(Object.values(LinkableService));
    });
  });
});
