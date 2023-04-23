import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FtWebsocketService } from './ft-websocket.service';

@Module({
  providers: [ConfigService, FtWebsocketService, Logger],
})
export class FtWebsocketModule {}
