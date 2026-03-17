import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { NotificationDispatcher } from './notification.dispatcher';
import { CommonModule } from 'src/common/common.module';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_NOTIFICATION_QUEUE } from 'src/common/constants/app.constant';

@Module({
  imports: [
    CommonModule,
    EmailModule,
    BullModule.registerQueue({
      name: EMAIL_NOTIFICATION_QUEUE,
    }),
  ],
  providers: [NotificationDispatcher],
  exports: [NotificationDispatcher, BullModule],
})
export class NotificationModule {}
