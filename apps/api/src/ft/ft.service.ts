import { LinkableService } from '@alekol/shared/enums';
import {
  FtAuthorizationCodeExchangeResponse,
  FtUser,
} from '@alekol/shared/interfaces';
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AccessToken, ClientCredentials } from 'simple-oauth2';

@Injectable()
export class FtService {
  private ftApiBaseUrl: string;
  public client: ClientCredentials;
  public accessToken!: AccessToken;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.ftApiBaseUrl = `${this.configService.get(
      `${LinkableService.Ft}.api.baseUrl`
    )}`;
    this.client = new ClientCredentials({
      client: {
        id: configService.getOrThrow(`${LinkableService.Ft}.api.clientId`),
        secret: configService.getOrThrow(
          `${LinkableService.Ft}.api.clientSecret`
        ),
      },
      auth: {
        tokenHost: configService.getOrThrow(
          `${LinkableService.Ft}.api.baseUrl`
        ),
      },
    });
  }

  async populateAccessToken() {
    if (this.accessToken) {
      if (this.accessToken.expired()) {
        this.accessToken = await this.accessToken.refresh({ scope: 'public' });
      }
    } else {
      this.accessToken = await this.client.getToken({ scope: 'public' });
    }
  }

  async getAccessToken() {
    await this.populateAccessToken();
    return this.accessToken.token.access_token;
  }

  async exchangeCode(
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

  async exchangeCodeWithAccessToken(code: string) {
    return this.exchangeCode(code).then((res) => res.access_token);
  }

  async exchangeCodeWithUser(code: string): Promise<FtUser> {
    const accessToken = await this.exchangeCodeWithAccessToken(code);
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
}
