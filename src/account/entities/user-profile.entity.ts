import { IamUser } from 'src/iam/entities/iam-user.entity';
import { KycStatus } from 'src/common/enums/kyc-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'user_profiles', schema: 'account' })
export class UserProfile {
  @PrimaryColumn('uuid', { name: 'iam_user_id' })
  iamUserId: string;

  @OneToOne(() => IamUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'iam_user_id' })
  iamUser: IamUser;

  @Column({ type: 'varchar', name: 'display_name' })
  displayName: string;

  @Column({ type: 'varchar', name: 'phone', nullable: true })
  phone: string;

  @Column({ type: 'varchar', name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({
    type: 'enum',
    enum: KycStatus,
    name: 'kyc_status',
    enumName: 'kyc_status',
    default: KycStatus.None,
  })
  kycStatus: KycStatus;

  @Column({ type: 'int', name: 'tier', default: 1 })
  tier: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
