import { Module } from '@nestjs/common';
import { IamService } from './iam.service';
import { IamController } from './iam.controller';

@Module({
  controllers: [IamController],
  providers: [IamService],
})
export class IamModule {}
