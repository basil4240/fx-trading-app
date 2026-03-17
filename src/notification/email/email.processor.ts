import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService } from './email.service';
import { EmailJob, EmailJobType } from './dto/email-job.dto';
import {
  passwordResetTemplate,
  passwordChangedTemplate,
  genericTemplate,
  WelcomeTemplate,
  fundingSuccessTemplate,
  fundingFailedTemplate,
  tradeConfirmationTemplate,
} from './templates/email.templates';
import { EMAIL_NOTIFICATION_QUEUE } from 'src/common/constants/app.constant';

@Processor(EMAIL_NOTIFICATION_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJob>): Promise<void> {
    const payload = job.data;
    this.logger.log(`Processing email job [${payload.type}] → ${payload.to}`);

    try {
      const template = this.resolveTemplate(payload);

      await this.emailService.sendEmail({
        to: payload.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      this.logger.log(`Email delivered [${payload.type}] → ${payload.to}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Email failed [${payload.type}] → ${payload.to}: ${errorMessage}`,
      );

      // Re-throw so BullMQ can retry according to queue config
      throw error;
    }
  }

  private resolveTemplate(payload: EmailJob) {
    switch (payload.type) {
      case EmailJobType.Welcome:
        return WelcomeTemplate(payload.data);

      case EmailJobType.PasswordReset:
        return passwordResetTemplate(payload.data);

      case EmailJobType.PasswordChanged:
        return passwordChangedTemplate(payload.data);

      case EmailJobType.Generic:
        return genericTemplate(payload.data);

      case EmailJobType.FundingSuccess:
        return fundingSuccessTemplate(payload.data);

      case EmailJobType.FundingFailed:
        return fundingFailedTemplate(payload.data);

      case EmailJobType.TradeConfirmation:
        return tradeConfirmationTemplate(payload.data);

      default:
        throw new Error(`Unknown email job type: ${(payload as any).type}`);
    }
  }
}
