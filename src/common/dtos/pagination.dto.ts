import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'The number of items per page.',
    example: 10,
  })
  @IsOptional()
  @IsPositive({ message: 'limit must be a positive number.' })
  @IsInt({ message: 'limit must be an integer.' })
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: 'The current page number.',
    example: 1,
  })
  @IsOptional()
  @IsPositive({ message: 'page must be a positive number.' })
  @IsInt({ message: 'page must be an integer.' })
  readonly page?: number = 1;
}
