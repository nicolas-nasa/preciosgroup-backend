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
  Req,
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
import { UsersService } from './users.service';
import { UserEntity } from './users.entity';
import { RolesGuard } from 'src/authentication/guards/roles.guard';
import { PermissionsGuard } from 'src/authentication/guards/permissions.guard';
import { Roles } from 'src/authentication/decorators/roles.decorator';
import { Permissions } from 'src/authentication/decorators/permissions.decorator';
import { Role } from 'src/authentication/enums/role.enum';
import { Permission } from 'src/authentication/enums/permission.enum';

@ApiTags('Users')
@ApiBearerAuth('jwt-auth')
@ApiBearerAuth('bypass-auth')
@Controller('users')
@UseGuards(RolesGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @Permissions(Permission.USERS_CREATE)
  @ApiOperation({
    summary: 'Create new user',
    description: 'Create a new user (Admin only)',
  })
  @ApiBody({
    description: 'User creation data',
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'John Doe' },
        cpf: { type: 'string', example: '12345678901' },
        email: { type: 'string', example: 'john@example.com' },
        contact: { type: 'string', example: '1199999999' },
        password: { type: 'string', example: 'password123' },
        role: {
          type: 'string',
          enum: ['admin', 'manager', 'operator', 'customer', 'viewer'],
        },
      },
      required: ['fullName', 'cpf', 'email', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        fullName: { type: 'string' },
        cpf: { type: 'string' },
        email: { type: 'string' },
        contact: { type: 'string' },
        role: { type: 'string' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async create(
    @Body() createUserDto: Partial<UserEntity>,
  ): Promise<UserEntity> {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current user',
    description: 'Retrieve the authenticated user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        fullName: { type: 'string' },
        cpf: { type: 'string' },
        email: { type: 'string' },
        contact: { type: 'string' },
        role: { type: 'string' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMe(
    @Req() req: Request & { user?: Record<string, unknown> },
  ): Promise<UserEntity> {
    const userId = req.user?.id as string;
    return this.usersService.findById(userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.USERS_READ)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve paginated list of users',
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
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              fullName: { type: 'string' },
              cpf: { type: 'string' },
              email: { type: 'string' },
              contact: { type: 'string' },
              role: { type: 'string' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
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
  ): Promise<{ data: UserEntity[]; total: number }> {
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.USERS_READ)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        fullName: { type: 'string' },
        cpf: { type: 'string' },
        email: { type: 'string' },
        contact: { type: 'string' },
        role: { type: 'string' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findById(@Param('id') id: string): Promise<UserEntity> {
    return this.usersService.findById(id);
  }

  @Put('profile/self')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update own profile',
    description:
      'Update authenticated user profile (name, password, contact, email only)',
  })
  @ApiBody({
    description: 'User profile update data (restricted fields)',
    schema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          example: 'John Doe',
          description: 'Full name',
        },
        email: {
          type: 'string',
          example: 'john@example.com',
          description: 'Email address',
        },
        contact: {
          type: 'string',
          example: '1199999999',
          description: 'Contact phone number',
        },
        password: {
          type: 'string',
          example: 'newPassword123',
          description: 'New password (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        fullName: { type: 'string' },
        email: { type: 'string' },
        contact: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data provided',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateOwnProfile(
    @Req() req: Request & { user?: Record<string, unknown> },
    @Body() updateUserDto: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const userId = req.user?.id as string;
    return this.usersService.updateOwnProfile(userId, updateUserDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @Permissions(Permission.USERS_UPDATE)
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information (Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'User update data',
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        contact: { type: 'string' },
        role: {
          type: 'string',
          enum: ['admin', 'manager', 'operator', 'customer', 'viewer'],
        },
        password: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        fullName: { type: 'string' },
        cpf: { type: 'string' },
        email: { type: 'string' },
        contact: { type: 'string' },
        role: { type: 'string' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<UserEntity>,
  ): Promise<UserEntity> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id/soft')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @Permissions(Permission.USERS_DELETE)
  @ApiOperation({
    summary: 'Soft delete user',
    description: 'Soft delete a user (mark as deleted, Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'User soft deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async softDelete(@Param('id') id: string): Promise<void> {
    return this.usersService.softDelete(id);
  }

  @Put(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @Permissions(Permission.USERS_UPDATE)
  @ApiOperation({
    summary: 'Deactivate user',
    description: 'Deactivate a user account (Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'User deactivated',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async deactivate(@Param('id') id: string): Promise<void> {
    return this.usersService.deactivate(id);
  }
}
