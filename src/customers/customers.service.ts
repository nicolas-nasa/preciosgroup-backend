import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './customers.entity';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customersRepository: Repository<CustomerEntity>,
  ) {}

  async create(
    createCustomerDto: Partial<CustomerEntity>,
  ): Promise<CustomerEntity> {
    try {
      if (!createCustomerDto.companyName || !createCustomerDto.cnpj) {
        throw new BadRequestException('Company name and CNPJ are required');
      }

      const existingCustomer = await this.customersRepository.findOne({
        where: { cnpj: createCustomerDto.cnpj },
      });

      if (existingCustomer) {
        throw new BadRequestException('Customer with this CNPJ already exists');
      }

      const customer = this.customersRepository.create(createCustomerDto);
      const savedCustomer = await this.customersRepository.save(customer);

      this.logger.log(`Customer created with id: ${savedCustomer.id}`);
      return savedCustomer;
    } catch (error: unknown) {
      this.logger.error(
        `Error creating customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: CustomerEntity[]; total: number }> {
    try {
      if (page < 1 || limit < 1) {
        throw new BadRequestException('Page and limit must be greater than 0');
      }

      const [data, total] = await this.customersRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        relations: ['orders'],
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding all customers: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<CustomerEntity> {
    try {
      const customer = await this.customersRepository.findOne({
        where: { id },
        relations: ['orders'],
      });

      if (!customer) {
        throw new NotFoundException(`Customer with id ${id} not found`);
      }

      return customer;
    } catch (error: unknown) {
      this.logger.error(
        `Error finding customer by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByCnpj(cnpj: string): Promise<CustomerEntity> {
    try {
      const customer = await this.customersRepository.findOne({
        where: { cnpj },
        relations: ['orders'],
      });

      if (!customer) {
        throw new NotFoundException(`Customer with CNPJ ${cnpj} not found`);
      }

      return customer;
    } catch (error: unknown) {
      this.logger.error(
        `Error finding customer by CNPJ: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateCustomerDto: Partial<CustomerEntity>,
  ): Promise<CustomerEntity> {
    try {
      const customer = await this.findById(id);

      Object.assign(customer, updateCustomerDto);
      const updatedCustomer = await this.customersRepository.save(customer);

      this.logger.log(`Customer updated with id: ${id}`);
      return updatedCustomer;
    } catch (error: unknown) {
      this.logger.error(
        `Error updating customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.customersRepository.delete(id);

      this.logger.log(`Customer deleted with id: ${id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error deleting customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.customersRepository.softDelete(id);

      this.logger.log(`Customer soft deleted with id: ${id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error soft deleting customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
