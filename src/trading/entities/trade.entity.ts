import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IamUser } from 'src/iam/entities/iam-user.entity';
import { TradeStatus } from 'src/common/enums/trade-status.enum';
import { TradeType } from 'src/common/enums/trade-type.enum';

@Entity({ name: 'trades', schema: 'trading' })
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'iam_user_id' })
  iamUserId: string;

  @ManyToOne(() => IamUser)
  @JoinColumn({ name: 'iam_user_id' })
  iamUser: IamUser;

  @Column({ name: 'from_currency_code' })
  fromCurrencyCode: string;

  @Column({ name: 'to_currency_code' })
  toCurrencyCode: string;

  @Column({
    type: 'decimal',
    name: 'from_amount',
    precision: 18,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  fromAmount: number;

  @Column({
    type: 'decimal',
    name: 'to_amount',
    precision: 18,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  toAmount: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  rate: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  fee: number;

  @Column({
    type: 'enum',
    enum: TradeStatus,
    default: TradeStatus.Pending,
    enumName: 'trade_status',
  })
  status: TradeStatus;

  @Column({
    type: 'enum',
    enum: TradeType,
    default: TradeType.Conversion,
    enumName: 'trade_type',
  })
  type: TradeType;

  @Column({ name: 'idempotency_key', unique: true })
  idempotencyKey: string;

  @Column({ name: 'executed_at', type: 'timestamptz', nullable: true })
  executedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
