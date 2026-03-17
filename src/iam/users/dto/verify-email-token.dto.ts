/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
 
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * DTO for verifying an email with a token.
 */
export class VerifyEmailTokenDto {
  /**
   * The unique identifier of the user.
   * @example 'clrm442s000003h12k43l3m4n'
   */
  @ApiProperty({
    description: 'The unique identifier of the user.',
    example: 'clrm442s000003h12k43l3m4n',
  })
  @IsString() // Assuming CUID is a string
  @IsNotEmpty()
  userId: string;

  /**
   * The email address associated with the verification request.
   * @example 'john.doe@example.com'
   */
  @ApiProperty({
    description: 'The email address associated with the verification request.',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  /**
   * The verification token sent to the user's email.
   * @example 'somerandomverificationtokenstring'
   */
  @ApiProperty({
    description: "The verification token sent to the user's email.",
    example: 'somerandomverificationtokenstring',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
