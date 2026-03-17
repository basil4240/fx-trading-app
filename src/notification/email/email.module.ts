import { Module } from '@nestjs/common';
import { EmailProcessor } from './email.processor';
import { EmailService, SmtpEmailService } from './email.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  providers: [
    { provide: EmailService, useClass: SmtpEmailService },
    EmailProcessor,
  ],
  exports: [{ provide: EmailService, useClass: SmtpEmailService }],
})
export class EmailModule {}
