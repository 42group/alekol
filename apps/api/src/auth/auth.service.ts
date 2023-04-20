import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LinkableService } from '@alekol/shared/enums';
import {
  AccountLinkingData,
  DiscordAuthorizationCodeExchangeResponse,
  DiscordUser,
  FtAuthorizationCodeExchangeResponse,
  FtUser,
  User,
} from '@alekol/shared/interfaces';
import { generateDiscordUserAvatarUrl } from '@alekol/shared/utils';
import { IronSession } from 'iron-session';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  private discordApiBaseUrl: string;
  private ftApiBaseUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService
  ) {
    this.discordApiBaseUrl = `${this.configService.get(
      `${LinkableService.Discord}.api.baseUrl`
    )}`;
    this.ftApiBaseUrl = `${this.configService.get(
      `${LinkableService.Ft}.api.baseUrl`
    )}`;
  }

  async exchangeDiscordCode(
    code: string
  ): Promise<DiscordAuthorizationCodeExchangeResponse> {
    const body = new URLSearchParams({
      client_id: `${this.configService.get(
        `${LinkableService.Discord}.api.clientId`
      )}`,
      client_secret: `${this.configService.get(
        `${LinkableService.Discord}.api.clientSecret`
      )}`,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${this.configService.get(
        `${LinkableService.Discord}.api.redirectUri`
      )}`,
    });
    const { data } = await firstValueFrom(
      this.httpService
        .post<DiscordAuthorizationCodeExchangeResponse>(
          `${this.discordApiBaseUrl}/oauth2/token`,
          body
        )
        .pipe(
          catchError((error) => {
            throw new InternalServerErrorException(error.message);
          })
        )
    );
    return data;
  }

  async exchangeDiscordCodeWithAccessToken(code: string) {
    return this.exchangeDiscordCode(code).then((res) => res.access_token);
  }

  async exchangeDiscordCodeWithUser(code: string): Promise<DiscordUser> {
    const accessToken = await this.exchangeDiscordCodeWithAccessToken(code);
    const { data } = await firstValueFrom(
      this.httpService
        .get<DiscordUser>(`${this.discordApiBaseUrl}/users/@me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((error) => {
            throw new InternalServerErrorException(error.message);
          })
        )
    );
    return data;
  }

  async exchangeFtCode(
    code: string
  ): Promise<FtAuthorizationCodeExchangeResponse> {
    const body = new URLSearchParams({
      client_id: `${this.configService.get(
        `${LinkableService.Ft}.api.clientId`
      )}`,
      client_secret: `${this.configService.get(
        `${LinkableService.Ft}.api.clientSecret`
      )}`,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${this.configService.get(
        `${LinkableService.Ft}.api.redirectUri`
      )}`,
    });
    const { data } = await firstValueFrom(
      this.httpService
        .post<FtAuthorizationCodeExchangeResponse>(
          `${this.ftApiBaseUrl}/oauth/token`,
          body
        )
        .pipe(
          catchError((error) => {
            throw new InternalServerErrorException(error.message);
          })
        )
    );
    return data;
  }

  async exchangeFtCodeWithAccessToken(code: string) {
    return this.exchangeFtCode(code).then((res) => res.access_token);
  }

  async exchangeFtCodeWithUser(code: string): Promise<FtUser> {
    const accessToken = await this.exchangeFtCodeWithAccessToken(code);
    const { data } = await firstValueFrom(
      this.httpService
        .get<FtUser>(`${this.ftApiBaseUrl}/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((error) => {
            throw new InternalServerErrorException(error.message);
          })
        )
    );
    return data;
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
}
