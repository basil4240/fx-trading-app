import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';

export enum FundingHistorySortBy {
  CreatedAt = 'createdAt',
  Amount = 'amount',
  Status = 'status',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FundingHistoryFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({ description: 'Field to sort by', enum: FundingHistorySortBy, default: FundingHistorySortBy.CreatedAt })
  @IsOptional()
  @IsEnum(FundingHistorySortBy)
  sortBy?: FundingHistorySortBy = FundingHistorySortBy.CreatedAt;

  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
