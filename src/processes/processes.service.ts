import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessEntity } from './processes.entity';

@Injectable()
export class ProcessesService {
  private readonly logger = new Logger(ProcessesService.name);

  constructor(
    @InjectRepository(ProcessEntity)
    private readonly processesRepository: Repository<ProcessEntity>,
  ) {}

  async create(
    createProcessDto: Partial<ProcessEntity> & {
      orderId?: string;
      typeOfProcessId?: string;
    },
  ): Promise<ProcessEntity> {
    try {
      if (!createProcessDto.type || !createProcessDto.status) {
        throw new BadRequestException('Type and status are required');
      }

      if (!createProcessDto.orderId && !createProcessDto.order?.id) {
        throw new BadRequestException('orderId or order.id is required');
      }

      if (
        !createProcessDto.typeOfProcessId &&
        !createProcessDto.typeOfProcess?.id
      ) {
        throw new BadRequestException(
          'typeOfProcessId or typeOfProcess.id is required',
        );
      }

      if (createProcessDto.orderId && !createProcessDto.order) {
        createProcessDto.order = { id: createProcessDto.orderId } as any;
      }

      if (createProcessDto.typeOfProcessId && !createProcessDto.typeOfProcess) {
        createProcessDto.typeOfProcess = {
          id: createProcessDto.typeOfProcessId,
        } as any;
      }

      const process = this.processesRepository.create(createProcessDto);
      const savedProcess = await this.processesRepository.save(process);

      this.logger.log(`Process created with id: ${savedProcess.id}`);
      return savedProcess;
    } catch (error: unknown) {
      this.logger.error(
        `Error creating process: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: ProcessEntity[]; total: number }> {
    try {
      if (page < 1 || limit < 1) {
        throw new BadRequestException('Page and limit must be greater than 0');
      }

      const [data, total] = await this.processesRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding all processes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<ProcessEntity> {
    try {
      const process = await this.processesRepository.findOne({
        where: { id },
      });

      if (!process) {
        throw new NotFoundException(`Process with id ${id} not found`);
      }

      return process;
    } catch (error: unknown) {
      this.logger.error(
        `Error finding process by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByOrderId(
    orderId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: ProcessEntity[]; total: number }> {
    try {
      const [data, total] = await this.processesRepository.findAndCount({
        where: { order: { id: orderId } },
        skip: (page - 1) * limit,
        take: limit,
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding processes by order id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByStatus(
    status: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: ProcessEntity[]; total: number }> {
    try {
      const [data, total] = await this.processesRepository.findAndCount({
        where: { status },
        skip: (page - 1) * limit,
        take: limit,
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding processes by status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateProcessDto: Partial<ProcessEntity>,
  ): Promise<ProcessEntity> {
    try {
      const process = await this.findById(id);

      Object.assign(process, updateProcessDto);
      const updatedProcess = await this.processesRepository.save(process);

      this.logger.log(`Process updated with id: ${id}`);
      return updatedProcess;
    } catch (error: unknown) {
      this.logger.error(
        `Error updating process: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.processesRepository.delete(id);

      this.logger.log(`Process deleted with id: ${id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error deleting process: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.processesRepository.softDelete(id);

      this.logger.log(`Process soft deleted with id: ${id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error soft deleting process: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
