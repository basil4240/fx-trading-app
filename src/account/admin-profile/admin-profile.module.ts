import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProfile } from '../entities/admin-profile.entity';
import { AdminProfileService } from './admin-profile.service';
import { AdminProfileController } from './admin-profile.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([AdminProfile])],
  providers: [AdminProfileService],
  controllers: [AdminProfileController],
  exports: [AdminProfileService],
})
export class AdminProfileModule {}
