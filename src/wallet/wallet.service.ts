import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletBalance } from './entities/wallet-balance.entity';
import { FundingTransaction } from './entities/funding-transaction.entity';
import { MockFundingProvider } from './providers/mock-funding.provider';
import { InitializeFundingDto } from './dto/initialize-funding.dto';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';
import { Currency } from 'src/fx/entities/currency.entity';
import { IamUser } from 'src/iam/entities/iam-user.entity';
import { FundingProvider } from './providers/funding-provider.interface';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletBalance)
    private readonly balanceRepo: Repository<WalletBalance>,
    @InjectRepository(FundingTransaction)
    private readonly transactionRepo: Repository<FundingTransaction>,
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
    @InjectRepository(IamUser)
    private readonly userRepo: Repository<IamUser>,
    private readonly fundingProvider: FundingProvider,
  ) {}

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findOneBy({ iamUserId: userId });
    if (!wallet) {
      wallet = this.walletRepo.create({ iamUserId: userId });
      wallet = await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async getBalances(userId: string): Promise<WalletBalance[]> {
    const wallet = await this.getOrCreateWallet(userId);
    return this.balanceRepo.find({
      where: { walletId: wallet.iamUserId },
      relations: ['currency'],
    });
  }

  async initializeFunding(userId: string, dto: InitializeFundingDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    const currency = await this.currencyRepo.findOneBy({
      code: dto.currencyCode,
    });

    if (!currency || !currency.isFundingCurrency) {
      throw new BadRequestException(
        `Currency ${dto.currencyCode} is not supported for funding`,
      );
    }

    const wallet = await this.getOrCreateWallet(userId);

    const fundingResponse = await this.fundingProvider.initializeFunding(
      dto.amount,
      dto.currencyCode,
      user.email,
    );

    const transaction = this.transactionRepo.create({
      walletId: wallet.iamUserId,
      amount: dto.amount,
      currencyCode: dto.currencyCode,
      provider: this.fundingProvider.getName(),
      reference: fundingResponse.reference,
      status: TransactionStatus.Pending,
      metadata: fundingResponse.data,
    });

    await this.transactionRepo.save(transaction);

    return fundingResponse;
  }

  async verifyFunding(userId: string, reference: string) {
    const transaction = await this.transactionRepo.findOne({
      where: { reference, walletId: userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.Pending) {
      throw new ConflictException(`Transaction already ${transaction.status}`);
    }

    const verification = await this.fundingProvider.verifyFunding(reference);

    if (verification.status === 'success') {
      await this.dataSource.transaction(async (manager) => {
        // 1. Update Transaction Status
        await manager.update(
          FundingTransaction,
          { id: transaction.id },
          {
            status: TransactionStatus.Completed,
          },
        );

        // 2. Credit Wallet Balance with Row Locking
        let balance = await manager.findOne(WalletBalance, {
          where: { walletId: userId, currencyCode: transaction.currencyCode },
          lock: { mode: 'pessimistic_write' },
        });

        if (!balance) {
          balance = manager.create(WalletBalance, {
            walletId: userId,
            currencyCode: transaction.currencyCode,
            balance: 0,
          });
        }

        balance.balance = Number(balance.balance) + Number(transaction.amount);
        await manager.save(balance);

        // TODO: Create ledger entry in Audit module
      });

      return { status: 'success', message: 'Wallet funded successfully' };
    } else {
      await this.transactionRepo.update(
        { id: transaction.id },
        {
          status: TransactionStatus.Failed,
        },
      );
      throw new BadRequestException('Payment verification failed');
    }
  }
}
