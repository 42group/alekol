import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { faker } from '@faker-js/faker';
import { IronSession } from 'iron-session';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DiscordUser, FtUser } from '@alekol/shared/interfaces';
import { DiscordCodeExchangeDto } from '@alekol/shared/dtos';
import { AuthenticationStatus, LinkableService } from '@alekol/shared/enums';
import { User } from '@prisma/client';

const discordCodeExchangeDto: DiscordCodeExchangeDto = {
  code: faker.random.numeric(17),
};
const ftCodeExchangeDto: DiscordCodeExchangeDto = {
  code: faker.random.numeric(17),
};

const discordUser: DiscordUser = {
  id: faker.random.numeric(17),
  username: faker.internet.userName(),
  discriminator: faker.random.alpha(4),
  avatar: faker.random.numeric(17),
};
const ftUser: FtUser = {
  id: faker.random.numeric(5),
  login: faker.internet.userName(),
  image: {
    link: faker.internet.avatar(),
  },
};

const linkedDiscord = {
  id: discordUser.id,
  name: `${discordUser.username}#${discordUser.discriminator}`,
  avatarUrl: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}`,
};
const linkedFt = {
  id: ftUser.id,
  name: ftUser.login,
  avatarUrl: ftUser.image.link,
};
const mockUser: User = {
  id: faker.datatype.uuid(),
  discordId: linkedDiscord.id,
  ftLogin: linkedFt.name,
};
let mockSession: IronSession;

beforeEach(() => {
  mockSession = {
    destroy: jest.fn().mockResolvedValueOnce(undefined),
    save: jest.fn().mockResolvedValueOnce(undefined),
  };
});

describe('AuthController', () => {
  let controller: AuthController;
  let service: DeepMocked<AuthService>;
  let session: DeepMocked<IronSession>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
    session = createMock<IronSession>();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exchangeDiscordCode', () => {
    beforeEach(() => {
      service.exchangeDiscordCodeWithUser.mockResolvedValueOnce(discordUser);
      service.saveDiscordUserInSession.mockImplementation(
        async (session, discordUser) => {
          session.user = {
            accountLinking: {
              [LinkableService.Discord]: {
                id: discordUser.id,
                name: `${discordUser.username}#${discordUser.discriminator}`,
                avatarUrl: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}`,
              },
            },
          };
        }
      );
      service.getLinkedServiceAccount.mockResolvedValue(null);
    });

    it('should exchange the code', async () => {
      await controller.exchangeDiscordCode(discordCodeExchangeDto, session);
      expect(service.exchangeDiscordCodeWithUser).toHaveBeenCalledWith(
        discordCodeExchangeDto.code
      );
    });
    it('should save the discord user in the session', async () => {
      await controller.exchangeDiscordCode(discordCodeExchangeDto, session);
      expect(service.saveDiscordUserInSession).toHaveBeenCalledWith(
        session,
        discordUser
      );
    });

    describe('if the user does not already have an account', () => {
      it('should return the discord user', async () => {
        const response = await controller.exchangeDiscordCode(
          discordCodeExchangeDto,
          session
        );
        expect(response).toStrictEqual({
          ...linkedDiscord,
          status: AuthenticationStatus.Pending,
        });
      });
    });

    describe('if the user already has an account', () => {
      beforeEach(() => {
        service.getLinkedServiceAccount.mockResolvedValue(mockUser);
      });

      it('should log the user in', async () => {
        await controller.exchangeDiscordCode(discordCodeExchangeDto, session);
        expect(service.login).toHaveBeenCalledWith(mockSession, mockUser);
      });
      it('should return a success authentication', async () => {
        const response = await controller.exchangeDiscordCode(
          discordCodeExchangeDto,
          session
        );
        expect(response).toStrictEqual({
          status: AuthenticationStatus.Authenticated,
        });
      });
    });
  });

  describe('unlinkDiscord', () => {
    beforeEach(() => {
      service.unlinkDiscord.mockResolvedValueOnce(undefined);
    });

    it('should remove the discord user from the session', async () => {
      await controller.unlinkDiscord(session);
      expect(service.unlinkDiscord).toHaveBeenCalledWith(session);
    });
  });

  describe('exchangeFtCode', () => {
    beforeEach(() => {
      service.exchangeFtCodeWithUser.mockResolvedValueOnce(ftUser);
      service.saveFtUserInSession.mockImplementation(
        async (session, ftUser) => {
          session.user = {
            accountLinking: {
              [LinkableService.Ft]: {
                id: ftUser.id,
                name: `${ftUser.login}`,
                avatarUrl: `${ftUser.image.link}`,
              },
            },
          };
        }
      );
      service.getLinkedServiceAccount.mockResolvedValue(null);
    });

    it('should exchange the code', async () => {
      await controller.exchangeFtCode(ftCodeExchangeDto, session);
      expect(service.exchangeFtCodeWithUser).toHaveBeenCalledWith(
        ftCodeExchangeDto.code
      );
    });
    it('should save the ft user in the session', async () => {
      await controller.exchangeFtCode(ftCodeExchangeDto, session);
      expect(service.saveFtUserInSession).toHaveBeenCalledWith(session, ftUser);
    });

    describe('if the user does not already have an account', () => {
      it('should return the ft user', async () => {
        const response = await controller.exchangeFtCode(
          ftCodeExchangeDto,
          session
        );
        expect(response).toStrictEqual({
          ...linkedFt,
          status: AuthenticationStatus.Pending,
        });
      });
    });

    describe('if the user already has an account', () => {
      beforeEach(() => {
        service.getLinkedServiceAccount.mockResolvedValue(mockUser);
      });

      it('should log the user in', async () => {
        await controller.exchangeFtCode(ftCodeExchangeDto, session);
        expect(service.login).toHaveBeenCalledWith(mockSession, mockUser);
      });
      it('should return a success authentication', async () => {
        const response = await controller.exchangeFtCode(
          ftCodeExchangeDto,
          session
        );
        expect(response).toStrictEqual({
          status: AuthenticationStatus.Authenticated,
        });
      });
    });
  });

  describe('unlinkFt', () => {
    beforeEach(() => {
      service.unlinkFt.mockResolvedValueOnce(undefined);
    });

    it('should remove the ft user from the session', async () => {
      await controller.unlinkFt(session);
      expect(service.unlinkFt).toHaveBeenCalledWith(session);
    });
  });

  describe('createAccount', () => {
    const mockCreatedUser = {
      id: faker.datatype.uuid(),
      discordId: linkedDiscord.id,
      ftLogin: linkedFt.name,
    };

    beforeEach(() => {
      mockSession.user = {
        accountLinking: {
          discord: linkedDiscord,
          ft: linkedFt,
        },
      };
      service.createAccount = jest.fn().mockResolvedValue(mockCreatedUser);
    });

    it("should create an account based on the user's session", async () => {
      await controller.createAccount(mockSession);
      expect(service.createAccount).toHaveBeenCalledWith(session);
    });
    it('should return the created user', async () => {
      const result = await controller.createAccount(mockSession);
      expect(result).toStrictEqual(mockCreatedUser);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      service.logout = jest.fn();
    });

    it('should logout the user', () => {
      controller.logout(mockSession);
      expect(service.logout).toHaveBeenCalledWith(mockSession);
    });
  });
});
