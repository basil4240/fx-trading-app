import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { IamModule } from './iam/iam.module';
import { AccountModule } from './account/account.module';
import { NotificationModule } from './notification/notification.module';
import { WalletModule } from './wallet/wallet.module';
import { FxModule } from './fx/fx.module';
import { TradingModule } from './trading/trading.module';
import { AuditModule } from './audit/audit.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'winifred',
      database: 'typeorm_demo',
      autoLoadEntities: true,
      synchronize: true,
    }),
    CommonModule,
    IamModule,
    AccountModule,
    NotificationModule,
    WalletModule,
    FxModule,
    TradingModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
