import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from '../config';
import { AuthModule } from '../auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FtWebsocketModule } from '../ft-websocket/ft-websocket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import type { RedisClientOptions } from 'redis';
import { ScheduleModule } from '@nestjs/schedule';
import { WebsocketGateway } from '../websocket.gateway';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        url: `redis://${configService.getOrThrow<string>(
          'cache.host'
        )}:${configService.getOrThrow<number>('cache.port')}`,
        ttl: 0,
        max: 0,
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      load: [config],
    }),
    AuthModule,
    FtWebsocketModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, WebsocketGateway],
})
export class AppModule {}
