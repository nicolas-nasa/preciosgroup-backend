import { CustomerEntity } from 'src/customers/customers.entity';
import { ProcessEntity } from 'src/processes/processes.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

@Entity({ name: 'orders' })
export class OrderEntity extends BaseEntity {
  @Column({ name: 'cpf', type: 'varchar' })
  status: string;

  @OneToMany(() => ProcessEntity, (process) => process.order)
  processes: ProcessEntity[];

  @ManyToOne(() => CustomerEntity, (customer) => customer.orders)
  customer: CustomerEntity;
}
