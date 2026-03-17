import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IamUser } from 'src/iam/entities/iam-user.entity';

@Entity({ name: 'ledger_entries', schema: 'audit' })
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'iam_user_id' })
  iamUserId: string;

  @ManyToOne(() => IamUser)
  @JoinColumn({ name: 'iam_user_id' })
  iamUser: IamUser;

  @Column({ type: 'varchar', name: 'entity_type' })
  entityType: string;

  @Column({ type: 'varchar', name: 'entity_id' })
  entityId: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({ name: 'currency_code' })
  currencyCode: string;

  @Column({
    type: 'decimal',
    name: 'balance_before',
    precision: 18,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  balanceBefore: number;

  @Column({
    type: 'decimal',
    name: 'balance_after',
    precision: 18,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  balanceAfter: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
