import { ApiProperty } from '@nestjs/swagger';

/**
 * Response model for unauthenticated or partially authenticated user data.
 * This can be used when a user exists but needs to verify email, or for sending tokens.
 */
export class AuthenticationResponse {
  /**
   * The unique identifier of the user.
   * @example 'clrm442s000003h12k43l3m4n'
   */
  @ApiProperty({
    description: 'The unique identifier of the user.',
    example: 'clrm442s000003h12k43l3m4n',
  })
  userId: string;

  /**
   * The email address of the user.
   * @example 'john.doe@example.com'
   */
  @ApiProperty({
    description: 'The email address of the user.',
    example: 'john.doe@example.com',
  })
  email: string;

  /**
   * An optional refresh token for the user session.
   * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   * @optional
   */
  @ApiProperty({
    description: 'An optional refresh token for the user session.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;

  /**
   * An optional access token for the user session.
   * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   * @optional
   */
  @ApiProperty({
    description: 'An optional access token for the user session.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  accessToken?: string;
}
