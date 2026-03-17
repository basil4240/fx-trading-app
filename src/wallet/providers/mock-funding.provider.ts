/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { FundingProvider, FundingResponse } from './funding-provider.interface';

@Injectable()
export class MockFundingProvider extends FundingProvider {
  getName(): string {
    return 'mock';
  }

  async initializeFunding(
    amount: number,
    currency: string,
    email: string,
  ): Promise<FundingResponse> {
    // Mock initializing a transaction (like getting a checkout URL)
    const reference = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      reference,
      status: 'pending',
      data: {
        checkout_url: `https://mock-payments.com/pay/${reference}`,
      },
    };
  }

  async verifyFunding(reference: string): Promise<FundingResponse> {
    // Mock verifying a transaction.
    // For testing, we'll assume any reference starting with MOCK- is valid and successful.
    if (reference.startsWith('MOCK-')) {
      return {
        reference,
        status: 'success',
      };
    }
    return {
      reference,
      status: 'failed',
    };
  }
}
