import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomerEntity } from './customers.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: Repository<CustomerEntity>;

  const mockCustomerEntity: CustomerEntity = {
    id: '1',
    companyName: 'Test Company',
    cnpj: '12.345.678/0001-90',
    representantName: 'Test Representant',
    representantContact: '11999999999',
    orders: [],
    createAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(CustomerEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            delete: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<Repository<CustomerEntity>>(
      getRepositoryToken(CustomerEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const createCustomerDto = {
        companyName: 'Test Company',
        cnpj: '12.345.678/0001-90',
        representantName: 'Test Representant',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockCustomerEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(mockCustomerEntity);

      const result = await service.create(createCustomerDto);

      expect(result).toEqual(mockCustomerEntity);
      expect(repository.create).toHaveBeenCalledWith(createCustomerDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when company name or CNPJ is missing', async () => {
      await expect(
        service.create({ companyName: 'Test Company' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when CNPJ already exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCustomerEntity);

      await expect(
        service.create({
          companyName: 'Test Company',
          cnpj: '12.345.678/0001-90',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return customers with pagination', async () => {
      const customers = [mockCustomerEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([customers, 1]);

      const result = await service.findAll(1, 20);

      expect(result).toEqual({ data: customers, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        relations: ['orders'],
      });
    });

    it('should throw BadRequestException when page or limit is invalid', async () => {
      await expect(service.findAll(0, 20)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return a customer by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCustomerEntity);

      const result = await service.findById('1');

      expect(result).toEqual(mockCustomerEntity);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['orders'],
      });
    });

    it('should throw NotFoundException when customer not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCnpj', () => {
    it('should return a customer by CNPJ', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCustomerEntity);

      const result = await service.findByCnpj('12.345.678/0001-90');

      expect(result).toEqual(mockCustomerEntity);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { cnpj: '12.345.678/0001-90' },
        relations: ['orders'],
      });
    });

    it('should throw NotFoundException when customer not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findByCnpj('99.999.999/9999-99')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateCustomerDto = { representantName: 'Updated Representant' };
      const updatedCustomer = { ...mockCustomerEntity, ...updateCustomerDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCustomerEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedCustomer);

      const result = await service.update('1', updateCustomerDto);

      expect(result).toEqual(updatedCustomer);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCustomerEntity);
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 });

      await service.delete('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('softDelete', () => {
    it('should soft delete a customer', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCustomerEntity);
      jest.spyOn(repository, 'softDelete').mockResolvedValue({ affected: 1 });

      await service.softDelete('1');

      expect(repository.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
