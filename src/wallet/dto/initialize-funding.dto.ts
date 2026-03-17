import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class InitializeFundingDto {
  @ApiProperty({ description: 'Amount to fund', example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'NGN' })
  @IsString()
  @IsNotEmpty()
  currencyCode: string;
}
