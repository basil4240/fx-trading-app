/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { TokenTypeRequestPurpose } from '../enums/token-type-request-purpose.enum';

export class RequestNewTokenDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user requesting a new token.',
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email!: string;

  @ApiProperty({
    enum: TokenTypeRequestPurpose,
    example: TokenTypeRequestPurpose.PASSWORD_RESET,
    description: 'The purpose for which a new token is requested.',
  })
  @IsIn(Object.values(TokenTypeRequestPurpose))
  @IsNotEmpty()
  purpose!: TokenTypeRequestPurpose;
}
