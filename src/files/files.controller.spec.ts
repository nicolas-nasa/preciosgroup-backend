import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './files.entity';
import { RolesGuard } from 'src/authentication/guards/roles.guard';
import { PermissionsGuard } from 'src/authentication/guards/permissions.guard';

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

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
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByProcessId: jest.fn(),
            findByType: jest.fn(),
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

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a file', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockFileEntity);

      const result = await controller.create({
        name: 100,
        type: 'pdf',
      });

      expect(result).toEqual(mockFileEntity);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all files', async () => {
      const expected = { data: [mockFileEntity], total: 1 };
      jest.spyOn(service, 'findAll').mockResolvedValue(expected);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(expected);
      expect(service.findAll).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('findById', () => {
    it('should return a file by id', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockFileEntity);

      const result = await controller.findById('1');

      expect(result).toEqual(mockFileEntity);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('findByProcessId', () => {
    it('should return files by process id', async () => {
      const expected = { data: [mockFileEntity], total: 1 };
      jest.spyOn(service, 'findByProcessId').mockResolvedValue(expected);

      const result = await controller.findByProcessId('1', 1, 20);

      expect(result).toEqual(expected);
      expect(service.findByProcessId).toHaveBeenCalledWith('1', 1, 20);
    });
  });

  describe('findByType', () => {
    it('should return files by type', async () => {
      const expected = { data: [mockFileEntity], total: 1 };
      jest.spyOn(service, 'findByType').mockResolvedValue(expected);

      const result = await controller.findByType('pdf', 1, 20);

      expect(result).toEqual(expected);
      expect(service.findByType).toHaveBeenCalledWith('pdf', 1, 20);
    });
  });

  describe('update', () => {
    it('should update a file', async () => {
      const updateDto = { status: 'processed' };
      const updated = { ...mockFileEntity, ...updateDto };

      jest.spyOn(service, 'update').mockResolvedValue(updated);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a file', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      await controller.delete('1');

      expect(service.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('softDelete', () => {
    it('should soft delete a file', async () => {
      jest.spyOn(service, 'softDelete').mockResolvedValue(undefined);

      await controller.softDelete('1');

      expect(service.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
