import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FtService } from './ft.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [FtService],
  exports: [FtService],
})
export class FtModule {}
