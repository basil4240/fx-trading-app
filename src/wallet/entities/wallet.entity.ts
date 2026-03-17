import { IamUser } from 'src/iam/entities/iam-user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'wallets', schema: 'wallet' })
export class Wallet {
  @PrimaryColumn('uuid', { name: 'iam_user_id' })
  iamUserId: string;

  @OneToOne(() => IamUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'iam_user_id' })
  iamUser: IamUser;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
