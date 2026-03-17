import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyFundingDto {
  @ApiProperty({ description: 'Transaction reference', example: 'MOCK-123456' })
  @IsString()
  @IsNotEmpty()
  reference: string;
}
