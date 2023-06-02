import { INJECT_DISCORD_CLIENT } from '@discord-nestjs/core';
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Client, Guild } from 'discord.js';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { BotGateway } from './bot.gateway';
import { GuildService } from './guild/guild.service';

const generateGuild = () =>
  ({
    id: faker.random.numeric(17),
    name: faker.company.name(),
  } as Guild);
const guild = generateGuild();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BotGateway', () => {
  let gateway: BotGateway;
  let client: DeepMockProxy<Client>;
  let guildService: DeepMockProxy<GuildService>;
  let logger: DeepMockProxy<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotGateway,
        {
          provide: String(INJECT_DISCORD_CLIENT),
          useValue: mockDeep<Client>(),
        },
        {
          provide: GuildService,
          useValue: mockDeep<GuildService>(),
        },
        {
          provide: Logger,
          useValue: mockDeep<Logger>(),
        },
      ],
    }).compile();

    gateway = module.get<BotGateway>(BotGateway);
    client = module.get(String(INJECT_DISCORD_CLIENT));
    guildService = module.get(GuildService);
    logger = module.get(Logger);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('syncGuild', () => {
    it('should sync the guild', async () => {
      await gateway.syncGuild(guild);
      expect(guildService.sync).toHaveBeenCalledWith(guild);
    });
    it('should log a message', async () => {
      await gateway.syncGuild(guild);
      expect(logger.verbose).toHaveBeenCalledWith(
        `Synced guild '${guild.name}' (${guild.id})`
      );
    });
    it('should return the passed guild', async () => {
      const result = await gateway.syncGuild(guild);
      expect(result).toStrictEqual(guild);
    });
  });

  describe('syncAllGuilds', () => {
    const guilds = Array(3)
      .fill(null)
      .map(async () => generateGuild());

    beforeEach(() => {
      client.guilds.cache.map.mockReturnValue(guilds);
      gateway.syncGuild = jest.fn().mockResolvedValue(guild);
    });

    it('should sync all guilds', async () => {
      await gateway.syncAllGuilds();
      expect(client.guilds.cache.map).toHaveBeenCalled();
    });
    it('should return all guilds', async () => {
      const result = await gateway.syncAllGuilds();
      expect(result).toStrictEqual(await Promise.all(guilds));
    });
  });

  describe('removeGuild', () => {
    it('should remove the guild', async () => {
      await gateway.removeGuild(guild);
      expect(guildService.remove).toHaveBeenCalledWith(guild);
    });
    it('should log a message', async () => {
      await gateway.removeGuild(guild);
      expect(logger.verbose).toHaveBeenCalledWith(
        `Removed guild '${guild.name}' (${guild.id})`
      );
    });
    it('should return the passed guild', async () => {
      const result = await gateway.removeGuild(guild);
      expect(result).toStrictEqual(guild);
    });
  });

  describe('onReady', () => {
    beforeEach(() => {
      gateway.syncAllGuilds = jest.fn().mockResolvedValue(undefined);
    });

    it('should sync all guilds', async () => {
      await gateway.onReady();
      expect(gateway.syncAllGuilds).toHaveBeenCalled();
    });
  });

  describe('joinGuild', () => {
    beforeEach(() => {
      gateway.syncGuild = jest.fn().mockResolvedValue(undefined);
    });

    it('should sync the guild it joined', async () => {
      await gateway.joinGuild(guild);
      expect(gateway.syncGuild).toHaveBeenCalledWith(guild);
    });
  });

  describe('leaveGuild', () => {
    beforeEach(() => {
      gateway.removeGuild = jest.fn().mockResolvedValue(undefined);
    });

    it('should remove the guild it left', async () => {
      await gateway.leaveGuild(guild);
      expect(gateway.removeGuild).toHaveBeenCalledWith(guild);
    });
  });
});
