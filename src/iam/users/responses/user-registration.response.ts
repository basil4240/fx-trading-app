import { ApiProperty } from '@nestjs/swagger';

/**
 * Response model for successful user registration.
 */
export class UserRegistrationResponse {
  /**
   * The unique identifier of the newly registered user.
   * @example 'clrm442s000003h12k43l3m4n'
   */
  @ApiProperty({
    description: 'The unique identifier of the newly registered user.',
    example: 'clrm442s000003h12k43l3m4n',
  })
  userId: string;

  /**
   * The email address of the newly registered user.
   * @example 'john.doe@example.com'
   */
  @ApiProperty({
    description: 'The email address of the newly registered user.',
    example: 'john.doe@example.com',
  })
  email: string;
}
