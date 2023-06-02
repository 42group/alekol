import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GuildService } from './guild.service';

@Module({
  providers: [GuildService, PrismaService],
  exports: [GuildService],
})
export class GuildModule {}
