import { ApiProperty } from '@nestjs/swagger';

export abstract class DataResponse<T> {
  @ApiProperty({
    description: 'Response message describing the operation result',
    example: 'Operation completed successfully',
    type: String,
  })
  readonly message: string;
  
  readonly data: T;
}