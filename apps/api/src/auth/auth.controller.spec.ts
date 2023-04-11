import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { faker } from '@faker-js/faker';
import { IronSession } from 'iron-session';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DiscordUser } from '@alekol/shared/interfaces';
import { DiscordCodeExchangeDto } from '@alekol/shared/dtos';

const discordCodeExchangeDto: DiscordCodeExchangeDto = {
  code: faker.random.numeric(17),
};

const discordUser: DiscordUser = {
  id: faker.random.numeric(17),
  username: faker.internet.userName(),
  discriminator: faker.random.alpha(4),
  avatar: faker.random.numeric(17),
};

const linkedDiscord = {
  id: discordUser.id,
  name: `${discordUser.username}#${discordUser.discriminator}`,
  avatarUrl: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}`,
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
});
