import { BadRequestException, Injectable } from '@nestjs/common';
import { LinkableService } from '@alekol/shared/enums';
import {
  AccountLinkingData,
  DiscordUser,
  FtUser,
  User,
} from '@alekol/shared/interfaces';
import { generateDiscordUserAvatarUrl } from '@alekol/shared/utils';
import { IronSession } from 'iron-session';
import { PrismaService } from '../prisma.service';
import { User as UserModel } from '@prisma/client';
import { DiscordService } from '../discord/discord.service';
import { FtService } from '../ft/ft.service';

@Injectable()
export class AuthService {
  constructor(
    private discordService: DiscordService,
    private ftService: FtService,
    private prisma: PrismaService
  ) {}

  async exchangeDiscordCodeWithUser(code: string): Promise<DiscordUser> {
    return this.discordService.exchangeCodeWithUser(code);
  }

  async exchangeFtCodeWithUser(code: string): Promise<FtUser> {
    return this.ftService.exchangeCodeWithUser(code);
  }

  async linkServices(
    session: IronSession,
    services: { [key in LinkableService]?: AccountLinkingData }
  ) {
    session.user = {
      ...session?.user,
      accountLinking: {
        ...session?.user?.accountLinking,
        ...services,
      },
    };
    await session.save();
  }

  async saveDiscordUserInSession(
    session: IronSession,
    discordUser: DiscordUser
  ) {
    return this.linkServices(session, {
      [LinkableService.Discord]: {
        id: discordUser.id,
        name: `${discordUser.username}#${discordUser.discriminator}`,
        avatarUrl: generateDiscordUserAvatarUrl(discordUser),
      },
    });
  }

  async saveFtUserInSession(session: IronSession, ftUser: FtUser) {
    return this.linkServices(session, {
      [LinkableService.Ft]: {
        id: ftUser.id,
        name: ftUser.login,
        avatarUrl: ftUser.image.link,
      },
    });
  }

  async unlinkService(session: IronSession, service: LinkableService) {
    delete session.user?.accountLinking[service];
    await session.save();
  }

  async unlinkDiscord(session: IronSession) {
    await this.unlinkService(session, LinkableService.Discord);
  }

  async unlinkFt(session: IronSession) {
    await this.unlinkService(session, LinkableService.Ft);
  }

  async getLinkedServiceAccount(
    service: LinkableService,
    accountLinkingData: AccountLinkingData
  ) {
    const services: { [key in LinkableService]: [string, string] } = {
      [LinkableService.Discord]: ['discordId', accountLinkingData.id],
      [LinkableService.Ft]: ['ftLogin', accountLinkingData.name],
    };
    const [key, value] = services[service];
    return this.prisma.user.findUnique({
      where: {
        [key]: value,
      },
    });
  }

  async serviceIsAlreadyRegistered(
    service: LinkableService,
    accountLinkingData: AccountLinkingData
  ) {
    return !!(await this.getLinkedServiceAccount(service, accountLinkingData));
  }

  async oneOfServicesIsAlreadyRegistered(
    userAccountLinking: User['accountLinking']
  ) {
    const promises = Object.values(LinkableService).map(async (key) => {
      const service = userAccountLinking[key];
      if (!service) return false;
      return this.serviceIsAlreadyRegistered(key, service);
    });
    return (await Promise.all(promises)).some((promise) => promise);
  }

  allServicesAreLinked(userAccountLinking: User['accountLinking']) {
    return Object.values(LinkableService).every(
      (key) => !!userAccountLinking[key]
    );
  }

  async createAccount(session: IronSession) {
    if (
      !session.user ||
      !this.allServicesAreLinked(session.user.accountLinking)
    ) {
      throw new BadRequestException('You did not link third-party services');
    }

    if (
      await this.oneOfServicesIsAlreadyRegistered(session.user.accountLinking)
    )
      throw new BadRequestException(
        'One of your services is already linked to another account'
      );

    const user = await this.prisma.user.create({
      data: {
        discordId: session.user.accountLinking.discord?.id,
        ftLogin: session.user.accountLinking.ft?.name,
      },
    });
    session.user.id = user.id;
    await session.save();
    return user;
  }

  logout(session: IronSession) {
    session.destroy();
  }

  async login(session: IronSession, user: UserModel) {
    session.user = {
      ...session.user,
      accountLinking: {},
      id: user.id,
    };
    await session.save();
  }

  async getDuplicateAccounts(user: User) {
    const duplicates = [];

    if (user) {
      for (const service of Object.values(LinkableService)) {
        const accountLinking = user.accountLinking[service];
        if (
          accountLinking &&
          (await this.serviceIsAlreadyRegistered(service, accountLinking))
        ) {
          duplicates.push(service);
        }
      }
    }

    return duplicates;
  }
}
