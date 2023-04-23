import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache, Store } from 'cache-manager';
import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { FtWebsocketService } from './ft-websocket.service';
import WebSocket from 'ws';
import { LocationMessage } from '@alekol/shared/interfaces';
import { faker } from '@faker-js/faker';
import { LinkableService } from '@alekol/shared/enums';
import { RedisStore } from 'cache-manager-redis-yet';

jest.mock('ws');

const config = () => ({
  [LinkableService.Ft]: {
    user: {
      id: faker.random.numeric(5),
    },
    websocket: {
      url: 'ws://localhost:1234',
    },
  },
});

const mockLocation = {
  begin_at: faker.date.recent().toString(),
  end_at: null,
  host: faker.random.alphaNumeric(6),
  login: faker.internet.userName(),
};
const mockMessage: LocationMessage = {
  identifier: JSON.stringify({
    channel: 'LocationChannel',
    user_id: faker.random.numeric(5),
  }),
  message: {
    location: mockLocation,
  },
};

describe('FtWebsocketService', () => {
  let service: FtWebsocketService;
  let cacheManager: DeepMocked<Cache>;
  let configService: DeepMocked<ConfigService>;
  let mockWebSocket: jest.Mocked<WebSocket>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [config] })],
      providers: [
        ConfigService,
        FtWebsocketService,
        Logger,
        {
          provide: CACHE_MANAGER,
          useValue: createMock<Cache>({
            store: {
              set: jest.fn(),
            },
          }),
        },
      ],
    }).compile();

    service = module.get<FtWebsocketService>(FtWebsocketService);
    cacheManager = module.get(CACHE_MANAGER);
    configService = module.get(ConfigService);
    mockWebSocket = service.ws as jest.Mocked<WebSocket>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onOpen', () => {
    it('should send subscription messages', () => {
      service.sendSubscription = jest.fn();
      service.onOpen()();
      expect(service.sendSubscription).toHaveBeenCalled();
    });
  });

  describe('onMessage', () => {
    beforeEach(() => {
      service.isLocationMessageFromIdentifier = jest.fn().mockReturnValue(true);
      service.updateUserLocation = jest.fn().mockResolvedValue(undefined);
    });

    describe('when a location message is received', () => {
      it('should check the type of the message', async () => {
        await service.onMessage()(Buffer.from(JSON.stringify(mockMessage)));
        expect(service.isLocationMessageFromIdentifier).toHaveBeenCalled();
      });
      it("should update the user's location", async () => {
        await service.onMessage()(Buffer.from(JSON.stringify(mockMessage)));
        expect(service.updateUserLocation).toHaveBeenCalled();
      });
    });
    describe('when another kind of message is received', () => {
      it('should not crash', async () => {
        await service.onMessage()(
          Buffer.from(JSON.stringify({ hello: 'world' }))
        );
        expect(service.isLocationMessageFromIdentifier).not.toHaveBeenCalled();
        expect(service.updateUserLocation).not.toHaveBeenCalled();
      });
    });
  });

  describe('isLocationMessageFromIdentifier', () => {
    it('should return false', () => {
      const mockFakeMessage = {
        ...mockMessage,
        identifier: JSON.stringify({ channel: 'SomethingChannel' }),
      };
      const result = service.isLocationMessageFromIdentifier(mockFakeMessage);
      expect(result).toBe(false);
    });
    it('should return true', () => {
      const result = service.isLocationMessageFromIdentifier(mockMessage);
      expect(result).toBe(true);
    });
  });

  describe('sendSubscription', () => {
    it.each(['Location', 'Notification', 'Flash'])(
      'should send %s channel subscription',
      (channelName) => {
        service.sendSubscription();
        expect(mockWebSocket.send).toHaveBeenCalledWith(
          JSON.stringify({
            command: 'subscribe',
            identifier: JSON.stringify({
              channel: `${channelName}Channel`,
              user_id: parseInt(
                configService.getOrThrow(`${LinkableService.Ft}.user.id`)
              ),
            }),
          })
        );
      }
    );
  });

  describe('updateUserLocation', () => {
    it('should save the user inside the cache', async () => {
      await service.updateUserLocation(mockLocation);
      expect(cacheManager.store.set).toHaveBeenCalledWith(
        `user:${mockLocation.login}`,
        {
          begin_at: mockLocation.begin_at,
          end_at: mockLocation.end_at,
          host: mockLocation.host,
        }
      );
    });
  });
});
