import { ProcessEntity } from 'src/processes/processes.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity({ name: 'files' })
export class FileEntity extends BaseEntity {
  @Column({ name: 'amout', type: 'int' })
  name: number;

  @Column({ name: 'type', type: 'varchar' })
  type: string;

  @Column({ name: 'status', type: 'varchar' })
  status: string;

  @ManyToOne(() => ProcessEntity, (process) => process.files)
  process?: ProcessEntity;
}
