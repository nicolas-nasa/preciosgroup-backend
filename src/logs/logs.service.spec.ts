import { Test, TestingModule } from '@nestjs/testing';
import { LogsService } from './logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LogEntity } from './logs.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LogsService', () => {
  let service: LogsService;
  let repository: Repository<LogEntity>;

  const mockLogEntity: LogEntity = {
    id: '1',
    action: 'USER_LOGIN',
    createAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    actionDate: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogsService,
        {
          provide: getRepositoryToken(LogEntity),
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

    service = module.get<LogsService>(LogsService);
    repository = module.get<Repository<LogEntity>>(
      getRepositoryToken(LogEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a log', async () => {
      const createLogDto = { action: 'USER_LOGIN' };

      jest.spyOn(repository, 'create').mockReturnValue(mockLogEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(mockLogEntity);

      const result = await service.create(createLogDto);

      expect(result).toEqual(mockLogEntity);
      expect(repository.create).toHaveBeenCalledWith(createLogDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when action is missing', async () => {
      await expect(service.create({})).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return logs with pagination', async () => {
      const logs = [mockLogEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([logs, 1]);

      const result = await service.findAll(1, 20);

      expect(result).toEqual({ data: logs, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        order: { createAt: 'DESC' },
      });
    });

    it('should throw BadRequestException when page or limit is invalid', async () => {
      await expect(service.findAll(0, 20)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return a log by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockLogEntity);

      const result = await service.findById('1');

      expect(result).toEqual(mockLogEntity);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when log not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByAction', () => {
    it('should return logs by action', async () => {
      const logs = [mockLogEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([logs, 1]);

      const result = await service.findByAction('USER_LOGIN', 1, 20);

      expect(result).toEqual({ data: logs, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should return logs by user ID', async () => {
      const logs = [mockLogEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([logs, 1]);

      const result = await service.findByUserId('user-123', 1, 20);

      expect(result).toEqual({ data: logs, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalled();
    });
  });
});
