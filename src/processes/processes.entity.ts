import { FileEntity } from 'src/files/files.entity';
import { OrderEntity } from 'src/orders/orders.entity';
import { TypeOfProcessEntity } from 'src/type-of-processes/type-of-processes.entity';
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

  @Column({ name: 'orderId', type: 'uuid', nullable: true })
  orderId?: string;

  @Column({ name: 'typeOfProcessId', type: 'uuid', nullable: true })
  typeOfProcessId?: string;

  @OneToMany(() => FileEntity, (file) => file.process, { lazy: false })
  files?: FileEntity[];

  @ManyToOne(() => OrderEntity, (order) => order.processes)
  order: OrderEntity;

  @ManyToOne(
    () => TypeOfProcessEntity,
    (typeOfProcess) => typeOfProcess.processes,
  )
  typeOfProcess: TypeOfProcessEntity;
}
