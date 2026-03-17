import { ApiProperty } from '@nestjs/swagger';

export class Pagination {
  @ApiProperty({
    description: 'Indicates if there is a next page available',
    example: true,
    type: Boolean,
  })
  readonly hasNextPage: boolean;

  @ApiProperty({
    description: 'Indicates if there is a previous page available',
    example: false,
    type: Boolean,
  })
  readonly hasPrevPage: boolean;

  @ApiProperty({
    description: 'Total number of records',
    example: 150,
    type: Number,
  })
  readonly total: number;
}

export abstract class PaginatedDataResponse<T> {
  @ApiProperty({
    description: 'Response message describing the operation result',
    example: 'Data retrieved successfully',
    type: String,
  })
  readonly message: string;

  readonly data: T[];

  @ApiProperty({
    description: 'Pagination information',
    type: Pagination,
  })
  readonly pagination: Pagination;
}
