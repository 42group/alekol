import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { Guild, PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma.service';
import { GuildService } from './guild.service';

const guild = {
  id: faker.random.numeric(17),
} as Guild;

describe('GuildService', () => {
  let service: GuildService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
      ],
    }).compile();

    service = module.get<GuildService>(GuildService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sync', () => {
    beforeEach(() => {
      prisma.guild.upsert.mockResolvedValue(guild);
    });

    it('should upsert the guild in the database', async () => {
      await service.sync(guild);
      expect(prisma.guild.upsert).toHaveBeenCalledWith({
        where: { id: guild.id },
        update: { id: guild.id },
        create: { id: guild.id },
      });
    });
    it('should return the upserted guild', async () => {
      const result = await service.sync(guild);
      expect(result).toStrictEqual(guild);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      prisma.guild.delete.mockResolvedValue(guild);
    });

    it('should delete the guild from the database', async () => {
      await service.remove(guild);
      expect(prisma.guild.delete).toHaveBeenCalledWith({
        where: { id: guild.id },
      });
    });
    it('should return the deleted guild', async () => {
      const result = await service.remove(guild);
      expect(result).toStrictEqual(guild);
    });
  });
});
