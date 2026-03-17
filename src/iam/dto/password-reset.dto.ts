/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * DTO for resetting a user's password after token verification.
 */
export class PasswordResetDto {
  /**
   * The email address of the user whose password is being reset.
   * @example 'john.doe@example.com'
   */
  @ApiProperty({
    description: 'The email address of the user whose password is being reset.',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  /**
   * The new password for the user account.
   * @example 'NewS3cureP@ssw0rd'
   * @minLength 8
   */
  @ApiProperty({
    description: 'The new password for the user account.',
    example: 'NewS3cureP@ssw0rd',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
