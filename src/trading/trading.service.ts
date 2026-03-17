/* eslint-disable prefer-const */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Trade } from './entities/trade.entity';
import { TradeFee } from './entities/trade-fee.entity';
import { ExecuteTradeDto } from './dto/execute-trade.dto';
import { TradeHistoryFilterDto } from './dto/trade-history-filter.dto';
import { FxService } from 'src/fx/fx.service';
import { WalletBalance } from 'src/wallet/entities/wallet-balance.entity';
import { TradeStatus } from 'src/common/enums/trade-status.enum';
import { TradeType } from 'src/common/enums/trade-type.enum';
import { AuditService } from 'src/audit/audit.service';
import { NotificationDispatcher } from 'src/notification/notification.dispatcher';
import { IamUser } from 'src/iam/entities/iam-user.entity';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);
  private readonly PLATFORM_FEE_PERCENT = 0.01; // 1% fee for now

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Trade)
    private readonly tradeRepo: Repository<Trade>,
    @InjectRepository(TradeFee)
    private readonly tradeFeeRepo: Repository<TradeFee>,
    @InjectRepository(IamUser)
    private readonly userRepo: Repository<IamUser>,
    private readonly fxService: FxService,
    private readonly auditService: AuditService,
    private readonly notificationDispatcher: NotificationDispatcher,
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

      const sourceBalanceBefore = sourceBalance.balance;
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

      const destBalanceBefore = destinationBalance.balance;
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

      // Record Ledger Entries
      // Debit Entry
      await this.auditService.recordLedgerEntry(
        {
          iamUserId: userId,
          entityType: 'TRADE',
          entityId: savedTrade.id,
          action: 'DEBIT',
          amount: dto.fromAmount,
          currencyCode: dto.fromCurrencyCode,
          balanceBefore: sourceBalanceBefore,
          balanceAfter: sourceBalance.balance,
          metadata: { trade_id: savedTrade.id, side: 'from' },
        },
        manager,
      );

      // Credit Entry
      await this.auditService.recordLedgerEntry(
        {
          iamUserId: userId,
          entityType: 'TRADE',
          entityId: savedTrade.id,
          action: 'CREDIT',
          amount: netToAmount,
          currencyCode: dto.toCurrencyCode,
          balanceBefore: destBalanceBefore,
          balanceAfter: destinationBalance.balance,
          metadata: {
            trade_id: savedTrade.id,
            side: 'to',
            rate,
            fee: feeAmount,
          },
        },
        manager,
      );

      // Send Notification
      const user = await this.userRepo.findOneBy({ id: userId });
      if (user) {
        await this.notificationDispatcher.sendTradeConfirmationEmail(user.email, {
          fromAmount: Number(dto.fromAmount),
          fromCurrency: dto.fromCurrencyCode,
          toAmount: Number(netToAmount),
          toCurrency: dto.toCurrencyCode,
          rate: rate,
          fee: feeAmount,
          reference: savedTrade.id,
        });
      }

      return savedTrade;
    });
  }

  async getUserTrades(userId: string, filterDto: TradeHistoryFilterDto): Promise<{ items: Trade[], total: number }> {
    const { 
      limit = 10, 
      page = 1, 
      fromCurrency, 
      toCurrency, 
      status, 
      fromDate, 
      toDate, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = filterDto;

    const offset = (page - 1) * limit;

    const queryBuilder = this.tradeRepo.createQueryBuilder('trade')
      .where('trade.iamUserId = :userId', { userId });

    if (fromCurrency) {
      queryBuilder.andWhere('trade.fromCurrencyCode = :fromCurrency', { fromCurrency });
    }

    if (toCurrency) {
      queryBuilder.andWhere('trade.toCurrencyCode = :toCurrency', { toCurrency });
    }

    if (status) {
      queryBuilder.andWhere('trade.status = :status', { status });
    }

    if (fromDate) {
      queryBuilder.andWhere('trade.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('trade.createdAt <= :toDate', { toDate });
    }

    queryBuilder.orderBy(`trade.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .take(limit)
      .skip(offset);

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
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
