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
import { OrdersService } from './orders.service';
import { OrderEntity } from './orders.entity';
import { RolesGuard } from 'src/authentication/guards/roles.guard';
import { PermissionsGuard } from 'src/authentication/guards/permissions.guard';
import { Roles } from 'src/authentication/decorators/roles.decorator';
import { Permissions } from 'src/authentication/decorators/permissions.decorator';
import { Role } from 'src/authentication/enums/role.enum';
import { Permission } from 'src/authentication/enums/permission.enum';

@ApiTags('Orders')
@ApiBearerAuth('jwt-auth')
@ApiBearerAuth('bypass-auth')
@Controller('orders')
@UseGuards(RolesGuard, PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @Permissions(Permission.ORDERS_CREATE)
  @ApiOperation({
    summary: 'Create new order',
    description: 'Create a new order (Admin/Manager/Operator only)',
  })
  @ApiBody({
    description: 'Order creation data',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        customerId: { type: 'string' },
      },
      required: ['status', 'customerId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        customerId: { type: 'string' },
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
    @Body() createOrderDto: Partial<OrderEntity>,
  ): Promise<OrderEntity> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.ORDERS_READ)
  @ApiOperation({
    summary: 'Get all orders',
    description: 'Retrieve paginated list of orders',
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
    description: 'Orders retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              customerId: { type: 'string' },
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
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{ data: OrderEntity[]; total: number }> {
    return this.ordersService.findAll(page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.ORDERS_READ)
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Retrieve a specific order',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        customerId: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        deletedAt: { type: 'string', nullable: true },
        deletedBy: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async findById(@Param('id') id: string): Promise<OrderEntity> {
    return this.ordersService.findById(id);
  }

  @Get('customer/:customerId')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.ORDERS_READ)
  @ApiOperation({
    summary: 'Get orders by customer',
    description: 'Retrieve all orders for a specific customer',
  })
  @ApiParam({
    name: 'customerId',
    description: 'Customer ID (UUID)',
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
    description: 'Orders retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              customerId: { type: 'string' },
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
  async findByCustomerId(
    @Param('customerId') customerId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{ data: OrderEntity[]; total: number }> {
    return this.ordersService.findByCustomerId(customerId, page, limit);
  }

  @Get('status/:status')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.ORDERS_READ)
  @ApiOperation({
    summary: 'Get orders by status',
    description: 'Retrieve all orders with a specific status',
  })
  @ApiParam({
    name: 'status',
    description: 'Order status',
    example: 'pending',
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
    description: 'Orders retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              customerId: { type: 'string' },
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
  ): Promise<{ data: OrderEntity[]; total: number }> {
    return this.ordersService.findByStatus(status, page, limit);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @Permissions(Permission.ORDERS_UPDATE)
  @ApiOperation({
    summary: 'Update order',
    description: 'Update order information (Admin/Manager/Operator only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Order update data',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        customerId: { type: 'string' },
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
    description: 'Order not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: Partial<OrderEntity>,
  ): Promise<OrderEntity> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @Permissions(Permission.ORDERS_DELETE)
  @ApiOperation({
    summary: 'Hard delete order',
    description: 'Permanently delete an order (Admin only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Order deleted',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return this.ordersService.delete(id);
  }

  @Delete(':id/soft')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Permissions(Permission.ORDERS_DELETE)
  @ApiOperation({
    summary: 'Soft delete order',
    description: 'Soft delete an order (Admin/Manager only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Order soft deleted',
  })
  async softDelete(@Param('id') id: string): Promise<void> {
    return this.ordersService.softDelete(id);
  }
}
