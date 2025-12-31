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
import { FilesService } from './files.service';
import { FileEntity } from './files.entity';
import { RolesGuard } from 'src/authentication/guards/roles.guard';
import { PermissionsGuard } from 'src/authentication/guards/permissions.guard';
import { Roles } from 'src/authentication/decorators/roles.decorator';
import { Permissions } from 'src/authentication/decorators/permissions.decorator';
import { Role } from 'src/authentication/enums/role.enum';
import { Permission } from 'src/authentication/enums/permission.enum';

@ApiTags('Files')
@ApiBearerAuth('jwt-auth')
@ApiBearerAuth('bypass-auth')
@Controller('files')
@UseGuards(RolesGuard, PermissionsGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @Permissions(Permission.FILES_CREATE)
  @ApiOperation({
    summary: 'Create new file',
    description: 'Create a new file (Admin/Manager/Operator only)',
  })
  @ApiBody({
    description: 'File creation data',
    schema: {
      type: 'object',
      properties: {
        processId: { type: 'string' },
        name: { type: 'number' },
        type: { type: 'string' },
        status: { type: 'string' },
      },
      required: ['name', 'type', 'status'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        processId: { type: 'string' },
        name: { type: 'number' },
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
    @Body() createFileDto: Partial<FileEntity>,
  ): Promise<FileEntity> {
    return this.filesService.create(createFileDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.FILES_READ)
  @ApiOperation({
    summary: 'Get all files',
    description: 'Retrieve paginated list of files',
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
    description: 'Files retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              processId: { type: 'string' },
              name: { type: 'number' },
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
  ): Promise<{ data: FileEntity[]; total: number }> {
    return this.filesService.findAll(page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.FILES_READ)
  @ApiOperation({
    summary: 'Get file by ID',
    description: 'Retrieve a specific file',
  })
  @ApiParam({
    name: 'id',
    description: 'File ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'File retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        processId: { type: 'string' },
        name: { type: 'number' },
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
    description: 'File not found',
  })
  async findById(@Param('id') id: string): Promise<FileEntity> {
    return this.filesService.findById(id);
  }

  @Get('process/:processId')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.FILES_READ)
  @ApiOperation({
    summary: 'Get files by process',
    description: 'Retrieve all files for a specific process',
  })
  @ApiParam({
    name: 'processId',
    description: 'Process ID (UUID)',
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
    description: 'Files retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              processId: { type: 'string' },
              name: { type: 'number' },
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
  async findByProcessId(
    @Param('processId') processId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{ data: FileEntity[]; total: number }> {
    return this.filesService.findByProcessId(processId, page, limit);
  }

  @Get('type/:type')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.FILES_READ)
  @ApiOperation({
    summary: 'Get files by type',
    description: 'Retrieve all files of a specific type',
  })
  @ApiParam({
    name: 'type',
    description: 'File type',
    example: 'pdf',
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
    description: 'Files retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              processId: { type: 'string' },
              name: { type: 'number' },
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
  async findByType(
    @Param('type') type: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{ data: FileEntity[]; total: number }> {
    return this.filesService.findByType(type, page, limit);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @Permissions(Permission.FILES_UPDATE)
  @ApiOperation({
    summary: 'Update file',
    description: 'Update file information (Admin/Manager/Operator only)',
  })
  @ApiParam({
    name: 'id',
    description: 'File ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'File update data',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'number' },
        type: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        processId: { type: 'string' },
        name: { type: 'number' },
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
    description: 'File not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateFileDto: Partial<FileEntity>,
  ): Promise<FileEntity> {
    return this.filesService.update(id, updateFileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FILES_DELETE)
  @ApiOperation({
    summary: 'Hard delete file',
    description: 'Permanently delete a file (Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'File ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'File deleted',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return this.filesService.delete(id);
  }

  @Delete(':id/soft')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Permissions(Permission.FILES_DELETE)
  @ApiOperation({
    summary: 'Soft delete file',
    description: 'Soft delete a file (Admin/Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'File ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'File soft deleted',
  })
  async softDelete(@Param('id') id: string): Promise<void> {
    return this.filesService.softDelete(id);
  }
}
