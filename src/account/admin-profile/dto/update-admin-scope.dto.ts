import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class UpdateAdminScopeDto {
  @ApiProperty({
    description: 'Granular permission overrides for the admin',
    example: { can_view_sensitive_data: true },
  })
  @IsObject()
  permissionsScope: Record<string, any>;
}
