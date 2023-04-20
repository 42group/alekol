import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Session,
} from '@nestjs/common';
import { DiscordCodeExchangeDto, FtCodeExchangeDto } from '@alekol/shared/dtos';
import { AuthenticationStatus, LinkableService } from '@alekol/shared/enums';
import { IronSession } from 'iron-session';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post(`oauth2/${LinkableService.Discord}/code`)
  async exchangeDiscordCode(
    @Body() discordCodeExchangeDto: DiscordCodeExchangeDto,
    @Session() session: IronSession
  ) {
    const discordUser = await this.authService.exchangeDiscordCodeWithUser(
      discordCodeExchangeDto.code
    );
    await this.authService.saveDiscordUserInSession(session, discordUser);

    const sessionUser = session.user?.accountLinking[LinkableService.Discord];
    return {
      ...sessionUser,
      status: AuthenticationStatus.Pending,
    };
  }

  @Post(`oauth2/${LinkableService.Ft}/code`)
  async exchangeFtCode(
    @Body() ftCodeExchangeDto: FtCodeExchangeDto,
    @Session() session: IronSession
  ) {
    const ftUser = await this.authService.exchangeFtCodeWithUser(
      ftCodeExchangeDto.code
    );
    await this.authService.saveFtUserInSession(session, ftUser);

    const sessionUser = session.user?.accountLinking[LinkableService.Ft];
    return {
      ...sessionUser,
      status: AuthenticationStatus.Pending,
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(`oauth2/${LinkableService.Discord}/unlink`)
  async unlinkDiscord(@Session() session: IronSession) {
    await this.authService.unlinkDiscord(session);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(`oauth2/${LinkableService.Ft}/unlink`)
  async unlinkFt(@Session() session: IronSession) {
    await this.authService.unlinkFt(session);
  }

  @Post('create-account')
  async createAccount(@Session() session: IronSession) {
    return this.authService.createAccount(session);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@Session() session: IronSession) {
    this.authService.logout(session);
  }
}
