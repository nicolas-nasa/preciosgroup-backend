import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileEntity } from './files.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FilesService', () => {
  let service: FilesService;
  let repository: Repository<FileEntity>;

  const mockFileEntity: FileEntity = {
    id: '1',
    name: 100,
    type: 'pdf',
    status: 'uploaded',
    process: null,
    createAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(FileEntity),
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

    service = module.get<FilesService>(FilesService);
    repository = module.get<Repository<FileEntity>>(
      getRepositoryToken(FileEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a file', async () => {
      const createFileDto = {
        name: 100,
        type: 'pdf',
      };

      jest.spyOn(repository, 'create').mockReturnValue(mockFileEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(mockFileEntity);

      const result = await service.create(createFileDto);

      expect(result).toEqual(mockFileEntity);
      expect(repository.create).toHaveBeenCalledWith(createFileDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when name or type is missing', async () => {
      await expect(service.create({ name: 100 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return files with pagination', async () => {
      const files = [mockFileEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([files, 1]);

      const result = await service.findAll(1, 20);

      expect(result).toEqual({ data: files, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        relations: ['process'],
      });
    });

    it('should throw BadRequestException when page or limit is invalid', async () => {
      await expect(service.findAll(0, 20)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return a file by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFileEntity);

      const result = await service.findById('1');

      expect(result).toEqual(mockFileEntity);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['process'],
      });
    });

    it('should throw NotFoundException when file not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByProcessId', () => {
    it('should return files by process id', async () => {
      const files = [mockFileEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([files, 1]);

      const result = await service.findByProcessId('1', 1, 20);

      expect(result).toEqual({ data: files, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findByType', () => {
    it('should return files by type', async () => {
      const files = [mockFileEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([files, 1]);

      const result = await service.findByType('pdf', 1, 20);

      expect(result).toEqual({ data: files, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a file', async () => {
      const updateFileDto = { status: 'processed' };
      const updatedFile = { ...mockFileEntity, ...updateFileDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFileEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedFile);

      const result = await service.update('1', updateFileDto);

      expect(result).toEqual(updatedFile);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a file', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFileEntity);
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 });

      await service.delete('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('softDelete', () => {
    it('should soft delete a file', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFileEntity);
      jest.spyOn(repository, 'softDelete').mockResolvedValue({ affected: 1 });

      await service.softDelete('1');

      expect(repository.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
