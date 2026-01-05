import { Test, TestingModule } from '@nestjs/testing';
import { ProcessesController } from './processes.controller';
import { ProcessesService } from './processes.service';
import { ProcessEntity } from './processes.entity';
import { PermissionsGuard } from 'src/authentication/guards/permissions.guard';

describe('ProcessesController', () => {
  let controller: ProcessesController;
  let service: ProcessesService;

  const mockProcessEntity: ProcessEntity = {
    id: '1',
    amout: 100,
    type: 'test_type',
    status: 'pending',
    files: [],
    order: null,
    createAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessesController],
      providers: [
        {
          provide: ProcessesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByOrderId: jest.fn(),
            findByStatus: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: 'PermissionsGuard',
          useValue: { canActivate: () => true },
        },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProcessesController>(ProcessesController);
    service = module.get<ProcessesService>(ProcessesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a process', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockProcessEntity);

      const result = await controller.create({
        type: 'test_type',
        status: 'pending',
      });

      expect(result).toEqual(mockProcessEntity);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all processes', async () => {
      const expected = { data: [mockProcessEntity], total: 1 };
      jest.spyOn(service, 'findAll').mockResolvedValue(expected);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(expected);
      expect(service.findAll).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('findById', () => {
    it('should return a process by id', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockProcessEntity);

      const result = await controller.findById('1');

      expect(result).toEqual(mockProcessEntity);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('findByOrderId', () => {
    it('should return processes by order id', async () => {
      const expected = { data: [mockProcessEntity], total: 1 };
      jest.spyOn(service, 'findByOrderId').mockResolvedValue(expected);

      const result = await controller.findByOrderId('1', 1, 20);

      expect(result).toEqual(expected);
      expect(service.findByOrderId).toHaveBeenCalledWith('1', 1, 20);
    });
  });

  describe('findByStatus', () => {
    it('should return processes by status', async () => {
      const expected = { data: [mockProcessEntity], total: 1 };
      jest.spyOn(service, 'findByStatus').mockResolvedValue(expected);

      const result = await controller.findByStatus('pending', 1, 20);

      expect(result).toEqual(expected);
      expect(service.findByStatus).toHaveBeenCalledWith('pending', 1, 20);
    });
  });

  describe('update', () => {
    it('should update a process', async () => {
      const updateDto = { status: 'completed' };
      const updated = { ...mockProcessEntity, ...updateDto };

      jest.spyOn(service, 'update').mockResolvedValue(updated);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a process', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      await controller.delete('1');

      expect(service.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('softDelete', () => {
    it('should soft delete a process', async () => {
      jest.spyOn(service, 'softDelete').mockResolvedValue(undefined);

      await controller.softDelete('1');

      expect(service.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
