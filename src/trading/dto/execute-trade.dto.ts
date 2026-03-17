import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ExecuteTradeDto {
  @ApiProperty({ description: 'Currency to convert from', example: 'NGN' })
  @IsString()
  @IsNotEmpty()
  fromCurrencyCode: string;

  @ApiProperty({ description: 'Currency to convert to', example: 'USD' })
  @IsString()
  @IsNotEmpty()
  toCurrencyCode: string;

  @ApiProperty({ description: 'Amount of fromCurrency to spend', example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.00000001)
  fromAmount: number;

  @ApiProperty({ description: 'Unique key to prevent duplicate trades', example: 'uuid-or-unique-string' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}
