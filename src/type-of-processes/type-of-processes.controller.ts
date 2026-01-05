import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TypeOfProcessesService } from './type-of-processes.service';
import { CreateTypeOfProcessDto } from './dto/create-type-of-process.dto';
import { UpdateTypeOfProcessDto } from './dto/update-type-of-process.dto';
import { PermissionsGuard } from '../authentication/guards/user-permissions.guard';
import { Permissions } from '../authentication/decorators/permissions.decorator';
import { Permission } from '../authentication/enums/permission.enum';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { TypeOfProcessEntity } from './type-of-processes.entity';

@ApiTags('Type-of-Processes')
@ApiBearerAuth('jwt-auth')
@Controller('type-of-processes')
@UseGuards(PermissionsGuard)
export class TypeOfProcessesController {
  constructor(
    private readonly typeOfProcessesService: TypeOfProcessesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.TYPE_OF_PROCESSES_CREATE)
  @ApiOperation({
    summary: 'Create a new type of process',
    description: 'Create a new type of process in the system.',
  })
  @ApiCreatedResponse({
    description: 'Type of process created successfully',
    type: TypeOfProcessEntity,
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Quality Control',
        agrouped: false,
        createdAt: '2024-12-31T10:00:00.000Z',
        updatedAt: '2024-12-31T10:00:00.000Z',
        deletedAt: null,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or duplicate name',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only ADMIN and MANAGER users can create',
  })
  async create(
    @Body() createTypeOfProcessDto: CreateTypeOfProcessDto,
  ): Promise<TypeOfProcessEntity> {
    return await this.typeOfProcessesService.create(createTypeOfProcessDto);
  }

  @Get()
  @Permissions(Permission.PROCESSES_READ)
  @ApiOperation({
    summary: 'Get all types of processes',
    description:
      'Retrieve a list of all active types of processes in the system',
  })
  @ApiOkResponse({
    description: 'List of all types of processes',
    type: [TypeOfProcessEntity],
    schema: {
      example: [
        {
          id: 'uuid-1',
          name: 'Quality Control',
          agrouped: false,
          createdAt: '2024-12-31T10:00:00.000Z',
          updatedAt: '2024-12-31T10:00:00.000Z',
          deletedAt: null,
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid authentication token',
  })
  async findAll(): Promise<TypeOfProcessEntity[]> {
    return await this.typeOfProcessesService.findAll();
  }

  @Get(':id')
  @Permissions(Permission.PROCESSES_READ)
  @ApiOperation({
    summary: 'Get a type of process by ID',
    description: 'Retrieve a specific type of process by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'The unique identifier of the type of process',
  })
  @ApiOkResponse({
    description: 'Type of process found and returned',
    type: TypeOfProcessEntity,
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Quality Control',
        agrouped: false,
        createdAt: '2024-12-31T10:00:00.000Z',
        updatedAt: '2024-12-31T10:00:00.000Z',
        deletedAt: null,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Type of process not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid authentication token',
  })
  async findOne(@Param('id') id: string): Promise<TypeOfProcessEntity> {
    return await this.typeOfProcessesService.findOne(id);
  }

  @Patch(':id')
  @Permissions(Permission.TYPE_OF_PROCESSES_UPDATE)
  @ApiOperation({
    summary: 'Update a type of process',
    description: 'Update an existing type of process.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'The unique identifier of the type of process to update',
  })
  @ApiOkResponse({
    description: 'Type of process updated successfully',
    type: TypeOfProcessEntity,
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Quality Control',
        agrouped: false,
        createdAt: '2024-12-31T10:00:00.000Z',
        updatedAt: '2024-12-31T10:00:00.000Z',
        deletedAt: null,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Type of process not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or duplicate name',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only ADMIN and MANAGER users can update',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTypeOfProcessDto: UpdateTypeOfProcessDto,
  ): Promise<TypeOfProcessEntity> {
    return await this.typeOfProcessesService.update(id, updateTypeOfProcessDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(Permission.TYPE_OF_PROCESSES_DELETE)
  @ApiOperation({
    summary: 'Delete a type of process',
    description:
      'Soft delete a type of process (marks as deleted without removing from database).',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'The unique identifier of the type of process to delete',
  })
  @ApiResponse({
    status: 204,
    description: 'Type of process deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Type of process not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only ADMIN users can delete',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.typeOfProcessesService.remove(id);
  }

  @Post(':id/restore')
  @Permissions(Permission.TYPE_OF_PROCESSES_DELETE)
  @ApiOperation({
    summary: 'Restore a deleted type of process',
    description: 'Restore a previously soft-deleted type of process.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'The unique identifier of the type of process to restore',
  })
  @ApiOkResponse({
    description: 'Type of process restored successfully',
    type: TypeOfProcessEntity,
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Quality Control',
        agrouped: false,
        createdAt: '2024-12-31T10:00:00.000Z',
        updatedAt: '2024-12-31T10:00:00.000Z',
        deletedAt: null,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Type of process not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only ADMIN users can restore',
  })
  async restore(@Param('id') id: string): Promise<TypeOfProcessEntity> {
    return await this.typeOfProcessesService.restore(id);
  }
}
