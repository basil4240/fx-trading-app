/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import smtpEmailConfig from 'src/common/config/smtp-email.config';

// ─── Abstract ────────────────────────────────────────────────────────────────

export abstract class EmailService {
  abstract sendEmail(options: SendEmailOptions): Promise<void>;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// ─── Nodemailer SMTP Implementation ──────────────────────────────────────────

@Injectable()
export class SmtpEmailService extends EmailService {
  private readonly logger = new Logger(SmtpEmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;

  constructor(
    @Inject(smtpEmailConfig.KEY)
    private readonly smtpEmailConfiguration: ConfigType<typeof smtpEmailConfig>,
  ) {
    super();

    this.fromAddress = `"${smtpEmailConfiguration.fromName}" <${smtpEmailConfiguration.fromAddress}>`;

    this.transporter = nodemailer.createTransport({
      host: smtpEmailConfiguration.host,
      port: smtpEmailConfiguration.port,
      secure: smtpEmailConfiguration.port === 465,
      auth: {
        user: smtpEmailConfiguration.user,
        pass: smtpEmailConfiguration.password,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    this.logger.log(
      `Email sent to ${options.to} — subject: "${options.subject}"`,
    );
  }
}
