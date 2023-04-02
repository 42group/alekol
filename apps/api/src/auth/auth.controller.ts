import { Body, Controller, Post, Session } from '@nestjs/common';
import { DiscordCodeExchangeDto } from '@alekol/shared/dtos';
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
}
