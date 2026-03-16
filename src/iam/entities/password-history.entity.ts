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

@Entity({ name: 'password_histories', schema: 'iam' })
export class PasswordHistory {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Index()
  @Column({ name: 'iam_user_id' })
  iamUserId: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    nullable: true,
  })
  expiresAt?: Date;

  @ManyToOne(() => IamUser, (user) => user.passwordHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'iam_user_id' })
  iamUser: IamUser;
}
