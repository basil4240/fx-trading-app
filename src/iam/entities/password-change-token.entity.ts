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

@Entity({ name: 'password_change_tokens', schema: 'iam' })
export class PasswordChangeToken {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Index()
  @Column({ name: 'iam_user_id' })
  iamUserId: string;

  @Column({ unique: true })
  token: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({
    name: 'is_used',
    default: false,
  })
  isUsed: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @ManyToOne(() => IamUser, (user) => user.passwordChangeTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'iam_user_id' })
  iamUser: IamUser;
}
