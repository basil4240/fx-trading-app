import { registerAs } from '@nestjs/config';

export default registerAs('smtp-email', () => {
  return {
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10) || 465,
    secure: process.env.MAIL_SECURE === 'true' ? true : false,
    fromName: process.env.MAIL_FROM_NAME,
    fromAddress: process.env.MAIL_FROM_ADDRESS,
  };
});
