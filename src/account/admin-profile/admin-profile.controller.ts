import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { DataResponse } from 'src/common/responses/data.response';
import { AdminProfileService } from './admin-profile.service';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { UpdateAdminScopeDto } from './dto/update-admin-scope.dto';
import { AdminProfile } from '../entities/admin-profile.entity';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';

@ApiTags('Admin Profiles')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('admin-profiles')
export class AdminProfileController {
  constructor(private readonly adminProfileService: AdminProfileService) {}

  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.Admin, Role.SuperAdmin)
  @Get('me')
  async getMe(@ActiveUser('sub') userId: string): Promise<DataResponse<AdminProfile>> {
    const profile = await this.adminProfileService.findByUserId(userId);
    return {
      message: 'Admin profile retrieved successfully',
      data: profile,
    };
  }

  @ApiOperation({ summary: 'Update current admin profile' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.Admin, Role.SuperAdmin)
  @Patch('me')
  async updateMe(
    @ActiveUser('sub') userId: string,
    @Body() updateAdminProfileDto: UpdateAdminProfileDto,
  ): Promise<DataResponse<AdminProfile>> {
    const profile = await this.adminProfileService.update(userId, updateAdminProfileDto);
    return {
      message: 'Admin profile updated successfully',
      data: profile,
    };
  }

  @ApiOperation({ summary: 'List all administrative staff (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.SuperAdmin)
  @Get()
  async findAll(): Promise<DataResponse<AdminProfile[]>> {
    const profiles = await this.adminProfileService.findAll();
    return {
      message: 'Admin profiles retrieved successfully',
      data: profiles,
    };
  }

  @ApiOperation({ summary: 'Update an admin\'s department or permission scope (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.SuperAdmin)
  @Patch(':id/scope')
  async updateScope(
    @Param('id') userId: string,
    @Body() updateAdminScopeDto: UpdateAdminScopeDto,
  ): Promise<DataResponse<AdminProfile>> {
    const profile = await this.adminProfileService.updateScope(userId, updateAdminScopeDto);
    return {
      message: 'Admin profile scope updated successfully',
      data: profile,
    };
  }
}
