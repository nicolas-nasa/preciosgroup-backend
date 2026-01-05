import { Test, TestingModule } from '@nestjs/testing';
import { TypeOfProcessesService } from './type-of-processes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOfProcessEntity } from './type-of-processes.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TypeOfProcessesService', () => {
  let service: TypeOfProcessesService;
  let repository: Repository<TypeOfProcessEntity>;

  const mockTypeOfProcess: TypeOfProcessEntity = {
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
      providers: [
        TypeOfProcessesService,
        {
          provide: getRepositoryToken(TypeOfProcessEntity),
          useValue: {
            create: jest.fn().mockReturnValue(mockTypeOfProcess),
            save: jest.fn().mockResolvedValue(mockTypeOfProcess),
            find: jest.fn().mockResolvedValue([mockTypeOfProcess]),
            findOne: jest.fn().mockResolvedValue(mockTypeOfProcess),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
            restore: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<TypeOfProcessesService>(TypeOfProcessesService);
    repository = module.get<Repository<TypeOfProcessEntity>>(
      getRepositoryToken(TypeOfProcessEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a type of process', async () => {
      const createDto = {
        name: 'Quality Control',
        agrouped: false,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTypeOfProcess);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if name already exists', async () => {
      const createDto = {
        name: 'Quality Control',
        agrouped: false,
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockTypeOfProcess);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of types of processes', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockTypeOfProcess]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a type of process by id', async () => {
      const result = await service.findOne('uuid-1');

      expect(result).toEqual(mockTypeOfProcess);
      expect(repository.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if type of process not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a type of process', async () => {
      const updateDto = {
        name: 'Updated Quality Control',
        agrouped: true,
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockTypeOfProcess);
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce({ ...mockTypeOfProcess, ...updateDto });

      const result = await service.update('uuid-1', updateDto);

      expect(result).toBeDefined();
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a type of process', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockTypeOfProcess);

      await service.remove('uuid-1');

      expect(repository.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException if type of process not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted type of process', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockTypeOfProcess);
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockTypeOfProcess);

      const result = await service.restore('uuid-1');

      expect(result).toEqual(mockTypeOfProcess);
      expect(repository.restore).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException if type of process not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.restore('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
