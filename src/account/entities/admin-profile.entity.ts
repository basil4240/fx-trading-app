import { IamUser } from 'src/iam/entities/iam-user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'admin_profiles', schema: 'account' })
export class AdminProfile {
  @PrimaryColumn('uuid', { name: 'iam_user_id' })
  iamUserId: string;

  @OneToOne(() => IamUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'iam_user_id' })
  iamUser: IamUser;

  @Column({ type: 'varchar', name: 'department' })
  department: string;

  @Column({ type: 'varchar', name: 'employee_id', unique: true })
  employeeId: string;

  @Column({ type: 'jsonb', name: 'permissions_scope', nullable: true })
  permissionsScope: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
