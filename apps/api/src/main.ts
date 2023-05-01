/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ironSession } from 'iron-session/express';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';

import 'parse-link-header';
import { SessionWsAdapter } from './session-ws-adapter';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);
  app.useWebSocketAdapter(
    new SessionWsAdapter(configService, prismaService, app)
  );

  app.use(
    ironSession({
      cookieName: `${configService.get('ironSession.cookieName')}`,
      password: `${configService.get('ironSession.password')}`,
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      },
    })
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
