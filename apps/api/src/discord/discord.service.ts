import { LinkableService } from '@alekol/shared/enums';
import {
  DiscordAuthorizationCodeExchangeResponse,
  DiscordUser,
} from '@alekol/shared/interfaces';
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class DiscordService {
  private discordApiBaseUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.discordApiBaseUrl = `${this.configService.get(
      `${LinkableService.Discord}.api.baseUrl`
    )}`;
  }

  async exchangeCode(
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

  async exchangeCodeWithAccessToken(code: string) {
    return this.exchangeCode(code).then((res) => res.access_token);
  }

  async exchangeCodeWithUser(code: string): Promise<DiscordUser> {
    const accessToken = await this.exchangeCodeWithAccessToken(code);
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
}
