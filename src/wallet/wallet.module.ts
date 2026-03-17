import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';
import { WalletBalance } from './entities/wallet-balance.entity';
import { FundingTransaction } from './entities/funding-transaction.entity';
import { MockFundingProvider } from './providers/mock-funding.provider';
import { Currency } from 'src/fx/entities/currency.entity';
import { IamUser } from 'src/iam/entities/iam-user.entity';
import { FundingProvider } from './providers/funding-provider.interface';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([
      Wallet,
      WalletBalance,
      FundingTransaction,
      Currency,
      IamUser,
    ]),
    NotificationModule
  ],
  controllers: [WalletController],
  providers: [
    {
      provide: FundingProvider,
      useClass: MockFundingProvider,
    },
    WalletService],
  exports: [WalletService],
})
export class WalletModule {}
