import { Module } from '@nestjs/common';
import { DiscordModule } from '../discord/discord.module';
import { FtModule } from '../ft/ft.module';
import { PrismaService } from '../prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [DiscordModule, FtModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
