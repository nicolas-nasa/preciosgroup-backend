import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/utils/base.entity';
import { ProcessEntity } from '../processes/processes.entity';

@Entity('type_of_processes')
export class TypeOfProcessEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'boolean', default: false })
  agrouped: boolean;

  @OneToMany(() => ProcessEntity, (process) => process.typeOfProcess, {
    lazy: false,
  })
  processes?: ProcessEntity[];
}
