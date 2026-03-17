import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProfile } from '../entities/admin-profile.entity';
import { AdminProfileService } from './admin-profile.service';
import { AdminProfileController } from './admin-profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdminProfile])],
  providers: [AdminProfileService],
  controllers: [AdminProfileController],
  exports: [AdminProfileService],
})
export class AdminProfileModule {}
