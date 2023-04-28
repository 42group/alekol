import { LinkableService } from '@alekol/shared/enums';
import { FtLocation, LocationMessage } from '@alekol/shared/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import WebSocket from 'ws';
import { FtService } from '../ft/ft.service';

@Injectable()
export class FtWebsocketService {
  public ws!: WebSocket;
  public latestLocation: number | null = null;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
    private ftService: FtService,
    private logger: Logger
  ) {
    cacheManager.reset();
    this.initializeWebSocket();
  }

  initializeWebSocket() {
    this.ws = new WebSocket(
      this.configService.getOrThrow(`${LinkableService.Ft}.websocket.url`),
      this.configService.get(`${LinkableService.Ft}.websocket.protocols`),
      this.configService.get(`${LinkableService.Ft}.websocket.connectionConfig`)
    );
    this.ws.on('open', this.onOpen());
    this.ws.on('message', this.onMessage());
  }

  @Interval(60 * 1000)
  async checkHealth() {
    const latestLocation = await this.ftService.getLatestLocation();
    if (
      this.latestLocation !== null &&
      latestLocation.id > this.latestLocation + 20
    ) {
      this.logger.log(
        'Not receiving any updates from the websocket, closing and reconnecting...'
      );
      this.ws.close();
      this.initializeWebSocket();
    }
  }

  onOpen() {
    return async () => {
      this.logger.log('Websocket to 42 is opened');
      this.sendSubscription();
      await this.syncAllLocations();
    };
  }

  onMessage() {
    return async (rawData: WebSocket.RawData) => {
      // Parse raw message to JSON
      let data;
      try {
        data = JSON.parse(rawData.toString());
      } catch (error) {
        this.logger.warn(
          'Could not parse the message from websocket (assumed to be JSON)'
        );
      }

      if (
        this.isLocationMessageTypeGuard(data) &&
        this.isLocationMessageFromIdentifier(data)
      ) {
        const loggedIn = data.message.location.end_at === null;

        this.logger.verbose(
          `${data.message.location.login} just logged ${
            loggedIn ? 'in' : 'out'
          }`
        );

        this.saveLatestLocationId(data.message.location);
        await this.updateUserLocation(data.message.location);
      }
    };
  }

  isLocationMessageTypeGuard(data: unknown): data is LocationMessage {
    return (
      // data is object
      typeof data === 'object' &&
      data !== null &&
      // data has 'identifier'
      'identifier' in data &&
      typeof data.identifier === 'string' &&
      // data has 'message'
      'message' in data &&
      typeof data.message === 'object' &&
      data.message !== null &&
      // data.message has 'location'
      'location' in data.message &&
      typeof data.message.location === 'object' &&
      data.message.location !== null &&
      // data.message.location has 'begin_at'
      'begin_at' in data.message.location &&
      typeof data.message.location.begin_at === 'string' &&
      // data.message.location has 'end_at'
      'end_at' in data.message.location &&
      (typeof data.message.location.end_at === 'string' ||
        data.message.location.end_at === null) &&
      // data.message.location has 'host'
      'host' in data.message.location &&
      typeof data.message.location.host === 'string' &&
      // data.message.location has 'login'
      'login' in data.message.location &&
      typeof data.message.location.login === 'string'
    );
  }

  isLocationMessageFromIdentifier(data: LocationMessage) {
    let identifier: unknown;

    try {
      identifier = JSON.parse(data.identifier);
    } catch (error) {
      return false;
    }

    return (
      typeof identifier === 'object' &&
      identifier !== null &&
      'channel' in identifier &&
      identifier.channel === 'LocationChannel'
    );
  }

  getLoginFromLocation(
    location: LocationMessage['message']['location'] | FtLocation
  ) {
    if ('login' in location) return location.login;
    else if (
      'user' in location &&
      typeof location.user === 'object' &&
      location.user !== null &&
      'login' in location.user
    )
      return location.user.login;
  }

  sendSubscription() {
    ['Location', 'Notification', 'Flash'].forEach((channelName) => {
      this.ws.send(
        JSON.stringify({
          command: 'subscribe',
          identifier: JSON.stringify({
            channel: `${channelName}Channel`,
            user_id: parseInt(
              this.configService.getOrThrow(`${LinkableService.Ft}.user.id`)
            ),
          }),
        })
      );
    });
  }

  async syncAllLocations() {
    this.logger.verbose('syncing all locations...');
    let locations: FtLocation[];
    if (this.latestLocation === null) {
      locations = await this.ftService.getAllActiveLocations();
    } else {
      locations = await this.ftService.getAllLocations(this.latestLocation);
    }
    const latestLocation = locations[0];
    if (latestLocation) {
      this.saveLatestLocationId(latestLocation);
    }
    await Promise.all(
      locations.map(async (location) => {
        this.logger.verbose(`updating ${location.user.login}`);
        await this.updateUserLocation(location);
      })
    );
  }

  saveLatestLocationId(
    location: LocationMessage['message']['location'] | FtLocation
  ) {
    this.latestLocation = location.id;
  }

  async updateUserLocation(
    location: LocationMessage['message']['location'] | FtLocation
  ) {
    const { begin_at, end_at, host } = location;
    const login = this.getLoginFromLocation(location);
    await this.cacheManager.store.set(`user:${login}`, {
      begin_at,
      end_at,
      host,
    });
  }
}
