import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from '../config';
import { AuthModule } from '../auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FtWebsocketModule } from '../ft-websocket/ft-websocket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.getOrThrow<string>('cache.host'),
        port: configService.getOrThrow<number>('cache.port'),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
