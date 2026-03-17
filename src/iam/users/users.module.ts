import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import { IamUser } from '../entities/iam-user.entity';
import { PasswordChangeToken } from '../entities/password-change-token.entity';
import { PasswordHistory } from '../entities/password-history.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { UserProfile } from 'src/account/entities/user-profile.entity';
import { AdminProfile } from 'src/account/entities/admin-profile.entity';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IamUser,
      PasswordHistory,
      PasswordChangeToken,
      PasswordResetToken,
      EmailVerificationToken,
      UserProfile,
      AdminProfile,
    ]),
    CommonModule,
    NotificationModule,
    WalletModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
