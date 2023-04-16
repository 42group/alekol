import {
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
} from '@alekol/shared/interfaces';
import { generateDiscordUserAvatarUrl } from '@alekol/shared/utils';
import { IronSession } from 'iron-session';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private discordApiBaseUrl: string;
  private ftApiBaseUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.discordApiBaseUrl = this.configService.get('discord.api.baseUrl');
    this.ftApiBaseUrl = this.configService.get('ft.api.baseUrl');
  }

  async exchangeDiscordCode(
    code: string
  ): Promise<DiscordAuthorizationCodeExchangeResponse> {
    const body = new URLSearchParams({
      client_id: this.configService.get('discord.api.clientId'),
      client_secret: this.configService.get('discord.api.clientSecret'),
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.configService.get('discord.api.redirectUri'),
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
      client_id: this.configService.get('ft.api.clientId'),
      client_secret: this.configService.get('ft.api.clientSecret'),
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.configService.get('ft.api.redirectUri'),
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
      discord: {
        id: discordUser.id,
        name: `${discordUser.username}#${discordUser.discriminator}`,
        avatarUrl: generateDiscordUserAvatarUrl(discordUser),
      },
    });
  }

  async saveFtUserInSession(session: IronSession, ftUser: FtUser) {
    return this.linkServices(session, {
      ft: {
        id: ftUser.id,
        name: ftUser.login,
        avatarUrl: ftUser.image.link,
      },
    });
  }

  async unlinkService(session: IronSession, service: LinkableService) {
    delete session.user.accountLinking[service];
    await session.save();
  }

  async unlinkDiscord(session: IronSession) {
    await this.unlinkService(session, LinkableService.DISCORD);
  }

  async unlinkFt(session: IronSession) {
    await this.unlinkService(session, LinkableService.FT);
  }
}
