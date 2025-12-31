import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './roles.entity';
import { Permission } from '../permissions/permissions.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const permissions = createRoleDto.permissionIds
      ? (
          await Promise.all(
            createRoleDto.permissionIds.map((id) =>
              this.permissionsService.findOne(id),
            ),
          )
        ).filter((p): p is any => p !== null)
      : [];

    const role = this.rolesRepository.create({
      ...createRoleDto,
      permissions,
    });

    return await this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.rolesRepository.find({
      relations: ['permissions'],
    });
  }

  async findOne(id: string): Promise<Role | null> {
    return await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findByKey(key: string): Promise<Role | null> {
    return await this.rolesRepository.findOne({
      where: { key },
      relations: ['permissions'],
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    if (updateRoleDto.permissionIds) {
      const permissions = (
        await Promise.all(
          updateRoleDto.permissionIds.map((id) =>
            this.permissionsService.findOne(id),
          ),
        )
      ).filter((p): p is any => p !== null);
      await this.rolesRepository.update(id, {
        ...updateRoleDto,
        permissions,
      });
    } else {
      await this.rolesRepository.update(id, updateRoleDto);
    }

    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return updated;
  }

  async addPermission(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findOne(roleId);
    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }

    const permission = await this.permissionsService.findOne(permissionId);
    if (!permission) {
      throw new NotFoundException(
        `Permission with id ${permissionId} not found`,
      );
    }

    if (role.permissions.find((p: Permission) => p.id === permissionId)) {
      throw new BadRequestException(
        'This permission is already assigned to this role',
      );
    }

    role.permissions.push(permission);
    return await this.rolesRepository.save(role);
  }

  async removePermission(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findOne(roleId);
    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }

    if (!role.permissions.find((p: Permission) => p.id === permissionId)) {
      throw new BadRequestException(
        'This permission is not assigned to this role',
      );
    }

    role.permissions = role.permissions.filter(
      (p: Permission) => p.id !== permissionId,
    );
    return await this.rolesRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    await this.rolesRepository.delete(id);
  }

  async seedRoles(roles: CreateRoleDto[]): Promise<Role[]> {
    const existingRoles = await this.findAll();
    const existingKeys = new Set(existingRoles.map((r) => r.key));

    const rolesToCreate = roles.filter((r) => !existingKeys.has(r.key));

    if (rolesToCreate.length === 0) {
      return existingRoles;
    }

    const created = await Promise.all(rolesToCreate.map((r) => this.create(r)));

    return [...existingRoles, ...created];
  }
}
