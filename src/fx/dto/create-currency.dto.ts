import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({ description: 'Currency code (e.g., NGN, USD)', example: 'NGN' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  code: string;

  @ApiProperty({ description: 'Full name of the currency', example: 'Nigerian Naira' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Currency symbol', example: '₦', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(5)
  symbol?: string;

  @ApiProperty({ description: 'Is this a primary funding currency?', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isFundingCurrency?: boolean;
}
