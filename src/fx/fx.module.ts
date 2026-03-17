import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { FxService } from './fx.service';
import { FxController } from './fx.controller';
import { Currency } from './entities/currency.entity';
import { CurrencyPair } from './entities/currency-pair.entity';
import { ExchangeRateApiProvider } from './providers/exchange-rate-api.provider';
import { CommonModule } from 'src/common/common.module';
import { FxProvider } from './providers/fx-provider.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Currency, CurrencyPair]),
    HttpModule,
    CommonModule,
  ],
  controllers: [FxController],
  providers: [

    {
      provide: FxProvider,
      useClass: ExchangeRateApiProvider,
    },
    
    FxService],
  exports: [FxService],
})
export class FxModule {}
