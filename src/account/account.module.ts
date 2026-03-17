import { Module } from '@nestjs/common';
import { UserProfileModule } from './user-profile/user-profile.module';
import { AdminProfileModule } from './admin-profile/admin-profile.module';

@Module({
  imports: [UserProfileModule, AdminProfileModule],
})
export class AccountModule {}
