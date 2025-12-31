import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProcessesService } from './processes.service';
import { ProcessEntity } from './processes.entity';
import { RolesGuard } from 'src/authentication/guards/roles.guard';
import { PermissionsGuard } from 'src/authentication/guards/permissions.guard';
import { Roles } from 'src/authentication/decorators/roles.decorator';
import { Permissions } from 'src/authentication/decorators/permissions.decorator';
import { Role } from 'src/authentication/enums/role.enum';
import { Permission } from 'src/authentication/enums/permission.enum';

@ApiTags('Processes')
@ApiBearerAuth('jwt-auth')
@ApiBearerAuth('bypass-auth')
@Controller('processes')
@UseGuards(RolesGuard, PermissionsGuard)
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @Permissions(Permission.PROCESSES_CREATE)
  @ApiOperation({
    summary: 'Create new process',
    description: 'Create a new process (Admin/Manager/Operator only)',
  })
  @ApiBody({
    description: 'Process creation data',
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        amout: { type: 'number' },
        type: { type: 'string' },
        status: { type: 'string' },
      },
      required: ['orderId', 'amout', 'type', 'status'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Process created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        orderId: { type: 'string' },
        amout: { type: 'number' },
        type: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        deletedAt: { type: 'string', nullable: true },
        deletedBy: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async create(
    @Body() createProcessDto: Partial<ProcessEntity>,
  ): Promise<ProcessEntity> {
    return this.processesService.create(createProcessDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.PROCESSES_READ)
  @ApiOperation({
    summary: 'Get all processes',
    description: 'Retrieve paginated list of processes',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Processes retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              orderId: { type: 'string' },
              amout: { type: 'number' },
              type: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              deletedAt: { type: 'string', nullable: true },
              deletedBy: { type: 'string', nullable: true },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{ data: ProcessEntity[]; total: number }> {
    return this.processesService.findAll(page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.PROCESSES_READ)
  @ApiOperation({
    summary: 'Get process by ID',
    description: 'Retrieve a specific process',
  })
  @ApiParam({
    name: 'id',
    description: 'Process ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Process retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        orderId: { type: 'string' },
        amout: { type: 'number' },
        type: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        deletedAt: { type: 'string', nullable: true },
        deletedBy: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Process not found',
  })
  async findById(@Param('id') id: string): Promise<ProcessEntity> {
    return this.processesService.findById(id);
  }

  @Get('order/:orderId')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.PROCESSES_READ)
  @ApiOperation({
    summary: 'Get processes by order',
    description: 'Retrieve all processes for a specific order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Processes retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              orderId: { type: 'string' },
              amout: { type: 'number' },
              type: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              deletedAt: { type: 'string', nullable: true },
              deletedBy: { type: 'string', nullable: true },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  async findByOrderId(
    @Param('orderId') orderId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{ data: ProcessEntity[]; total: number }> {
    return this.processesService.findByOrderId(orderId, page, limit);
  }

  @Get('status/:status')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.PROCESSES_READ)
  @ApiOperation({
    summary: 'Get processes by status',
    description: 'Retrieve all processes with a specific status',
  })
  @ApiParam({
    name: 'status',
    description: 'Process status',
    example: 'in-progress',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Processes retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              orderId: { type: 'string' },
              amout: { type: 'number' },
              type: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              deletedAt: { type: 'string', nullable: true },
              deletedBy: { type: 'string', nullable: true },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  async findByStatus(
    @Param('status') status: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{ data: ProcessEntity[]; total: number }> {
    return this.processesService.findByStatus(status, page, limit);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @Permissions(Permission.PROCESSES_UPDATE)
  @ApiOperation({
    summary: 'Update process',
    description: 'Update process information (Admin/Manager/Operator only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Process ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Process update data',
    schema: {
      type: 'object',
      properties: {
        amout: { type: 'number' },
        type: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Process updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        orderId: { type: 'string' },
        amout: { type: 'number' },
        type: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        deletedAt: { type: 'string', nullable: true },
        deletedBy: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Process not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProcessDto: Partial<ProcessEntity>,
  ): Promise<ProcessEntity> {
    return this.processesService.update(id, updateProcessDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @Permissions(Permission.PROCESSES_DELETE)
  @ApiOperation({
    summary: 'Hard delete process',
    description: 'Permanently delete a process (Admin only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Process deleted',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return this.processesService.delete(id);
  }

  @Delete(':id/soft')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Permissions(Permission.PROCESSES_DELETE)
  @ApiOperation({
    summary: 'Soft delete process',
    description: 'Soft delete a process (Admin/Manager only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Process soft deleted',
  })
  async softDelete(@Param('id') id: string): Promise<void> {
    return this.processesService.softDelete(id);
  }
}
