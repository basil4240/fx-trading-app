import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { IamUser } from './iam-user.entity';

@Entity({ name: 'password_reset_tokens', schema: 'iam' })
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Index()
  @Column({ name: 'iam_user_id' })
  iamUserId: string;

  @Column({ unique: true })
  token: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({
    name: 'is_used',
    default: false,
  })
  isUsed: boolean;

  @Column({
    name: 'verified',
    default: false,
  })
  verified: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @ManyToOne(() => IamUser, (user) => user.passwordResetTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'iam_user_id' })
  iamUser: IamUser;
}
