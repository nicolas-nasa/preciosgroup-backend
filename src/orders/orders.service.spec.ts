import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderEntity } from './orders.entity';
import { Repository } from 'typeorm';
import { CustomersService } from 'src/customers/customers.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<OrderEntity>;
  let customersService: CustomersService;

  const mockOrderEntity: OrderEntity = {
    id: '1',
    status: 'pending',
    processes: [],
    customer: null,
    createAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockCustomer = {
    id: '1',
    companyName: 'Test Company',
    cnpj: '12.345.678/0001-90',
    representantName: 'Test Representant',
    representantContact: '11999999999',
    orders: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            delete: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: CustomersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<OrderEntity>>(
      getRepositoryToken(OrderEntity),
    );
    customersService = module.get<CustomersService>(CustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const createOrderDto = { status: 'pending', customer: mockCustomer };

      jest.spyOn(customersService, 'findById').mockResolvedValue(mockCustomer);
      jest.spyOn(repository, 'create').mockReturnValue(mockOrderEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(mockOrderEntity);

      const result = await service.create(createOrderDto);

      expect(result).toEqual(mockOrderEntity);
      expect(repository.create).toHaveBeenCalledWith(createOrderDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when status is missing', async () => {
      await expect(service.create({})).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return orders with pagination', async () => {
      const orders = [mockOrderEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([orders, 1]);

      const result = await service.findAll(1, 20);

      expect(result).toEqual({ data: orders, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        relations: ['customer', 'processes'],
      });
    });

    it('should throw BadRequestException when page or limit is invalid', async () => {
      await expect(service.findAll(0, 20)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return an order by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockOrderEntity);

      const result = await service.findById('1');

      expect(result).toEqual(mockOrderEntity);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['customer', 'processes'],
      });
    });

    it('should throw NotFoundException when order not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCustomerId', () => {
    it('should return orders by customer id', async () => {
      const orders = [mockOrderEntity];
      jest.spyOn(customersService, 'findById').mockResolvedValue(mockCustomer);
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([orders, 1]);

      const result = await service.findByCustomerId('1', 1, 20);

      expect(result).toEqual({ data: orders, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalled();
    });

    it('should throw NotFoundException when customer not found', async () => {
      jest
        .spyOn(customersService, 'findById')
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.findByCustomerId('nonexistent', 1, 20),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStatus', () => {
    it('should return orders by status', async () => {
      const orders = [mockOrderEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([orders, 1]);

      const result = await service.findByStatus('pending', 1, 20);

      expect(result).toEqual({ data: orders, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const updateOrderDto = { status: 'completed' };
      const updatedOrder = { ...mockOrderEntity, ...updateOrderDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockOrderEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedOrder);

      const result = await service.update('1', updateOrderDto);

      expect(result).toEqual(updatedOrder);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an order', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockOrderEntity);
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 });

      await service.delete('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('softDelete', () => {
    it('should soft delete an order', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockOrderEntity);
      jest.spyOn(repository, 'softDelete').mockResolvedValue({ affected: 1 });

      await service.softDelete('1');

      expect(repository.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
