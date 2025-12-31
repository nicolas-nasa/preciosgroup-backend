import { Test, TestingModule } from '@nestjs/testing';
import { ProcessesService } from './processes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProcessEntity } from './processes.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProcessesService', () => {
  let service: ProcessesService;
  let repository: Repository<ProcessEntity>;

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
      providers: [
        ProcessesService,
        {
          provide: getRepositoryToken(ProcessEntity),
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

    service = module.get<ProcessesService>(ProcessesService);
    repository = module.get<Repository<ProcessEntity>>(
      getRepositoryToken(ProcessEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a process', async () => {
      const createProcessDto = {
        type: 'test_type',
        status: 'pending',
        amout: 100,
      };

      jest.spyOn(repository, 'create').mockReturnValue(mockProcessEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(mockProcessEntity);

      const result = await service.create(createProcessDto);

      expect(result).toEqual(mockProcessEntity);
      expect(repository.create).toHaveBeenCalledWith(createProcessDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when type or status is missing', async () => {
      await expect(service.create({ amout: 100 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return processes with pagination', async () => {
      const processes = [mockProcessEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([processes, 1]);

      const result = await service.findAll(1, 20);

      expect(result).toEqual({ data: processes, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        relations: ['order', 'files'],
      });
    });

    it('should throw BadRequestException when page or limit is invalid', async () => {
      await expect(service.findAll(0, 20)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return a process by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProcessEntity);

      const result = await service.findById('1');

      expect(result).toEqual(mockProcessEntity);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['order', 'files'],
      });
    });

    it('should throw NotFoundException when process not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByOrderId', () => {
    it('should return processes by order id', async () => {
      const processes = [mockProcessEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([processes, 1]);

      const result = await service.findByOrderId('1', 1, 20);

      expect(result).toEqual({ data: processes, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findByStatus', () => {
    it('should return processes by status', async () => {
      const processes = [mockProcessEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([processes, 1]);

      const result = await service.findByStatus('pending', 1, 20);

      expect(result).toEqual({ data: processes, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a process', async () => {
      const updateProcessDto = { status: 'completed' };
      const updatedProcess = { ...mockProcessEntity, ...updateProcessDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProcessEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedProcess);

      const result = await service.update('1', updateProcessDto);

      expect(result).toEqual(updatedProcess);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a process', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProcessEntity);
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 });

      await service.delete('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('softDelete', () => {
    it('should soft delete a process', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProcessEntity);
      jest.spyOn(repository, 'softDelete').mockResolvedValue({ affected: 1 });

      await service.softDelete('1');

      expect(repository.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
