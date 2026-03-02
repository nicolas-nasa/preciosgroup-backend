import { BaseEntity } from 'src/utils/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from 'src/users/users.entity';

@Entity({ name: 'logs' })
export class LogEntity extends BaseEntity {
  @Column({ name: 'module', type: 'varchar', nullable: true })
  module?: string;

  @Column({ name: 'route', type: 'varchar', nullable: true })
  route?: string;

  @Column({ name: 'action', type: 'varchar' })
  action: string;

  @Column({ name: 'friendly_action', type: 'varchar', nullable: true })
  friendlyAction?: string;

  @Column({ name: 'result', type: 'varchar', nullable: true })
  result?: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'action_date', type: 'timestamptz' })
  actionDate: Date;

  @Column({ name: 'parameters', type: 'jsonb', nullable: true })
  parameters?: Record<string, unknown>;

  @Column({ name: 'error_data', type: 'jsonb', nullable: true })
  errorData?: Record<string, unknown>;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
