import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponse {
  @ApiProperty({ example: 'clx2a1b3c0000d4e5f6g7h8i9', description: 'Unique identifier for the user profile.' })
  id: string;

  @ApiProperty({ example: 'John', description: 'First name of the user.' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user.' })
  lastName: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user.' })
  fullName: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg', description: 'URL to the user\'s profile picture.', required: false })
  profilePicture: string | null;
}
