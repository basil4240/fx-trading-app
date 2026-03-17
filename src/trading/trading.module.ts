import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { Trade } from './entities/trade.entity';
import { TradeFee } from './entities/trade-fee.entity';
import { FxModule } from 'src/fx/fx.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([Trade, TradeFee]),
    FxModule,
    WalletModule,
  ],
  controllers: [TradingController],
  providers: [TradingService],
})
export class TradingModule {}
