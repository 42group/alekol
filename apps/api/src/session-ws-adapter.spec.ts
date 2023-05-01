import { faker } from '@faker-js/faker';
import { DeepMocked } from '@golevelup/ts-jest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { PrismaService } from './prisma.service';
import { SessionWsAdapter } from './session-ws-adapter';

const config = () => ({
  ironSession: {
    cookieName: 'alekol_session',
    password: faker.internet.password(),
    cookieOptions: {
      secure: false,
    },
  },
});

describe('SessionWsAdapter', () => {
  let configService: DeepMocked<ConfigService>;
  let adapter: SessionWsAdapter;
  let prismaService: DeepMocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [config] })],
      providers: [
        ConfigService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
      ],
    }).compile();

    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);
    adapter = new SessionWsAdapter(configService, prismaService);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });
});
