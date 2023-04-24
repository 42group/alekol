import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache, Store } from 'cache-manager';
import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { FtWebsocketService } from './ft-websocket.service';
import WebSocket from 'ws';
import { FtLocation, LocationMessage } from '@alekol/shared/interfaces';
import { faker } from '@faker-js/faker';
import { LinkableService } from '@alekol/shared/enums';
import { RedisStore } from 'cache-manager-redis-yet';
import { FtService } from '../ft/ft.service';

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
  id: parseInt(faker.random.numeric(6)),
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
const mockLatestLocation: FtLocation = {
  ...mockLocation,
};

describe('FtWebsocketService', () => {
  let service: FtWebsocketService;
  let cacheManager: DeepMocked<Cache>;
  let configService: DeepMocked<ConfigService>;
  let ftService: DeepMocked<FtService>;
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
        {
          provide: FtService,
          useValue: createMock<FtService>(),
        },
      ],
    }).compile();

    service = module.get<FtWebsocketService>(FtWebsocketService);
    cacheManager = module.get(CACHE_MANAGER);
    configService = module.get(ConfigService);
    ftService = module.get(FtService);
    mockWebSocket = service.ws as jest.Mocked<WebSocket>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    beforeEach(() => {
      ftService.getLatestLocation.mockResolvedValue(mockLatestLocation);
      service.latestLocation = mockLatestLocation.id;
    });

    it('should fetch the latest location', async () => {
      await service.checkHealth();
      expect(ftService.getLatestLocation).toHaveBeenCalled();
    });

    describe('if the websocket seems ok', () => {
      beforeEach(() => {
        ftService.getLatestLocation.mockResolvedValue(mockLatestLocation);
      });

      it('should not close the websocket', async () => {
        await service.checkHealth();
        expect(mockWebSocket.close).not.toHaveBeenCalled();
      });
    });
    describe('if the websocket seems broken', () => {
      beforeEach(() => {
        ftService.getLatestLocation.mockResolvedValue(mockLatestLocation);
        service.latestLocation = mockLatestLocation.id - 30;
      });

      it('should close the websocket', async () => {
        await service.checkHealth();
        expect(mockWebSocket.close).toHaveBeenCalled();
      });
      it('should reconnect the websocket', async () => {
        await service.checkHealth();
        expect(mockWebSocket).not.toBe(service.ws);
      });
    });
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
      service.saveLatestLocationId = jest.fn();
      service.updateUserLocation = jest.fn().mockResolvedValue(undefined);
    });

    describe('when a location message is received', () => {
      it('should check the type of the message', async () => {
        await service.onMessage()(Buffer.from(JSON.stringify(mockMessage)));
        expect(service.isLocationMessageFromIdentifier).toHaveBeenCalled();
      });
      it("should save the latest location's id", async () => {
        await service.onMessage()(Buffer.from(JSON.stringify(mockMessage)));
        expect(service.saveLatestLocationId).toHaveBeenCalledWith(mockLocation);
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

  describe('saveLatestLocationId', () => {
    describe('if the user logs in', () => {
      it("should save the location's id", () => {
        const mockId = parseInt(faker.random.numeric(6));
        service.saveLatestLocationId({ ...mockLocation, id: mockId });
        expect(service.latestLocation).toBe(mockId);
      });
    });
    describe('if the user logs out', () => {
      it("should save the location's id", () => {
        const mockId = parseInt(faker.random.numeric(6));
        service.saveLatestLocationId({
          ...mockLocation,
          id: mockId,
          end_at: faker.date.recent().toString(),
        });
        expect(service.latestLocation).not.toBe(mockId);
      });
    });
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
