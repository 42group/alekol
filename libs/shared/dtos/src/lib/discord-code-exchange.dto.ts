import { IsNotEmpty, IsString } from 'class-validator';

export class DiscordCodeExchangeDto {
  @IsNotEmpty()
  @IsString()
  code!: string;
}
