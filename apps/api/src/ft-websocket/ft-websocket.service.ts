import { LinkableService } from '@alekol/shared/enums';
import { LocationMessage } from '@alekol/shared/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import WebSocket from 'ws';

@Injectable()
export class FtWebsocketService {
  public ws!: WebSocket;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
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

  onOpen() {
    return () => {
      this.logger.log('Websocket to 42 is opened');
      this.sendSubscription();
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

  async updateUserLocation({
    begin_at,
    end_at,
    host,
    login,
  }: LocationMessage['message']['location']) {
    await this.cacheManager.store.set(`user:${login}`, {
      begin_at,
      end_at,
      host,
    });
  }
}
