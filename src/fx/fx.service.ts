import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { CurrencyPair } from './entities/currency-pair.entity';
import { RedisService } from 'src/common/services/local-storage/redis/redis.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { CreateCurrencyPairDto } from './dto/create-currency-pair.dto';
import { FxProvider } from './providers/fx-provider.interface';

@Injectable()
export class FxService {
  private readonly logger = new Logger(FxService.name);
  private readonly CACHE_TTL = 3600; 

  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
    @InjectRepository(CurrencyPair)
    private readonly currencyPairRepo: Repository<CurrencyPair>,
    private readonly fxProvider: FxProvider,
    private readonly cacheService: RedisService,
  ) {}

  // ============================================================================
  // RATE OPERATIONS
  // ============================================================================

  async getRate(base: string, quote: string): Promise<number> {
    const cacheKey = `fx-rates:${base}:${quote}`;
    
    // Try to get from cache first
    const cachedRate = await this.cacheService.get<number>(cacheKey);
    if (cachedRate) {
      return cachedRate;
    }

    // Fetch from provider
    try {
      const rate = await this.fxProvider.getRate(base, quote);
      
      // Store in cache
      await this.cacheService.set(cacheKey, rate, this.CACHE_TTL);
      
      return rate;
    } catch (error) {
      this.logger.error(`Failed to fetch rate for ${base}/${quote}: ${error.message}`);
      throw error;
    }
  }

  async getAllActiveRates(): Promise<any[]> {
    const pairs = await this.currencyPairRepo.find({
      where: { isActive: true },
    });

    const rates = await Promise.all(
      pairs.map(async (pair) => {
        try {
          const rate = await this.getRate(pair.baseCurrencyCode, pair.quoteCurrencyCode);
          return {
            pair: `${pair.baseCurrencyCode}/${pair.quoteCurrencyCode}`,
            rate,
          };
        } catch {
          return null;
        }
      }),
    );

    return rates.filter((r) => r !== null);
  }

  // ============================================================================
  // CURRENCY OPERATIONS (Admin)
  // ============================================================================

  async createCurrency(createCurrencyDto: CreateCurrencyDto): Promise<Currency> {
    const existing = await this.currencyRepo.findOne({
      where: { code: createCurrencyDto.code },
    });

    if (existing) {
      throw new ConflictException(`Currency ${createCurrencyDto.code} already exists`);
    }

    const currency = this.currencyRepo.create(createCurrencyDto);
    return this.currencyRepo.save(currency);
  }

  async listCurrencies(): Promise<Currency[]> {
    return this.currencyRepo.find();
  }

  // ============================================================================
  // PAIR OPERATIONS (Admin)
  // ============================================================================

  async createPair(createCurrencyPairDto: CreateCurrencyPairDto, adminId: string): Promise<CurrencyPair> {
    // Ensure both currencies exist
    const [base, quote] = await Promise.all([
      this.currencyRepo.findOneBy({ code: createCurrencyPairDto.baseCurrencyCode }),
      this.currencyRepo.findOneBy({ code: createCurrencyPairDto.quoteCurrencyCode }),
    ]);

    if (!base || !quote) {
      throw new NotFoundException('One or both currencies not found');
    }

    const existing = await this.currencyPairRepo.findOne({
      where: {
        baseCurrencyCode: createCurrencyPairDto.baseCurrencyCode,
        quoteCurrencyCode: createCurrencyPairDto.quoteCurrencyCode,
      },
    });

    if (existing) {
      throw new ConflictException('Currency pair already exists');
    }

    const pair = this.currencyPairRepo.create({
      ...createCurrencyPairDto,
      addedByAdminId: adminId,
    });

    return this.currencyPairRepo.save(pair);
  }

  async listPairs(): Promise<CurrencyPair[]> {
    return this.currencyPairRepo.find({
      relations: ['baseCurrency', 'quoteCurrency'],
    });
  }

  async togglePairStatus(id: string): Promise<CurrencyPair> {
    const pair = await this.currencyPairRepo.findOneBy({ id });
    if (!pair) {
      throw new NotFoundException('Currency pair not found');
    }

    pair.isActive = !pair.isActive;
    return this.currencyPairRepo.save(pair);
  }
}
