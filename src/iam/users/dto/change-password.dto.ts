import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'P@ssword123',
    description: 'The old password of the user',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @ApiProperty({
    example: 'NewP@ssword123',
    description: 'The new password for the user',
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword!: string;
}
