import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DiscordAuthorizationCodeExchangeResponse,
  DiscordUser,
} from '@alekol/shared/interfaces';
import { generateDiscordUserAvatarUrl } from '@alekol/shared/utils';
import { IronSession } from 'iron-session';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private discordApiBaseUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.discordApiBaseUrl = this.configService.get('discord.api.baseUrl');
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

  async saveDiscordUserInSession(
    session: IronSession,
    discordUser: DiscordUser
  ) {
    session.user = {
      ...session?.user,
      accountLinking: {
        ...session?.user?.accountLinking,
        discord: {
          id: discordUser.id,
          name: `${discordUser.username}#${discordUser.discriminator}`,
          avatarUrl: generateDiscordUserAvatarUrl(discordUser),
        },
      },
    };
    await session.save();
  }
}
