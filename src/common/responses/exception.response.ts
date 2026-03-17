import { ApiProperty } from '@nestjs/swagger';

export class ExceptionResponse {
  @ApiProperty({
    description: 'Primary error message',
    example: 'Validation failed',
    type: String,
  })
  readonly message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
    type: Number,
  })
  readonly statusCode: number;

  @ApiProperty({
    description: 'Error type or category',
    example: 'Bad Request',
    type: String,
  })
  readonly error: string;

  @ApiProperty({
    description: 'Additional error messages or validation details',
    example: ['Email is required', 'Password must be at least 8 characters'],
    type: [String],
    required: false,
  })
  readonly messages?: string[];
  
}