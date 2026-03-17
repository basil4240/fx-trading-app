import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IamUser } from 'src/iam/entities/iam-user.entity';

@Entity({ name: 'audit_logs', schema: 'audit' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'iam_user_id', nullable: true })
  iamUserId: string;

  @ManyToOne(() => IamUser)
  @JoinColumn({ name: 'iam_user_id' })
  iamUser: IamUser;

  @Column({ type: 'varchar' })
  module: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'varchar', name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
