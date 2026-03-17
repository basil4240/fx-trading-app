import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export enum CurrencyPairSortBy {
  CreatedAt = 'createdAt',
  BaseCurrencyCode = 'baseCurrencyCode',
  QuoteCurrencyCode = 'quoteCurrencyCode',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class CurrencyPairFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by base currency code', example: 'NGN' })
  @IsOptional()
  @IsString()
  baseCurrencyCode?: string;

  @ApiPropertyOptional({ description: 'Filter by quote currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  quoteCurrencyCode?: string;

  @ApiPropertyOptional({ description: 'Field to sort by', enum: CurrencyPairSortBy, default: CurrencyPairSortBy.CreatedAt })
  @IsOptional()
  @IsEnum(CurrencyPairSortBy)
  sortBy?: CurrencyPairSortBy = CurrencyPairSortBy.CreatedAt;

  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
