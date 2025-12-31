import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './files.entity';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
  ) {}

  async create(createFileDto: Partial<FileEntity>): Promise<FileEntity> {
    try {
      if (!createFileDto.name || !createFileDto.type) {
        throw new BadRequestException('Name and type are required');
      }

      const file = this.filesRepository.create(createFileDto);
      const savedFile = await this.filesRepository.save(file);

      this.logger.log(`File created with id: ${savedFile.id}`);
      return savedFile;
    } catch (error: unknown) {
      this.logger.error(
        `Error creating file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: FileEntity[]; total: number }> {
    try {
      if (page < 1 || limit < 1) {
        throw new BadRequestException('Page and limit must be greater than 0');
      }

      const [data, total] = await this.filesRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        relations: ['process'],
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding all files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<FileEntity> {
    try {
      const file = await this.filesRepository.findOne({
        where: { id },
        relations: ['process'],
      });

      if (!file) {
        throw new NotFoundException(`File with id ${id} not found`);
      }

      return file;
    } catch (error: unknown) {
      this.logger.error(
        `Error finding file by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByProcessId(
    processId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: FileEntity[]; total: number }> {
    try {
      const [data, total] = await this.filesRepository.findAndCount({
        where: { process: { id: processId } },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['process'],
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding files by process id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByType(
    type: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: FileEntity[]; total: number }> {
    try {
      const [data, total] = await this.filesRepository.findAndCount({
        where: { type },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['process'],
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding files by type: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateFileDto: Partial<FileEntity>,
  ): Promise<FileEntity> {
    try {
      const file = await this.findById(id);

      Object.assign(file, updateFileDto);
      const updatedFile = await this.filesRepository.save(file);

      this.logger.log(`File updated with id: ${id}`);
      return updatedFile;
    } catch (error: unknown) {
      this.logger.error(
        `Error updating file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.filesRepository.delete(id);

      this.logger.log(`File deleted with id: ${id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error deleting file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.filesRepository.softDelete(id);

      this.logger.log(`File soft deleted with id: ${id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error soft deleting file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
