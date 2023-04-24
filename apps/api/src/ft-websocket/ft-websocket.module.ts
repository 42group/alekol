import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FtModule } from '../ft/ft.module';
import { FtWebsocketService } from './ft-websocket.service';

@Module({
  imports: [FtModule],
  providers: [ConfigService, FtWebsocketService, Logger],
})
export class FtWebsocketModule {}
