import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for verifying a password reset token.
 */
export class VerifyPasswordResetTokenDto {
  /**
   * The email address associated with the password reset request.
   * @example 'john.doe@example.com'
   */
  @ApiProperty({
    description:
      'The email address associated with the password reset request.',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * The password reset token received by the user.
   * @example 'somerandompasswordresettokenstring'
   */
  @ApiProperty({
    description: 'The password reset token received by the user.',
    example: 'somerandompasswordresettokenstring',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
