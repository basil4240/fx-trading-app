import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { AuthType } from 'src/common/enums/auth-type.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { DataResponse } from 'src/common/responses/data.response';
import { UserProfileService } from './user-profile.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { UserProfile } from '../entities/user-profile.entity';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';

@ApiTags('User Profiles')
@ApiBearerAuth()
// @UseGuards(AuthenticationGuard, RolesGuard)
@Controller('user-profiles')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('me')
  async getMe(@ActiveUser('sub') userId: string): Promise<DataResponse<UserProfile>> {
    const profile = await this.userProfileService.findByUserId(userId);
    return {
      message: 'User profile retrieved successfully',
      data: profile,
    };
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch('me')
  async updateMe(
    @ActiveUser('sub') userId: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<DataResponse<UserProfile>> {
    const profile = await this.userProfileService.update(userId, updateUserProfileDto);
    return {
      message: 'User profile updated successfully',
      data: profile,
    };
  }

  @ApiOperation({ summary: 'Get a specific user profile (Admin only)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.Admin, Role.SuperAdmin)
  @Get(':id')
  async findOne(@Param('id') userId: string): Promise<DataResponse<UserProfile>> {
    const profile = await this.userProfileService.findByUserId(userId);
    return {
      message: 'User profile retrieved successfully',
      data: profile,
    };
  }

  @ApiOperation({ summary: 'Update KYC status of a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.Admin, Role.SuperAdmin)
  @Patch(':id/kyc')
  async updateKyc(
    @Param('id') userId: string,
    @Body() updateKycDto: UpdateKycDto,
  ): Promise<DataResponse<UserProfile>> {
    const profile = await this.userProfileService.updateKyc(userId, updateKycDto);
    return {
      message: 'KYC status updated successfully',
      data: profile,
    };
  }
}
