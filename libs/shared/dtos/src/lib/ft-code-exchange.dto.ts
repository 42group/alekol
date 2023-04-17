import { IsNotEmpty, IsString } from 'class-validator';

export class FtCodeExchangeDto {
  @IsNotEmpty()
  @IsString()
  code!: string;
}
