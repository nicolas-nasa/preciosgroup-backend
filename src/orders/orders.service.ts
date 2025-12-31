import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './orders.entity';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
    private readonly customersService: CustomersService,
  ) {}

  async create(createOrderDto: Partial<OrderEntity>): Promise<OrderEntity> {
    try {
      if (!createOrderDto.status) {
        throw new BadRequestException('Status is required');
      }

      // Validate if customer exists
      if (createOrderDto.customer && createOrderDto.customer.id) {
        await this.customersService.findById(createOrderDto.customer.id);
      }

      const order = this.ordersRepository.create(createOrderDto);
      const savedOrder = await this.ordersRepository.save(order);

      this.logger.log(`Order created with id: ${savedOrder.id}`);
      return savedOrder;
    } catch (error: unknown) {
      this.logger.error(
        `Error creating order: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: OrderEntity[]; total: number }> {
    try {
      if (page < 1 || limit < 1) {
        throw new BadRequestException('Page and limit must be greater than 0');
      }

      const [data, total] = await this.ordersRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        relations: ['customer', 'processes'],
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding all orders: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<OrderEntity> {
    try {
      const order = await this.ordersRepository.findOne({
        where: { id },
        relations: ['customer', 'processes'],
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      return order;
    } catch (error: unknown) {
      this.logger.error(
        `Error finding order by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByCustomerId(
    customerId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: OrderEntity[]; total: number }> {
    try {
      // Validate if customer exists
      await this.customersService.findById(customerId);

      const [data, total] = await this.ordersRepository.findAndCount({
        where: { customer: { id: customerId } },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['customer', 'processes'],
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding orders by customer id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByStatus(
    status: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: OrderEntity[]; total: number }> {
    try {
      const [data, total] = await this.ordersRepository.findAndCount({
        where: { status },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['customer', 'processes'],
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding orders by status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateOrderDto: Partial<OrderEntity>,
  ): Promise<OrderEntity> {
    try {
      const order = await this.findById(id);

      Object.assign(order, updateOrderDto);
      const updatedOrder = await this.ordersRepository.save(order);

      this.logger.log(`Order updated with id: ${id}`);
      return updatedOrder;
    } catch (error: unknown) {
      this.logger.error(
        `Error updating order: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.ordersRepository.delete(id);

      this.logger.log(`Order deleted with id: ${id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error deleting order: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.ordersRepository.softDelete(id);

      this.logger.log(`Order soft deleted with id: ${id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error soft deleting order: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
