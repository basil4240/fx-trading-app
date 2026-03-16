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

@Entity({ name: 'email_verification_tokens', schema: 'iam' })
export class EmailVerificationToken {
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

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @ManyToOne(() => IamUser, (user) => user.emailVerificationTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'iam_user_id' })
  iamUser: IamUser;
}
