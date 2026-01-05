import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AddPermissionDto } from './dto/add-permission.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PermissionsGuard } from 'src/authentication/guards/user-permissions.guard';
import { Permissions } from 'src/authentication/decorators/permissions.decorator';
import { Permission } from 'src/authentication/enums/permission.enum';

@ApiTags('Roles')
@ApiBearerAuth('jwt-auth')
@Controller('roles')
@UseGuards(PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions(Permission.ROLES_CREATE)
  @ApiOperation({
    summary: 'Create a new role',
    description:
      'Create a new role in the system. You can optionally assign permissions during creation. Only ADMIN users can perform this action.',
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string' },
        key: { type: 'string' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions(Permission.ROLES_READ)
  @ApiOperation({
    summary: 'Get all roles',
    description:
      'Retrieve a list of all roles in the system with their associated permissions',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all roles',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          key: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Get(':id/permissions')
  @Permissions()
  @ApiOperation({
    summary: 'Get permissions for a specific role',
    description:
      'Retrieve all permissions associated with a specific role by role ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role',
    example: 'uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'List of permissions for the role',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          key: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getPermissionsByRole(@Param('id') id: string) {
    return await this.rolesService.getPermissionsByRole(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific role',
    description:
      'Retrieve details of a specific role by ID including its permissions',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role',
    example: 'uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Role found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string' },
        key: { type: 'string' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findOne(@Param('id') id: string) {
    const role = await this.rolesService.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  @Patch(':id')
  @Permissions(Permission.ROLES_UPDATE)
  @ApiOperation({
    summary: 'Update a role',
    description:
      'Update an existing role. You can update name, description, key, and permissions. Only ADMIN users can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role to update',
    example: 'uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Manager',
        description: 'Updated description',
        key: 'manager',
        isActive: true,
        createdAt: '2024-12-31T10:00:00.000Z',
        updatedAt: '2024-12-31T10:01:00.000Z',
        permissions: [],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.rolesService.update(id, updateRoleDto);
  }

  @Post(':roleId/permissions')
  @Permissions(Permission.ROLES_UPDATE)
  @ApiOperation({
    summary: 'Add a permission to a role',
    description:
      'Add a specific permission to an existing role. The permission must exist and not already be assigned to the role.',
  })
  @ApiParam({
    name: 'roleId',
    description: 'UUID of the role',
    example: 'uuid-role-1',
  })
  @ApiResponse({
    status: 201,
    description: 'Permission added to role successfully',
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Manager',
        description: 'Manager with limited access',
        key: 'manager',
        isActive: true,
        permissions: [
          {
            id: 'uuid-perm-1',
            name: 'Create Users',
            description: 'Permission to create users',
            key: 'users:create',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Permission already assigned or invalid input',
  })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async addPermission(
    @Param('roleId') roleId: string,
    @Body() addPermissionDto: AddPermissionDto,
  ) {
    return await this.rolesService.addPermission(
      roleId,
      addPermissionDto.permissionId,
    );
  }

  @Delete(':roleId/permissions/:permissionId')
  @Permissions(Permission.ROLES_UPDATE)
  @ApiOperation({
    summary: 'Remove a permission from a role',
    description:
      'Remove a specific permission from a role. The permission must be currently assigned to the role.',
  })
  @ApiParam({
    name: 'roleId',
    description: 'UUID of the role',
    example: 'uuid-role-1',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'UUID of the permission to remove',
    example: 'uuid-perm-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission removed from role successfully',
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Manager',
        description: 'Manager with limited access',
        key: 'manager',
        isActive: true,
        permissions: [],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Permission not assigned to this role',
  })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return await this.rolesService.removePermission(roleId, permissionId);
  }

  @Delete(':id')
  @Permissions(Permission.ROLES_DELETE)
  @ApiOperation({
    summary: 'Delete a role',
    description:
      'Delete a role from the system. Only ADMIN users can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role to delete',
    example: 'uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async remove(@Param('id') id: string) {
    return await this.rolesService.remove(id);
  }
}
