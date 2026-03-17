export enum EmailJobType {
  Welcome = 'WELCOME',
  PasswordReset = 'PASSWORD_RESET',
  PasswordChanged = 'PASSWORD_CHANGED',
  Generic = 'GENERIC',
  FundingSuccess = 'FUNDING_SUCCESS',
  FundingFailed = 'FUNDING_FAILED',
  TradeConfirmation = 'TRADE_CONFIRMATION',
}

export interface BaseEmailJob {
  type: EmailJobType;
  to: string;
  tenantId?: string;
}

export interface WelcomeEmailJob extends BaseEmailJob {
  type: EmailJobType.Welcome;
  data: {
    fullname: string;
    otp: string;
  };
}

export interface PasswordResetEmailJob extends BaseEmailJob {
  type: EmailJobType.PasswordReset;
  data: {
    otp: string;
  };
}

export interface PasswordChangedEmailJob extends BaseEmailJob {
  type: EmailJobType.PasswordChanged;
  data: {
    otp: string;
  };
}

export interface GenericEmailJob extends BaseEmailJob {
  type: EmailJobType.Generic;
  data: {
    content: string;
    subject: string;
  };
}

export interface FundingSuccessEmailJob extends BaseEmailJob {
  type: EmailJobType.FundingSuccess;
  data: {
    amount: number;
    currency: string;
    reference: string;
  };
}

export interface FundingFailedEmailJob extends BaseEmailJob {
  type: EmailJobType.FundingFailed;
  data: {
    amount: number;
    currency: string;
    reference: string;
    reason?: string;
  };
}

export interface TradeConfirmationEmailJob extends BaseEmailJob {
  type: EmailJobType.TradeConfirmation;
  data: {
    fromAmount: number;
    fromCurrency: string;
    toAmount: number;
    toCurrency: string;
    rate: number;
    fee: number;
    reference: string;
  };
}

export type EmailJob =
  | WelcomeEmailJob
  | PasswordResetEmailJob
  | PasswordChangedEmailJob
  | GenericEmailJob
  | FundingSuccessEmailJob
  | FundingFailedEmailJob
  | TradeConfirmationEmailJob;
