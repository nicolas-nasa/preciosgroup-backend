import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerEntity } from './customers.entity';
import { RolesGuard } from 'src/authentication/guards/roles.guard';
import { PermissionsGuard } from 'src/authentication/guards/permissions.guard';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

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
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCnpj: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: 'RolesGuard',
          useValue: { canActivate: () => true },
        },
        {
          provide: 'PermissionsGuard',
          useValue: { canActivate: () => true },
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockCustomerEntity);

      const result = await controller.create({
        companyName: 'Test Company',
        cnpj: '12.345.678/0001-90',
      });

      expect(result).toEqual(mockCustomerEntity);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      const expected = { data: [mockCustomerEntity], total: 1 };
      jest.spyOn(service, 'findAll').mockResolvedValue(expected);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(expected);
      expect(service.findAll).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('findById', () => {
    it('should return a customer by id', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockCustomerEntity);

      const result = await controller.findById('1');

      expect(result).toEqual(mockCustomerEntity);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('findByCnpj', () => {
    it('should return a customer by CNPJ', async () => {
      jest.spyOn(service, 'findByCnpj').mockResolvedValue(mockCustomerEntity);

      const result = await controller.findByCnpj('12.345.678/0001-90');

      expect(result).toEqual(mockCustomerEntity);
      expect(service.findByCnpj).toHaveBeenCalledWith('12.345.678/0001-90');
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateDto = { representantName: 'Updated' };
      const updated = { ...mockCustomerEntity, ...updateDto };

      jest.spyOn(service, 'update').mockResolvedValue(updated);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      await controller.delete('1');

      expect(service.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('softDelete', () => {
    it('should soft delete a customer', async () => {
      jest.spyOn(service, 'softDelete').mockResolvedValue(undefined);

      await controller.softDelete('1');

      expect(service.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
