import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TypeOfProcessEntity } from './type-of-processes.entity';
import { CreateTypeOfProcessDto } from './dto/create-type-of-process.dto';
import { UpdateTypeOfProcessDto } from './dto/update-type-of-process.dto';

@Injectable()
export class TypeOfProcessesService {
  constructor(
    @InjectRepository(TypeOfProcessEntity)
    private readonly typeOfProcessesRepository: Repository<TypeOfProcessEntity>,
  ) {}

  async create(
    createTypeOfProcessDto: CreateTypeOfProcessDto,
  ): Promise<TypeOfProcessEntity> {
    const existingByName = await this.typeOfProcessesRepository.findOne({
      where: { name: createTypeOfProcessDto.name },
    });

    if (existingByName) {
      throw new BadRequestException(
        `Type of process with name "${createTypeOfProcessDto.name}" already exists`,
      );
    }

    const typeOfProcess = this.typeOfProcessesRepository.create(
      createTypeOfProcessDto,
    );

    return await this.typeOfProcessesRepository.save(typeOfProcess);
  }

  async findAll(): Promise<TypeOfProcessEntity[]> {
    return await this.typeOfProcessesRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllWithDeleted(): Promise<TypeOfProcessEntity[]> {
    return await this.typeOfProcessesRepository.find({
      order: { createdAt: 'DESC' },
      withDeleted: true,
    });
  }

  async findOne(id: string): Promise<TypeOfProcessEntity> {
    const typeOfProcess = await this.typeOfProcessesRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!typeOfProcess) {
      throw new NotFoundException(`Type of process with id "${id}" not found`);
    }

    return typeOfProcess;
  }

  async update(
    id: string,
    updateTypeOfProcessDto: UpdateTypeOfProcessDto,
  ): Promise<TypeOfProcessEntity> {
    const typeOfProcess = await this.findOne(id);

    if (updateTypeOfProcessDto.name != null) {
      if (updateTypeOfProcessDto.name !== typeOfProcess.name) {
        const existingByName = await this.typeOfProcessesRepository.findOne({
          where: { name: updateTypeOfProcessDto.name },
        });

        if (existingByName) {
          throw new BadRequestException(
            `Type of process with name "${updateTypeOfProcessDto.name}" already exists`,
          );
        }
      }
    }

    const updateData: Record<string, unknown> = {};
    if (updateTypeOfProcessDto.name != null) {
      updateData.name = updateTypeOfProcessDto.name;
    }
    if (updateTypeOfProcessDto.agrouped != null) {
      updateData.agrouped = updateTypeOfProcessDto.agrouped;
    }

    await this.typeOfProcessesRepository.update(id, updateData);

    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const typeOfProcess = await this.findOne(id);

    if (!typeOfProcess) {
      throw new NotFoundException(`Type of process with id "${id}" not found`);
    }

    await this.typeOfProcessesRepository.softDelete(id);
  }

  async restore(id: string): Promise<TypeOfProcessEntity> {
    const typeOfProcess = await this.typeOfProcessesRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!typeOfProcess) {
      throw new NotFoundException(`Type of process with id "${id}" not found`);
    }

    await this.typeOfProcessesRepository.restore(id);

    return await this.findOne(id);
  }
}
