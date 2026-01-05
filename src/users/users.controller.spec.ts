import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './users.entity';
import { PermissionsGuard } from 'src/authentication/guards/permissions.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUserEntity: UserEntity = {
    id: '1',
    fullName: 'Test User',
    cpf: '123.456.789-00',
    email: 'test@example.com',
    contact: '11999999999',
    role: 'user',
    password: 'hashed_password',
    isActive: true,
    createAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            deactivate: jest.fn(),
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockUserEntity);

      const result = await controller.create({
        fullName: 'Test User',
        email: 'test@example.com',
      });

      expect(result).toEqual(mockUserEntity);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      const expected = { data: [mockUserEntity], total: 1 };
      jest.spyOn(service, 'findAll').mockResolvedValue(expected);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(expected);
      expect(service.findAll).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUserEntity);

      const result = await controller.findById('1');

      expect(result).toEqual(mockUserEntity);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = { fullName: 'Updated User' };
      const updatedUser = { ...mockUserEntity, ...updateUserDto };

      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a user', async () => {
      jest.spyOn(service, 'softDelete').mockResolvedValue(undefined);

      await controller.softDelete('1');

      expect(service.softDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('deactivate', () => {
    it('should deactivate a user', async () => {
      jest.spyOn(service, 'deactivate').mockResolvedValue(undefined);

      await controller.deactivate('1');

      expect(service.deactivate).toHaveBeenCalledWith('1');
    });
  });
});
