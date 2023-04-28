import { HttpService } from '@nestjs/axios';
import { InternalServerErrorException } from '@nestjs/common';
import parseLinkHeader from 'parse-link-header';
import { catchError, firstValueFrom } from 'rxjs';
import { AccessToken, ClientCredentials } from 'simple-oauth2';
import { AxiosRequestConfig } from 'axios';
import { AutofillTokenBucket } from './autofill-token-bucket';

export interface ApiClientOptions {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  maxRequestsPerInterval: number;
  rateLimitInterval: number;
  tokenHost?: string;
  scope: string;
}

export type ApiRequestHeaders<T = unknown> = AxiosRequestConfig<T>['headers'];

export interface ApiRequestOptions {
  authenticated?: boolean;
  method?: 'get' | 'head' | 'patch' | 'post' | 'put' | 'delete';
}

export class ApiClient {
  private baseUrl: string;
  public accessToken!: AccessToken;
  public bucket: AutofillTokenBucket;
  public client: ClientCredentials;
  public scope: string;

  constructor(
    private httpService: HttpService,
    {
      baseUrl,
      clientId,
      clientSecret,
      maxRequestsPerInterval,
      rateLimitInterval,
      tokenHost,
      scope,
    }: ApiClientOptions
  ) {
    this.baseUrl = baseUrl;
    this.bucket = new AutofillTokenBucket(
      maxRequestsPerInterval,
      rateLimitInterval
    );
    this.client = new ClientCredentials({
      client: {
        id: clientId,
        secret: clientSecret,
      },
      auth: {
        tokenHost: tokenHost || baseUrl,
      },
    });
    this.scope = scope;
  }

  async populateAccessToken() {
    if (this.accessToken) {
      if (this.accessToken.expired()) {
        this.accessToken = await this.accessToken.refresh({
          scope: this.scope,
        });
      }
    } else {
      this.accessToken = await this.client.getToken({ scope: this.scope });
    }
  }

  async getAccessToken() {
    await this.populateAccessToken();
    return this.accessToken.token.access_token;
  }

  async baseRequest<T = unknown>(
    uri: string,
    { method = 'get', authenticated = false }: ApiRequestOptions = {
      method: 'get',
      authenticated: false,
    }
  ) {
    const token = await this.bucket.getToken();

    const headers: ApiRequestHeaders = {};
    if (authenticated) {
      const accessToken = await this.getAccessToken();
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await firstValueFrom(
      this.httpService[method]<T>(
        `${/^http(s)?:\/\//.test(uri) ? '' : this.baseUrl}${uri}`,
        {
          headers,
        }
      ).pipe(
        catchError((error) => {
          throw new InternalServerErrorException(error.message);
        })
      )
    );
    token.setDate(new Date());
    return response;
  }

  async request<T = unknown>(
    uri: string,
    config?: ApiRequestOptions
  ): Promise<T> {
    const { data } = await this.baseRequest<T>(uri, config);
    return data;
  }

  async requestLoopOverLinkHeader<T = unknown>(
    uri: string,
    config?: ApiRequestOptions,
    loopCondition?: (data: T[]) => boolean
  ) {
    let aggregatedData: T[] = [];
    let loopUrl: string | null = uri;
    while (loopUrl) {
      const { headers, data } = await this.baseRequest<T[]>(loopUrl, config);
      aggregatedData = aggregatedData.concat(data);

      if (loopCondition && !loopCondition(data)) break;

      const links = parseLinkHeader(headers.link);
      if (links && links.next) loopUrl = links.next.url;
      else loopUrl = null;
    }
    return aggregatedData;
  }
}
