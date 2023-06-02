import { Logger, Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { BotGateway } from '../bot.gateway';
import { GuildModule } from '../guild/guild.module';

@Module({
  imports: [DiscordModule.forFeature(), GuildModule],
  providers: [BotGateway, Logger],
})
export class BotModule {}
