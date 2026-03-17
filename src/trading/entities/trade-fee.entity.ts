import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trade } from './trade.entity';

@Entity({ name: 'trade_fees', schema: 'trading' })
export class TradeFee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'trade_id' })
  tradeId: string;

  @ManyToOne(() => Trade, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trade_id' })
  trade: Trade;

  @Column({ type: 'varchar', name: 'fee_type' })
  feeType: string;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
