import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { faker } from '@faker-js/faker';
import { IronSession } from 'iron-session';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DiscordCodeExchangeDto } from '@alekol/shared/dtos';
import { AuthenticationStatus, LinkableService } from '@alekol/shared/enums';
import {
  mockDiscordUser,
  mockFtUser,
  mockLinkedDiscord,
  mockLinkedFt,
  mockSessionUser,
  mockUser,
} from '../../tests/users';

const discordCodeExchangeDto: DiscordCodeExchangeDto = {
  code: faker.random.numeric(17),
};
const ftCodeExchangeDto: DiscordCodeExchangeDto = {
  code: faker.random.numeric(17),
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
      service.exchangeDiscordCodeWithUser.mockResolvedValueOnce(
        mockDiscordUser
      );
      service.saveDiscordUserInSession.mockImplementation(async (session) => {
        session.user = {
          accountLinking: {
            [LinkableService.Discord]: mockLinkedDiscord,
          },
        };
      });
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
        mockDiscordUser
      );
    });

    describe('if the user does not already have an account', () => {
      it('should return the discord user', async () => {
        const response = await controller.exchangeDiscordCode(
          discordCodeExchangeDto,
          session
        );
        expect(response).toStrictEqual({
          ...mockLinkedDiscord,
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
      service.exchangeFtCodeWithUser.mockResolvedValueOnce(mockFtUser);
      service.saveFtUserInSession.mockImplementation(async (session) => {
        session.user = {
          accountLinking: {
            [LinkableService.Ft]: mockLinkedFt,
          },
        };
      });
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
      expect(service.saveFtUserInSession).toHaveBeenCalledWith(
        session,
        mockFtUser
      );
    });

    describe('if the user does not already have an account', () => {
      it('should return the ft user', async () => {
        const response = await controller.exchangeFtCode(
          ftCodeExchangeDto,
          session
        );
        expect(response).toStrictEqual({
          ...mockLinkedFt,
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

  describe('checkServices', () => {
    beforeEach(() => {
      service.getDuplicateAccounts.mockResolvedValue([]);
    });

    it('should get an array of duplicate accounts', async () => {
      await controller.checkServices(mockSessionUser);
      expect(service.getDuplicateAccounts).toHaveBeenCalledWith(
        mockSessionUser
      );
    });
    it.each<{ duplicates: LinkableService[] }>([
      { duplicates: [] },
      { duplicates: [LinkableService.Ft] },
      { duplicates: [LinkableService.Discord] },
      { duplicates: [LinkableService.Discord, LinkableService.Ft] },
    ])('should return the duplicate accounts', async ({ duplicates }) => {
      service.getDuplicateAccounts.mockResolvedValue(duplicates);
      const result = await controller.checkServices(mockSessionUser);
      expect(result).toStrictEqual({
        duplicates,
      });
    });
  });

  describe('createAccount', () => {
    const mockCreatedUser = {
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
