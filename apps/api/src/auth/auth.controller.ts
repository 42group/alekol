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
import { IronSession } from 'iron-session';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('oauth2/discord/code')
  async exchangeDiscordCode(
    @Body() discordCodeExchangeDto: DiscordCodeExchangeDto,
    @Session() session: IronSession
  ) {
    const discordUser = await this.authService.exchangeDiscordCodeWithUser(
      discordCodeExchangeDto.code
    );
    await this.authService.saveDiscordUserInSession(session, discordUser);
    return session.user.accountLinking.discord;
  }

  @Post('oauth2/42/code')
  async exchangeFtCode(
    @Body() ftCodeExchangeDto: FtCodeExchangeDto,
    @Session() session: IronSession
  ) {
    const ftUser = await this.authService.exchangeFtCodeWithUser(
      ftCodeExchangeDto.code
    );
    await this.authService.saveFtUserInSession(session, ftUser);
    return session.user.accountLinking.ft;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('oauth2/discord/unlink')
  async unlinkDiscord(@Session() session: IronSession) {
    await this.authService.unlinkDiscord(session);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('oauth2/42/unlink')
  async unlinkFt(@Session() session: IronSession) {
    await this.authService.unlinkFt(session);
  }
}
