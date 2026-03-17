/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FxProvider } from './fx-provider.interface';

@Injectable()
export class ExchangeRateApiProvider extends FxProvider {
  private readonly logger = new Logger(ExchangeRateApiProvider.name);
  private readonly baseUrl = 'https://open.er-api.com/v6/latest';

  constructor(private readonly httpService: HttpService) {
    super();
  }

  getName(): string {
    return 'ExchangeRate-API';
  }

  async getRate(baseCurrency: string, quoteCurrency: string): Promise<number> {
    try {
      this.logger.log(`Fetching rate for ${baseCurrency}/${quoteCurrency} from ${this.getName()}`);
      
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${baseCurrency}`),
      );

      if (data.result === 'success' && data.rates[quoteCurrency]) {
        return data.rates[quoteCurrency];
      }

      throw new Error(`Rate not found for ${quoteCurrency} in ${baseCurrency} response`);
    } catch (error) {
      this.logger.error(`Error fetching rate from ${this.getName()}: ${error.message}`);
      throw error;
    }
  }
}
