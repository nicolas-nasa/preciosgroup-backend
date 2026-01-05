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
import { CustomersService } from './customers.service';
import { CustomerEntity } from './customers.entity';
import { PermissionsGuard } from 'src/authentication/guards/user-permissions.guard';
import { Permissions } from 'src/authentication/decorators/permissions.decorator';
import { Permission } from 'src/authentication/enums/permission.enum';

@ApiTags('Customers')
@ApiBearerAuth('jwt-auth')
@Controller('customers')
@UseGuards(PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CUSTOMERS_CREATE)
  @ApiOperation({
    summary: 'Create new customer',
    description: 'Create a new customer',
  })
  @ApiBody({
    description: 'Customer creation data',
    schema: {
      type: 'object',
      properties: {
        companyName: { type: 'string' },
        cnpj: { type: 'string' },
        representantName: { type: 'string' },
        representantContact: { type: 'string' },
      },
      required: ['companyName', 'cnpj'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        companyName: { type: 'string' },
        cnpj: { type: 'string' },
        representantName: { type: 'string', nullable: true },
        representantContact: { type: 'string', nullable: true },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        deletedAt: { type: 'string', format: 'date-time', nullable: true },
        updatedBy: { type: 'string', format: 'uuid', nullable: true },
        deletedBy: { type: 'string', format: 'uuid', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async create(
    @Body() createCustomerDto: Partial<CustomerEntity>,
  ): Promise<CustomerEntity> {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.CUSTOMERS_READ)
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Retrieve paginated list of customers',
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
    description: 'Customers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              companyName: { type: 'string' },
              cnpj: { type: 'string' },
              representantName: { type: 'string', nullable: true },
              representantContact: { type: 'string', nullable: true },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time', nullable: true },
              updatedBy: { type: 'string', format: 'uuid', nullable: true },
              deletedBy: { type: 'string', format: 'uuid', nullable: true },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{ data: CustomerEntity[]; total: number }> {
    return this.customersService.findAll(page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.CUSTOMERS_READ)
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Retrieve a specific customer',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyName: { type: 'string' },
        cnpj: { type: 'string' },
        representantName: { type: 'string' },
        representantContact: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        deletedAt: { type: 'string', nullable: true },
        deletedBy: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  async findById(@Param('id') id: string): Promise<CustomerEntity> {
    return this.customersService.findById(id);
  }

  @Get('cnpj/:cnpj')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.CUSTOMERS_READ)
  @ApiOperation({
    summary: 'Get customer by CNPJ',
    description: 'Retrieve a customer by CNPJ',
  })
  @ApiParam({
    name: 'cnpj',
    description: 'Customer CNPJ',
    example: '12345678000195',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyName: { type: 'string' },
        cnpj: { type: 'string' },
        representantName: { type: 'string' },
        representantContact: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        deletedAt: { type: 'string', nullable: true },
        deletedBy: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  async findByCnpj(@Param('cnpj') cnpj: string): Promise<CustomerEntity> {
    return this.customersService.findByCnpj(cnpj);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.CUSTOMERS_UPDATE)
  @ApiOperation({
    summary: 'Update customer',
    description: 'Update customer information',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Customer update data',
    schema: {
      type: 'object',
      properties: {
        companyName: { type: 'string' },
        cnpj: { type: 'string' },
        representantName: { type: 'string' },
        representantContact: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyName: { type: 'string' },
        cnpj: { type: 'string' },
        representantName: { type: 'string' },
        representantContact: { type: 'string' },
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
    description: 'Customer not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: Partial<CustomerEntity>,
  ): Promise<CustomerEntity> {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(Permission.CUSTOMERS_DELETE)
  @ApiOperation({
    summary: 'Hard delete customer',
    description: 'Permanently delete a customer',
  })
  @ApiResponse({
    status: 204,
    description: 'Customer deleted',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return this.customersService.delete(id);
  }

  @Delete(':id/soft')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(Permission.CUSTOMERS_DELETE)
  @ApiOperation({
    summary: 'Soft delete customer',
    description: 'Soft delete a customer',
  })
  @ApiResponse({
    status: 204,
    description: 'Customer soft deleted',
  })
  async softDelete(@Param('id') id: string): Promise<void> {
    return this.customersService.softDelete(id);
  }
}
