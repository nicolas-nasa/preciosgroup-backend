import { FileEntity } from 'src/files/files.entity';
import { OrderEntity } from 'src/orders/orders.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'processes' })
export class ProcessEntity extends BaseEntity {
  @Column({ name: 'amout', type: 'int' })
  amout: number;

  @Column({ name: 'type', type: 'varchar' })
  type: string;

  @Column({ name: 'status', type: 'varchar' })
  status: string;

  @OneToMany(() => FileEntity, (file) => file.process)
  files: FileEntity[];

  @ManyToOne(() => OrderEntity, (order) => order.processes)
  order: OrderEntity;
}
