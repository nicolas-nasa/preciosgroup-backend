import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderEntity } from './orders.entity';
import { RolesGuard } from 'src/authentication/guards/roles.guard';
import { PermissionsGuard } from 'src/authentication/guards/permissions.guard';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrderEntity: OrderEntity = {
    id: '1',
    status: 'pending',
    processes: [],
    customer: null,
    createAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCustomerId: jest.fn(),
            findByStatus: jest.fn(),
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

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockOrderEntity);

      const result = await controller.create({ status: 'pending' });

      expect(result).toEqual(mockOrderEntity);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const expected = { data: [mockOrderEntity], total: 1 };
      jest.spyOn(service, 'findAll').mockResolvedValue(expected);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(expected);
      expect(service.findAll).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('findById', () => {
    it('should return an order by id', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockOrderEntity);

      const result = await controller.findById('1');

      expect(result).toEqual(mockOrderEntity);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('findByCustomerId', () => {
    it('should return orders by customer id', async () => {
      const expected = { data: [mockOrderEntity], total: 1 };
      jest.spyOn(service, 'findByCustomerId').mockResolvedValue(expected);

      const result = await controller.findByCustomerId('1', 1, 20);

      expect(result).toEqual(expected);
      expect(service.findByCustomerId).toHaveBeenCalledWith('1', 1, 20);
    });
  });

  describe('findByStatus', () => {
    it('should return orders by status', async () => {
      const expected = { data: [mockOrderEntity], total: 1 };
      jest.spyOn(service, 'findByStatus').mockResolvedValue(expected);

      const result = await controller.findByStatus('pending', 1, 20);

      expect(result).toEqual(expected);
      expect(service.findByStatus).toHaveBeenCalledWith('pending', 1, 20);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const updateDto = { status: 'completed' };
      const updated = { ...mockOrderEntity, ...updateDto };

      jest.spyOn(service, 'update').mockResolvedValue(updated);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete an order', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      await controller.delete('1');

      expect(service.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('softDelete', () => {
    it('should soft delete an order', async () => {
      jest.spyOn(service, 'softDelete').mockResolvedValue(undefined);

      await controller.softDelete('1');

      expect(service.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
