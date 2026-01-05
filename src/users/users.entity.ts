import { BaseEntity } from 'src/utils/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role as RoleEntity } from '../roles/roles.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'cpf', type: 'varchar', unique: true })
  cpf: string;

  @Column({ nullable: true, name: 'email', type: 'varchar' })
  email: string;

  @Column({ nullable: true, name: 'contact', type: 'varchar' })
  contact: string;

  @ManyToOne(() => RoleEntity, { nullable: true })
  @JoinColumn({ name: 'roleId' })
  role?: RoleEntity;

  @Column({ nullable: true, name: 'roleId' })
  roleId?: string;

  @Column({ name: 'password', type: 'varchar' })
  password: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
