import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { TradeStatus } from 'src/common/enums/trade-status.enum';

export enum TradeSortBy {
  CreatedAt = 'createdAt',
  FromAmount = 'fromAmount',
  ToAmount = 'toAmount',
  Rate = 'rate',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class TradeHistoryFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by source currency', example: 'NGN' })
  @IsOptional()
  @IsString()
  fromCurrency?: string;

  @ApiPropertyOptional({ description: 'Filter by target currency', example: 'USD' })
  @IsOptional()
  @IsString()
  toCurrency?: string;

  @ApiPropertyOptional({ description: 'Filter by trade status', enum: TradeStatus })
  @IsOptional()
  @IsEnum(TradeStatus)
  status?: TradeStatus;

  @ApiPropertyOptional({ description: 'Start date for range filter (ISO 8601)', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsISO8601()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'End date for range filter (ISO 8601)', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsISO8601()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Field to sort by', enum: TradeSortBy, default: TradeSortBy.CreatedAt })
  @IsOptional()
  @IsEnum(TradeSortBy)
  sortBy?: TradeSortBy = TradeSortBy.CreatedAt;

  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
