import { ApiProperty } from '@nestjs/swagger';

export abstract class MessageResponse {
  @ApiProperty({
    description: 'Response message describing the operation result',
    example: 'Operation completed successfully',
    type: String,
  })
  readonly message: string;
}
