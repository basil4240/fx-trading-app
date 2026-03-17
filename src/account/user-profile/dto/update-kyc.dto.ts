import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { KycStatus } from 'src/common/enums/kyc-status.enum';

export class UpdateKycDto {
  @ApiProperty({
    description: 'The new KYC status',
    enum: KycStatus,
    example: KycStatus.Verified,
  })
  @IsEnum(KycStatus)
  status: KycStatus;
}
