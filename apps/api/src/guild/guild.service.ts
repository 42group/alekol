import { Injectable } from '@nestjs/common';
import { Guild } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GuildService {
  constructor(private prisma: PrismaService) {}

  async sync(guild: Guild) {
    // This should perform a database upsert !!
    // In case of modification,
    // please ensure that it does perform a database upsert.
    // More info:
    // https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#unique-key-constraint-errors-on-upserts
    return this.prisma.guild.upsert({
      where: { id: guild.id },
      update: { id: guild.id },
      create: { id: guild.id },
    });
  }

  async remove(guild: Guild) {
    return this.prisma.guild.delete({
      where: { id: guild.id },
    });
  }
}
