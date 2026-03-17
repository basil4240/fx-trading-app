import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCurrencyPairDto {
  @ApiProperty({ description: 'Base currency code', example: 'NGN' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  baseCurrencyCode: string;

  @ApiProperty({ description: 'Quote currency code', example: 'USD' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  quoteCurrencyCode: string;
}
