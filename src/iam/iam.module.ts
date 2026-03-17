import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [CommonModule, UsersModule],
  exports: [UsersModule],
})
export class IamModule {}
