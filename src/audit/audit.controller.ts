import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { AuthType } from 'src/common/enums/auth-type.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataResponse } from 'src/common/responses';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @ApiOperation({ summary: 'Get current user ledger entries' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.User)
  @Get('ledger')
  async getMyLedger(
    @ActiveUser('sub') userId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<DataResponse<any>> {
    const data = await this.auditService.getLedger(userId, paginationDto);
    return {
      message: 'Ledger entries retrieved successfully',
      data,
    };
  }

  @ApiOperation({ summary: 'Get all system audit logs (Admin only)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.Admin, Role.SuperAdmin)
  @Get('logs')
  async getSystemLogs(@Query() paginationDto: PaginationDto): Promise<DataResponse<any>> {
    const data = await this.auditService.getLogs(paginationDto);
    return {
      message: 'Audit logs retrieved successfully',
      data,
    };
  }
}
