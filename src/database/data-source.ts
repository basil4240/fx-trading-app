import 'reflect-metadata';
import 'dotenv/config'
import { DataSource } from 'typeorm';

import { IamUser } from '../iam/entities/iam-user.entity';
import { PasswordHistory } from '../iam/entities/password-history.entity';
import { PasswordResetToken } from '../iam/entities/password-reset-token.entity';
import { PasswordChangeToken } from '../iam/entities/password-change-token.entity';
import { EmailVerificationToken } from '../iam/entities/email-verification-token.entity';
import { UserProfile } from '../account/entities/user-profile.entity';
import { AdminProfile } from '../account/entities/admin-profile.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [
    IamUser,
    PasswordHistory,
    PasswordResetToken,
    PasswordChangeToken,
    EmailVerificationToken,
    UserProfile,
    AdminProfile,
  ],

  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});