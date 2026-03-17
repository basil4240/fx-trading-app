/* eslint-disable prefer-const */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Trade } from './entities/trade.entity';
import { TradeFee } from './entities/trade-fee.entity';
import { ExecuteTradeDto } from './dto/execute-trade.dto';
import { FxService } from 'src/fx/fx.service';
import { WalletService } from 'src/wallet/wallet.service';
import { WalletBalance } from 'src/wallet/entities/wallet-balance.entity';
import { TradeStatus } from 'src/common/enums/trade-status.enum';
import { TradeType } from 'src/common/enums/trade-type.enum';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);
  // TODO: make admin nanipulate this value
  private readonly PLATFORM_FEE_PERCENT = 0.01; // i choosed 1% fee for now,

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Trade)
    private readonly tradeRepo: Repository<Trade>,
    @InjectRepository(TradeFee)
    private readonly tradeFeeRepo: Repository<TradeFee>,
    private readonly fxService: FxService,
    private readonly walletService: WalletService,
  ) {}

  async executeTrade(userId: string, dto: ExecuteTradeDto): Promise<Trade> {
    // Idempotency Check
    const existingTrade = await this.tradeRepo.findOneBy({
      idempotencyKey: dto.idempotencyKey,
    });
    if (existingTrade) {
      return existingTrade;
    }

    // Fetch Rate
    const rate = await this.fxService.getRate(
      dto.fromCurrencyCode,
      dto.toCurrencyCode,
    );

    // Start Transaction
    return await this.dataSource.transaction(async (manager) => {
      // Lock Source Balance
      let sourceBalance = await manager.findOne(WalletBalance, {
        where: { walletId: userId, currencyCode: dto.fromCurrencyCode },
        lock: { mode: 'pessimistic_write' },
      });

      if (!sourceBalance || sourceBalance.balance < dto.fromAmount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Calculate amounts and fees
      const grossToAmount = dto.fromAmount * rate;
      const feeAmount = grossToAmount * this.PLATFORM_FEE_PERCENT;
      const netToAmount = grossToAmount - feeAmount;

      // Debit Source
      sourceBalance.balance =
        Number(sourceBalance.balance) - Number(dto.fromAmount);
      await manager.save(sourceBalance);

      // Credit Destination
      let destinationBalance = await manager.findOne(WalletBalance, {
        where: { walletId: userId, currencyCode: dto.toCurrencyCode },
        lock: { mode: 'pessimistic_write' },
      });

      if (!destinationBalance) {
        destinationBalance = manager.create(WalletBalance, {
          walletId: userId,
          currencyCode: dto.toCurrencyCode,
          balance: 0,
        });
      }

      destinationBalance.balance =
        Number(destinationBalance.balance) + Number(netToAmount);
      await manager.save(destinationBalance);

      // Record Trade
      const trade = manager.create(Trade, {
        iamUserId: userId,
        fromCurrencyCode: dto.fromCurrencyCode,
        toCurrencyCode: dto.toCurrencyCode,
        fromAmount: dto.fromAmount,
        toAmount: netToAmount,
        rate: rate,
        fee: feeAmount,
        status: TradeStatus.Completed,
        type: TradeType.Conversion,
        idempotencyKey: dto.idempotencyKey,
        executedAt: new Date(),
      });

      const savedTrade = await manager.save(trade);

      // Record Fee
      const tradeFee = manager.create(TradeFee, {
        tradeId: savedTrade.id,
        feeType: 'platform_fee',
        amount: feeAmount,
        currencyCode: dto.toCurrencyCode,
      });
      await manager.save(tradeFee);

      // TODO: Create ledger entries in Audit module

      return savedTrade;
    });
  }

  async getUserTrades(userId: string): Promise<Trade[]> {
    return this.tradeRepo.find({
      where: { iamUserId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTradeById(id: string, userId: string): Promise<Trade> {
    const trade = await this.tradeRepo.findOne({
      where: { id, iamUserId: userId },
    });
    if (!trade) {
      throw new NotFoundException('Trade not found');
    }
    return trade;
  }
}
