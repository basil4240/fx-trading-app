import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export enum CurrencySortBy {
  Code = 'code',
  Name = 'name',
  CreatedAt = 'createdAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class CurrencyFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by funding eligibility' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isFundingCurrency?: boolean;

  @ApiPropertyOptional({ description: 'Search by code or name', example: 'USD' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by', enum: CurrencySortBy, default: CurrencySortBy.Code })
  @IsOptional()
  @IsEnum(CurrencySortBy)
  sortBy?: CurrencySortBy = CurrencySortBy.Code;

  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder, default: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
