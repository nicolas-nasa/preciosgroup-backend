import { Test, TestingModule } from '@nestjs/testing';
import { TypeOfProcessesController } from './type-of-processes.controller';
import { TypeOfProcessesService } from './type-of-processes.service';

describe('TypeOfProcessesController', () => {
  let controller: TypeOfProcessesController;
  let service: TypeOfProcessesService;

  const mockTypeOfProcess = {
    id: 'uuid-1',
    name: 'Quality Control',
    agrouped: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    processes: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeOfProcessesController],
      providers: [
        {
          provide: TypeOfProcessesService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockTypeOfProcess),
            findAll: jest.fn().mockResolvedValue([mockTypeOfProcess]),
            findOne: jest.fn().mockResolvedValue(mockTypeOfProcess),
            update: jest.fn().mockResolvedValue(mockTypeOfProcess),
            remove: jest.fn().mockResolvedValue(undefined),
            restore: jest.fn().mockResolvedValue(mockTypeOfProcess),
          },
        },
      ],
    }).compile();

    controller = module.get<TypeOfProcessesController>(
      TypeOfProcessesController,
    );
    service = module.get<TypeOfProcessesService>(TypeOfProcessesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a type of process', async () => {
      const createDto = {
        name: 'Quality Control',
        agrouped: false,
      };

      const result = await controller.create(createDto);

      expect(result).toEqual(mockTypeOfProcess);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of types of processes', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockTypeOfProcess]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a type of process by id', async () => {
      const result = await controller.findOne('uuid-1');

      expect(result).toEqual(mockTypeOfProcess);
      expect(service.findOne).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('update', () => {
    it('should update a type of process', async () => {
      const updateDto = {
        name: 'Updated Quality Control',
        agrouped: true,
      };

      const result = await controller.update('uuid-1', updateDto);

      expect(result).toEqual(mockTypeOfProcess);
      expect(service.update).toHaveBeenCalledWith('uuid-1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a type of process', async () => {
      await controller.remove('uuid-1');

      expect(service.remove).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('restore', () => {
    it('should restore a type of process', async () => {
      const result = await controller.restore('uuid-1');

      expect(result).toEqual(mockTypeOfProcess);
      expect(service.restore).toHaveBeenCalledWith('uuid-1');
    });
  });
});
