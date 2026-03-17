import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  EmailJob,
  EmailJobType,
  GenericEmailJob,
  PasswordChangedEmailJob,
  PasswordResetEmailJob,
  WelcomeEmailJob,
  FundingSuccessEmailJob,
  FundingFailedEmailJob,
  TradeConfirmationEmailJob,
} from './email/dto/email-job.dto';
import { EMAIL_NOTIFICATION_QUEUE } from 'src/common/constants/app.constant';

@Injectable()
export class NotificationDispatcher {
  private readonly logger = new Logger(NotificationDispatcher.name);

  constructor(
    @InjectQueue(EMAIL_NOTIFICATION_QUEUE) private readonly emailQueue: Queue,
  ) {}

  // ─── Email Dispatchers ──────────────────────────────────────────────────────
  async sendWelcomeEmail(
    to: string,
    data: WelcomeEmailJob['data'],
  ): Promise<void> {
    await this.dispatchEmail({
      type: EmailJobType.Welcome,
      to,
      data,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    data: PasswordResetEmailJob['data'],
  ): Promise<void> {
    await this.dispatchEmail({
      type: EmailJobType.PasswordReset,
      to,
      data,
    });
  }

  async sendPasswordChangedEmail(
    to: string,
    data: PasswordChangedEmailJob['data'],
  ): Promise<void> {
    await this.dispatchEmail({
      type: EmailJobType.PasswordChanged,
      to,
      data,
    });
  }

  async sendGenericEmail(
    to: string,
    data: GenericEmailJob['data'],
  ): Promise<void> {
    await this.dispatchEmail({
      type: EmailJobType.Generic,
      to,
      data,
    });
  }

  async sendFundingSuccessEmail(
    to: string,
    data: FundingSuccessEmailJob['data'],
  ): Promise<void> {
    await this.dispatchEmail({
      type: EmailJobType.FundingSuccess,
      to,
      data,
    });
  }

  async sendFundingFailedEmail(
    to: string,
    data: FundingFailedEmailJob['data'],
  ): Promise<void> {
    await this.dispatchEmail({
      type: EmailJobType.FundingFailed,
      to,
      data,
    });
  }

  async sendTradeConfirmationEmail(
    to: string,
    data: TradeConfirmationEmailJob['data'],
  ): Promise<void> {
    await this.dispatchEmail({
      type: EmailJobType.TradeConfirmation,
      to,
      data,
    });
  }

  // ─── Internal Queue Helpers ─────────────────────────────────────────────────

  private async dispatchEmail(job: EmailJob): Promise<void> {
    await this.emailQueue.add(job.type, job, {
      jobId: `${job.type}-${job.to}-${Date.now()}`,
    });
    this.logger.log(`Queued email [${job.type}] → ${job.to}`);
  }
}
