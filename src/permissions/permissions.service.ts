import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permissions.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionsRepository.create(createPermissionDto);
    return await this.permissionsRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionsRepository.find();
  }

  async findOne(id: string): Promise<Permission | null> {
    return await this.permissionsRepository.findOne({
      where: { id },
    });
  }

  async findByKey(key: string): Promise<Permission | null> {
    return await this.permissionsRepository.findOne({
      where: { key },
    });
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission | null> {
    await this.permissionsRepository.update(id, updatePermissionDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.permissionsRepository.delete(id);
  }

  async seedPermissions(
    permissions: CreatePermissionDto[],
  ): Promise<Permission[]> {
    const existingPermissions = await this.findAll();
    const existingKeys = new Set(existingPermissions.map((p) => p.key));

    const permissionsToCreate = permissions.filter(
      (p) => !existingKeys.has(p.key),
    );

    if (permissionsToCreate.length === 0) {
      return existingPermissions;
    }

    const created = await Promise.all(
      permissionsToCreate.map((p) => this.create(p)),
    );

    return [...existingPermissions, ...created];
  }
}
