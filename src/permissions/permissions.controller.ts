import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/decorators/roles.decorator';
import { Role } from '../authentication/enums/role.enum';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new permission',
    description:
      'Create a new permission in the system. Only ADMIN users can perform this action.',
  })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Create Users',
        description: 'Permission to create new users',
        key: 'users:create',
        createdAt: '2024-12-31T10:00:00.000Z',
        updatedAt: '2024-12-31T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Retrieve a list of all permissions in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all permissions',
    schema: {
      example: [
        {
          id: 'uuid-1',
          name: 'Create Users',
          description: 'Permission to create new users',
          key: 'users:create',
          createdAt: '2024-12-31T10:00:00.000Z',
          updatedAt: '2024-12-31T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific permission',
    description: 'Retrieve details of a specific permission by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the permission',
    example: 'uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission found',
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Create Users',
        description: 'Permission to create new users',
        key: 'users:create',
        createdAt: '2024-12-31T10:00:00.000Z',
        updatedAt: '2024-12-31T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a permission',
    description:
      'Update an existing permission. Only ADMIN users can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the permission to update',
    example: 'uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Create Users',
        description: 'Permission to create new users',
        key: 'users:create',
        createdAt: '2024-12-31T10:00:00.000Z',
        updatedAt: '2024-12-31T10:01:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a permission',
    description:
      'Delete a permission from the system. Only ADMIN users can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the permission to delete',
    example: 'uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
