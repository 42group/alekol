import { InjectDiscordClient, On, Once } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Client, Guild } from 'discord.js';
import { GuildService } from './guild/guild.service';

@Injectable()
export class BotGateway {
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly guildService: GuildService,
    private readonly logger: Logger
  ) {}

  async syncGuild(guild: Guild) {
    await this.guildService.sync(guild);
    this.logger.verbose(`Synced guild '${guild.name}' (${guild.id})`);
    return guild;
  }

  async syncAllGuilds() {
    return Promise.all(
      this.client.guilds.cache.map(async (guild) => this.syncGuild(guild))
    );
  }

  async removeGuild(guild: Guild) {
    await this.guildService.remove(guild);
    this.logger.verbose(`Removed guild '${guild.name}' (${guild.id})`);
    return guild;
  }

  @Once('ready')
  async onReady() {
    await this.syncAllGuilds();
  }

  @On('guildCreate')
  async joinGuild(guild: Guild) {
    await this.syncGuild(guild);
  }

  @On('guildDelete')
  async leaveGuild(guild: Guild) {
    await this.removeGuild(guild);
  }
}
