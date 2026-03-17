import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TradingService } from './trading.service';
import { ExecuteTradeDto } from './dto/execute-trade.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { DataResponse } from 'src/common/responses';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('Trading')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @ApiOperation({ summary: 'Execute a currency conversion/trade' })
  @ApiResponse({ status: 201, description: 'Created' })
  @Roles(Role.User)
  @Post('execute')
  async executeTrade(
    @ActiveUser('sub') userId: string,
    @Body() dto: ExecuteTradeDto,
  ): Promise<DataResponse<any>> {
    const trade = await this.tradingService.executeTrade(userId, dto);
    return {
      message: 'Trade executed successfully',
      data: trade,
    };
  }

  @ApiOperation({ summary: 'Get current user trade history' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.User)
  @Get('history')
  async getHistory(
    @ActiveUser('sub') userId: string,
  ): Promise<DataResponse<any>> {
    const trades = await this.tradingService.getUserTrades(userId);
    return {
      message: 'Trade history retrieved successfully',
      data: trades,
    };
  }

  @ApiOperation({ summary: 'Get a specific trade by ID' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.User)
  @Get(':id')
  async getTrade(
    @ActiveUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<DataResponse<any>> {
    const trade = await this.tradingService.getTradeById(id, userId);
    return {
      message: 'Trade details retrieved successfully',
      data: trade,
    };
  }
}
