/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyChangePasswordTokenDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user requesting the password change.',
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email!: string;

  @ApiProperty({
    example: 'clyj8d2b0000108jl8v3n9z5y',
    description: 'The ID of the user requesting the password change.',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    example: 'some-long-and-secure-token',
    description:
      'The token received for verifying the password change request.',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
