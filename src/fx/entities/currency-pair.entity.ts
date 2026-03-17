import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Currency } from './currency.entity';
import { IamUser } from 'src/iam/entities/iam-user.entity';

@Entity({ name: 'currency_pairs', schema: 'fx' })
@Index(['baseCurrencyCode', 'quoteCurrencyCode'], { unique: true })
export class CurrencyPair {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'base_currency_code' })
  baseCurrencyCode: string;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'base_currency_code' })
  baseCurrency: Currency;

  @Column({ name: 'quote_currency_code' })
  quoteCurrencyCode: string;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'quote_currency_code' })
  quoteCurrency: Currency;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'added_by_admin_id', nullable: true })
  addedByAdminId: string;

  @ManyToOne(() => IamUser)
  @JoinColumn({ name: 'added_by_admin_id' })
  addedByAdmin: IamUser;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
