export enum EmailJobType {
  Welcome = 'WELCOME',
  PasswordReset = 'PASSWORD_RESET',
  PasswordChanged = 'PASSWORD_CHANGED',
  Generic = 'GENERIC',
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

export type EmailJob =
  | WelcomeEmailJob
  | PasswordResetEmailJob
  | PasswordChangedEmailJob
  | GenericEmailJob;
