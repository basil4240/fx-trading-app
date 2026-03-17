import { ApiProperty } from '@nestjs/swagger';

/**
 * Response model for successful user login.
 */
export class UserLoginResponse {
  /**
   * The unique identifier of the logged-in user.
   * @example 'clrm442s000003h12k43l3m4n'
   */
  @ApiProperty({
    description: 'The unique identifier of the logged-in user.',
    example: 'clrm442s000003h12k43l3m4n',
  })
  userId: string;

  /**
   * The email address of the logged-in user.
   * @example 'john.doe@example.com'
   */
  @ApiProperty({
    description: 'The email address of the logged-in user.',
    example: 'john.doe@example.com',
  })
  email: string;

  /**
   * The access token for authenticating subsequent requests.
   * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   */
  @ApiProperty({
    description: 'The access token for authenticating subsequent requests.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  /**
   * The refresh token for obtaining new access tokens.
   * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   */
  @ApiProperty({
    description: 'The refresh token for obtaining new access tokens.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
