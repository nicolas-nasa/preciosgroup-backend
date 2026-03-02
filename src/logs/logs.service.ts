import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogEntity } from './logs.entity';
import { FriendlyActionEnum } from './enums/action.enum';

/**
 * LogsService
 * Serviço responsável por gerenciar logs da aplicação
 * 
 * Campos principais:
 * - action: Ação realizada (POST, GET, PUT, DELETE, PATCH)
 * - result: Resultado da ação (Sucesso, erro específico, etc.)
 * - parameters: Parâmetros da requisição (query, body, route params)
 * - errorData: Dados completos do erro (stack trace, tipo, mensagem detalhada) - Apenas quando há erro
 * - userId: ID do usuário que realizou a ação
 * - actionDate: Data/hora da ação
 */
@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(
    @InjectRepository(LogEntity)
    private readonly logsRepository: Repository<LogEntity>,
  ) {}

  /**
   * Cria um novo registro de log
   * @param createLogDto Dados do log a ser criado, incluindo errorData quando houver erro
   * @returns LogEntity criado e salvo no banco de dados
   */
  async create(createLogDto: Partial<LogEntity>): Promise<LogEntity> {
    try {
      if (!createLogDto.action) {
        throw new BadRequestException('Action is required');
      }

      const log = this.logsRepository.create(createLogDto);
      const savedLog = await this.logsRepository.save(log);

      return savedLog;
    } catch (error: unknown) {
      this.logger.error(
        `Error creating log: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: LogEntity[]; total: number }> {
    try {
      if (page < 1 || limit < 1) {
        throw new BadRequestException('Page and limit must be greater than 0');
      }

      const [data, total] = await this.logsRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding all logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<LogEntity> {
    try {
      const log = await this.logsRepository.findOne({
        where: { id },
      });

      if (!log) {
        throw new NotFoundException(`Log with id ${id} not found`);
      }

      return log;
    } catch (error: unknown) {
      this.logger.error(
        `Error finding log by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByAction(
    action: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: LogEntity[]; total: number }> {
    try {
      const [data, total] = await this.logsRepository.findAndCount({
        where: { action },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding logs by action: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByFriendlyAction(
    friendlyAction: FriendlyActionEnum,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: LogEntity[]; total: number }> {
    try {
      const [data, total] = await this.logsRepository.findAndCount({
        where: { friendlyAction },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding logs by friendly action: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByModule(
    module: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: LogEntity[]; total: number }> {
    try {
      const [data, total] = await this.logsRepository.findAndCount({
        where: { module },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding logs by module: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: LogEntity[]; total: number }> {
    try {
      const [data, total] = await this.logsRepository.findAndCount({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return { data, total };
    } catch (error: unknown) {
      this.logger.error(
        `Error finding logs by userId: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
