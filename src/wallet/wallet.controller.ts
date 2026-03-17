/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { InitializeFundingDto } from './dto/initialize-funding.dto';
import { VerifyFundingDto } from './dto/verify-funding.dto';
import { FundingHistoryFilterDto } from './dto/funding-history-filter.dto';
import { DataResponse, PaginatedDataResponse } from 'src/common/responses';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({ summary: 'Get current user wallet balances' })
  @Roles(Role.User)
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('balances')
  async getBalances(
    @ActiveUser('sub') userId: string,
  ): Promise<DataResponse<any>> {
    const balances = await this.walletService.getBalances(userId);
    return {
      message: 'Wallet balances retrieved successfully',
      data: balances,
    };
  }

  @ApiOperation({ summary: 'Get funding history' })
  @Roles(Role.User)
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('funding-history')
  async getFundingHistory(
    @ActiveUser('sub') userId: string,
    @Query() filterDto: FundingHistoryFilterDto,
  ): Promise<PaginatedDataResponse<any>> {
    const { items, total } = await this.walletService.getFundingHistory(
      userId,
      filterDto,
    );

    const limit = filterDto.limit || 10;
    const page = filterDto.page || 1;


    return {
      message: 'Funding history retrieved successfully',
      data: items,
      pagination: {
        total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  @ApiOperation({ summary: 'Initialize wallet funding' })
  @Roles(Role.User)
  @ApiResponse({ status: 201, description: 'Created' })
  @Post('fund/initialize')
  async initializeFunding(
    @ActiveUser('sub') userId: string,
    @Body() dto: InitializeFundingDto,
  ): Promise<DataResponse<any>> {
    const response = await this.walletService.initializeFunding(userId, dto);
    return {
      message: 'Funding initialized successfully',
      data: response,
    };
  }

  @ApiOperation({ summary: 'Verify wallet funding' })
  @Roles(Role.User)
  @ApiResponse({ status: 200, description: 'Success' })
  @Post('fund/verify')
  async verifyFunding(
    @ActiveUser('sub') userId: string,
    @Body() dto: VerifyFundingDto,
  ): Promise<DataResponse<any>> {
    const response = await this.walletService.verifyFunding(
      userId,
      dto.reference,
    );
    return {
      message: 'Funding verification completed',
      data: response,
    };
  }
}
