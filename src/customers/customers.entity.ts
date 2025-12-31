import { OrderEntity } from 'src/orders/orders.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity({ name: 'customers' })
export class CustomerEntity extends BaseEntity {
  @Column({ name: 'company_name', type: 'varchar' })
  companyName: string;

  @Column({ name: 'rg', type: 'varchar', unique: true })
  cnpj: string;

  @Column({ name: 'representant_name', type: 'varchar' })
  representantName: string;

  @Column({ name: 'representant_contact', type: 'varchar' })
  representantContact: string;

  @OneToMany(() => OrderEntity, (order) => order.customer)
  orders: OrderEntity[];
}
