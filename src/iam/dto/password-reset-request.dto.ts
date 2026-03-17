/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * DTO for requesting a password reset.
 */
export class PasswordResetRequestDto {
  /**
   * The email address for which to request a password reset.
   * @example 'john.doe@example.com'
   */
  @ApiProperty({
    description: 'The email address for which to request a password reset.',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}
