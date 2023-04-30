import { LinkableService } from '@alekol/shared/enums';
import {
  FtAuthorizationCodeExchangeResponse,
  FtLocation,
  FtUser,
} from '@alekol/shared/interfaces';
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { ApiClient } from '@alekol/shared/utils';

@Injectable()
export class FtService {
  public apiClient;
  private ftApiBaseUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.apiClient = new ApiClient(this.httpService, {
      baseUrl: `${this.configService.get(`${LinkableService.Ft}.api.baseUrl`)}`,
      clientId: this.configService.getOrThrow(
        `${LinkableService.Ft}.api.clientId`
      ),
      clientSecret: this.configService.getOrThrow(
        `${LinkableService.Ft}.api.clientSecret`
      ),
      maxRequestsPerInterval: 2,
      rateLimitInterval: 1,
      scope: 'public',
    });
    this.ftApiBaseUrl = `${this.configService.get(
      `${LinkableService.Ft}.api.baseUrl`
    )}`;
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

  async getLatestActiveLocation() {
    const data = await this.apiClient.request<FtLocation[]>(
      '/locations?sort=-id&filter[active]=true&per_page=1',
      { authenticated: true }
    );
    return data[0];
  }

  async getAllLocations(latestLocationId?: number) {
    return this.apiClient.requestLoopOverLinkHeader<FtLocation>(
      '/locations?sort=-id&per_page=100',
      { authenticated: true },
      (data) => {
        return !(
          latestLocationId !== undefined &&
          data[data.length - 1].id <= latestLocationId
        );
      }
    );
  }

  async getAllActiveLocations(latestLocationId?: number) {
    return this.apiClient.requestLoopOverLinkHeader<FtLocation>(
      '/locations?sort=-id&filter[active]=true&per_page=100',
      { authenticated: true },
      (data) => {
        return !(
          latestLocationId !== undefined &&
          data[data.length - 1].id <= latestLocationId
        );
      }
    );
  }
}
