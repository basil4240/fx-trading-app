import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamUser } from '../entities/iam-user.entity';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { CommonModule } from 'src/common/common.module';
import { AdminProfile } from 'src/account/entities/admin-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IamUser, AdminProfile]),
    CommonModule,
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
