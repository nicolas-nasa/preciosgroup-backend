import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UserEntity } from './users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      return user || null;
    } catch (error: unknown) {
      this.logger.error(
        `Error finding user by email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByCpf(cpf: string): Promise<UserEntity | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { cpf } });
      return user || null;
    } catch (error: unknown) {
      this.logger.error(
        `Error finding user by CPF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    } catch (error: unknown) {
      this.logger.error(
        `Error finding user by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: UserEntity[]; total: number }> {
    try {
      if (page < 1 || limit < 1) {
        throw new BadRequestException('Page and limit must be greater than 0');
      }

      const [data, total] = await this.usersRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding all users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    try {
      if (!userData.email || !userData.password) {
        throw new BadRequestException('Email and password are required');
      }

      const existingUser = await this.usersRepository.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const user = this.usersRepository.create(userData);
      user.password = this.hashPassword(user.password);
      const savedUser = await this.usersRepository.save(user);

      this.logger.log(`User created with id: ${savedUser.id}`);
      return savedUser;
    } catch (error: unknown) {
      this.logger.error(
        `Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateData: Partial<UserEntity>,
  ): Promise<UserEntity> {
    try {
      const user = await this.findById(id);

      if (updateData.password) {
        updateData.password = this.hashPassword(updateData.password);
      }

      Object.assign(user, updateData);
      const updatedUser = await this.usersRepository.save(user);

      this.logger.log(`User updated with id: ${id}`);
      return updatedUser;
    } catch (error: unknown) {
      this.logger.error(
        `Error updating user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async updateOwnProfile(
    userId: string,
    updateData: Partial<UserEntity>,
  ): Promise<UserEntity> {
    try {
      const user = await this.findById(userId);

      // Allow only these fields for self-update
      const allowedFields: (keyof UserEntity)[] = [
        'fullName',
        'password',
        'contact',
        'email',
      ];
      const filteredData: Record<string, unknown> = {};

      allowedFields.forEach((field) => {
        if (field in updateData) {
          filteredData[field] = updateData[field];
        }
      });

      const typedFilteredData = filteredData as Partial<UserEntity>;

      if (Object.keys(filteredData).length === 0) {
        throw new BadRequestException(
          'No valid fields provided. You can only update: fullName, password, contact, email',
        );
      }

      if (typedFilteredData.password) {
        typedFilteredData.password = this.hashPassword(
          typedFilteredData.password,
        );
      }

      Object.assign(user, typedFilteredData);
      const updatedUser = await this.usersRepository.save(user);

      this.logger.log(`User ${userId} updated their own profile`);
      return updatedUser;
    } catch (error: unknown) {
      this.logger.error(
        `Error updating user profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async deactivate(id: string): Promise<void> {
    try {
      const user = await this.findById(id);
      user.isActive = false;
      await this.usersRepository.save(user);

      this.logger.log(`User deactivated with id: ${id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error deactivating user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.usersRepository.softDelete(id);

      this.logger.log(`User soft deleted with id: ${id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error soft deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
