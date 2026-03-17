import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';

@Module({
  imports: [CommonModule, UsersModule, AdminsModule],
  exports: [UsersModule, AdminsModule],
})
export class IamModule {}
