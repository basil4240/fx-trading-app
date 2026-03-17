export interface FundingResponse {
  reference: string;
  status: 'pending' | 'success' | 'failed';
  data?: any;
}

export abstract class FundingProvider {
  abstract getName(): string;
  abstract initializeFunding(amount: number, currency: string, email: string): Promise<FundingResponse>;
  abstract verifyFunding(reference: string): Promise<FundingResponse>;
}
