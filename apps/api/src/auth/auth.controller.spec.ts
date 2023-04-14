import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { faker } from '@faker-js/faker';
import { IronSession } from 'iron-session';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DiscordUser, FtUser } from '@alekol/shared/interfaces';
import { DiscordCodeExchangeDto } from '@alekol/shared/dtos';

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
const linked42 = {
  id: ftUser.id,
  name: ftUser.login,
  avatarUrl: ftUser.image.link,
};

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
              discord: {
                id: discordUser.id,
                name: `${discordUser.username}#${discordUser.discriminator}`,
                avatarUrl: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}`,
              },
            },
          };
        }
      );
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
    it('should return the discord user', async () => {
      const response = await controller.exchangeDiscordCode(
        discordCodeExchangeDto,
        session
      );
      expect(response).toStrictEqual(linkedDiscord);
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

  describe('exchange42Code', () => {
    beforeEach(() => {
      service.exchange42CodeWithUser.mockResolvedValueOnce(ftUser);
      service.save42UserInSession.mockImplementation(
        async (session, ftUser) => {
          session.user = {
            accountLinking: {
              ft: {
                id: ftUser.id,
                name: `${ftUser.login}`,
                avatarUrl: `${ftUser.image.link}`,
              },
            },
          };
        }
      );
    });

    it('should exchange the code', async () => {
      await controller.exchange42Code(ftCodeExchangeDto, session);
      expect(service.exchange42CodeWithUser).toHaveBeenCalledWith(
        ftCodeExchangeDto.code
      );
    });
    it('should save the ft user in the session', async () => {
      await controller.exchange42Code(ftCodeExchangeDto, session);
      expect(service.save42UserInSession).toHaveBeenCalledWith(session, ftUser);
    });
    it('should return the ft user', async () => {
      const response = await controller.exchange42Code(
        ftCodeExchangeDto,
        session
      );
      expect(response).toStrictEqual(linked42);
    });
  });

  describe('unlink42', () => {
    beforeEach(() => {
      service.unlink42.mockResolvedValueOnce(undefined);
    });

    it('should remove the ft user from the session', async () => {
      await controller.unlink42(session);
      expect(service.unlink42).toHaveBeenCalledWith(session);
    });
  });
});
