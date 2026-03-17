import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiProperty({
    description: 'The department of the admin',
    example: 'Finance',
    required: false,
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({
    description: 'The employee ID of the admin',
    example: 'EMP-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  employeeId?: string;
}
