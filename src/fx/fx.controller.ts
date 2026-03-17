import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FxService } from './fx.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { CreateCurrencyPairDto } from './dto/create-currency-pair.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { DataResponse } from 'src/common/responses/data.response';
import { Currency } from './entities/currency.entity';
import { CurrencyPair } from './entities/currency-pair.entity';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';

@ApiTags('FX')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('fx')
export class FxController {
  constructor(private readonly fxService: FxService) {}

  // ============================================================================
  // PUBLIC / USER ENDPOINTS
  // ============================================================================

  @ApiOperation({ summary: 'Get all active FX rates' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('rates')
  async getRates(): Promise<DataResponse<any[]>> {
    const rates = await this.fxService.getAllActiveRates();
    return {
      message: 'Active rates retrieved successfully',
      data: rates,
    };
  }

  @ApiOperation({ summary: 'List all supported currencies' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('currencies')
  async listCurrencies(): Promise<DataResponse<Currency[]>> {
    const currencies = await this.fxService.listCurrencies();
    return {
      message: 'Currencies retrieved successfully',
      data: currencies,
    };
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @ApiOperation({ summary: 'Add a new supported currency (Admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @Roles(Role.Admin, Role.SuperAdmin)
  @Post('currencies')
  async createCurrency(
    @Body() createCurrencyDto: CreateCurrencyDto,
  ): Promise<DataResponse<Currency>> {
    const currency = await this.fxService.createCurrency(createCurrencyDto);
    return {
      message: 'Currency created successfully',
      data: currency,
    };
  }

  @ApiOperation({ summary: 'Add a new tradeable currency pair (Admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @Roles(Role.Admin, Role.SuperAdmin)
  @Post('pairs')
  async createPair(
    @Body() createCurrencyPairDto: CreateCurrencyPairDto,
    @ActiveUser('sub') adminId: string,
  ): Promise<DataResponse<CurrencyPair>> {
    const pair = await this.fxService.createPair(
      createCurrencyPairDto,
      adminId,
    );
    return {
      message: 'Currency pair created successfully',
      data: pair,
    };
  }

  @ApiOperation({ summary: 'List all currency pairs (Admin only)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.Admin, Role.SuperAdmin)
  @Get('pairs')
  async listPairs(): Promise<DataResponse<CurrencyPair[]>> {
    const pairs = await this.fxService.listPairs();
    return {
      message: 'Currency pairs retrieved successfully',
      data: pairs,
    };
  }

  @ApiOperation({ summary: 'Toggle currency pair status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Roles(Role.Admin, Role.SuperAdmin)
  @Patch('pairs/:id/toggle')
  async togglePair(
    @Param('id') id: string,
  ): Promise<DataResponse<CurrencyPair>> {
    const pair = await this.fxService.togglePairStatus(id);
    return {
      message: 'Currency pair status toggled successfully',
      data: pair,
    };
  }
}
