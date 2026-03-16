import { Module } from '@nestjs/common';
import { IamService } from './iam.service';
import { IamController } from './iam.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { IamUser } from './entities/iam-user.entity';
import { PasswordChangeToken } from './entities/password-change-token.entity';
import { PasswordHistory } from './entities/password-history.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IamUser,
      PasswordHistory,
      PasswordResetToken,
      PasswordChangeToken,
      EmailVerificationToken,
    ]),
  ],
  controllers: [IamController],
  providers: [IamService],
})
export class IamModule {}
