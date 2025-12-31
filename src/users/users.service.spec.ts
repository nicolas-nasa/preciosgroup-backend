import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './users.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<UserEntity>;

  const mockUserEntity = {
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
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUserEntity);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUserEntity);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUserEntity);

      const result = await service.findById('1');

      expect(result).toEqual(mockUserEntity);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return users with pagination', async () => {
      const users = [mockUserEntity];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([users, 1]);

      const result = await service.findAll(1, 20);

      expect(result).toEqual({ data: users, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
      });
    });

    it('should throw BadRequestException when page or limit is invalid', async () => {
      await expect(service.findAll(0, 20)).rejects.toThrow(BadRequestException);
      await expect(service.findAll(1, 0)).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        fullName: 'Test User',
        cpf: '123.456.789-00',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockUserEntity);
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed_password');
      jest.spyOn(repository, 'save').mockResolvedValue(mockUserEntity);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUserEntity);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(bcrypt.hashSync).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when email already exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUserEntity);

      await expect(
        service.create({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when email or password is missing', async () => {
      await expect(service.create({ fullName: 'Test' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = { fullName: 'Updated User' };
      const updatedUser = { ...mockUserEntity, ...updateUserDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUserEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should hash password when updating password', async () => {
      const updateUserDto = { password: 'newpassword' };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUserEntity);
      (bcrypt.hashSync as jest.Mock).mockReturnValue('new_hashed_password');
      jest.spyOn(repository, 'save').mockResolvedValue(mockUserEntity);

      await service.update('1', updateUserDto);

      expect(bcrypt.hashSync).toHaveBeenCalledWith('newpassword', 10);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('deactivate', () => {
    it('should deactivate a user', async () => {
      const deactivatedUser = { ...mockUserEntity, isActive: false };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUserEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(deactivatedUser);

      await service.deactivate('1');

      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should soft delete a user', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUserEntity);
      jest.spyOn(repository, 'softDelete').mockResolvedValue({ affected: 1 });

      await service.softDelete('1');

      expect(repository.softDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('comparePassword', () => {
    it('should return true when password matches', () => {
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

      const result = service.comparePassword('password123', 'hashed_password');

      expect(result).toBe(true);
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        'password123',
        'hashed_password',
      );
    });

    it('should return false when password does not match', () => {
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      const result = service.comparePassword(
        'wrongpassword',
        'hashed_password',
      );

      expect(result).toBe(false);
    });
  });
});
