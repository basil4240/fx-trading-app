import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TradingService } from './trading.service';
import { ExecuteTradeDto } from './dto/execute-trade.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { AuthType } from 'src/common/enums/auth-type.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { DataResponse } from 'src/common/responses';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { TradeHistoryFilterDto } from './dto/trade-history-filter.dto';

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
    @Query() filterDto: TradeHistoryFilterDto,
  ): Promise<any> {
    const { items, total } = await this.tradingService.getUserTrades(
      userId,
      filterDto,
    );

    const limit = filterDto.limit || 10;
    const page = filterDto.page || 1;

    return {
      message: 'Trade history retrieved successfully',
      data: items,
      pagination: {
        total,
        hasNextPage: total > page * limit,
        hasPrevPage: page > 1,
      },
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
