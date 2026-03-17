import { AccountStatus } from 'src/common/enums/account-status.enum';
import { AuthMethod } from 'src/common/enums/auth-method.enum';
import { Role } from 'src/common/enums/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PasswordHistory } from './password-history.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { PasswordChangeToken } from './password-change-token.entity';
import { EmailVerificationToken } from './email-verification-token.entity';
import { UserProfile } from 'src/account/entities/user-profile.entity';
import { AdminProfile } from 'src/account/entities/admin-profile.entity';

@Entity({ name: 'iam_users', schema: 'iam' })
@Index(['email', 'role'], { unique: true })
export class IamUser {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', name: 'email', unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: Role,
    name: 'role',
    enumName: 'role',
  })
  role: Role;

  @Column({ type: 'boolean', name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: AuthMethod,
    name: 'auth_method',
    enumName: 'auth_method',
    default: AuthMethod.Email,
  })
  authMethod: AuthMethod;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    name: 'account_status',
    enumName: 'account_status',
    default: AccountStatus.Active,
  })
  accountStatus: AccountStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ─── External relations ──────────────────────────────────────────────

  @OneToOne(() => UserProfile, (up) => up.iamUser, { cascade: true })
  userProfile: UserProfile;

  @OneToOne(() => AdminProfile, (ap) => ap.iamUser, { cascade: true })
  adminProfile: AdminProfile;

  // ─── IAM-internal relations ──────────────────────────────────────────────

  @OneToMany(() => PasswordHistory, (ph) => ph.iamUser, { cascade: true })
  passwordHistory: PasswordHistory[];

  @OneToMany(() => PasswordResetToken, (prt) => prt.iamUser, { cascade: true })
  passwordResetTokens: PasswordResetToken[];

  @OneToMany(() => PasswordChangeToken, (pct) => pct.iamUser, { cascade: true })
  passwordChangeTokens: PasswordChangeToken[];

  @OneToMany(() => EmailVerificationToken, (evt) => evt.iamUser, {
    cascade: true,
  })
  emailVerificationTokens: EmailVerificationToken[];
}
