import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { PermissionsGuard } from 'src/authentication/guards/user-permissions.guard';
import { Permissions } from 'src/authentication/decorators/permissions.decorator';
import { Permission } from 'src/authentication/enums/permission.enum';

@ApiTags('Logs')
@ApiBearerAuth('jwt-auth')
@Controller('logs')
@UseGuards(PermissionsGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.LOGS_READ)
  @ApiOperation({
    summary: 'List all logs',
    description: 'Retrieve paginated list of all logs',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'Logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              module: { type: 'string' },
              route: { type: 'string' },
              action: { type: 'string' },
              friendlyAction: { type: 'string' },
              result: { type: 'string' },
              userId: { type: 'string', format: 'uuid', nullable: true },
              actionDate: { type: 'string', format: 'date-time' },
              parameters: {
                type: 'object',
                description: 'Request parameters (query, body, route params)',
                nullable: true,
                example: { name: 'John', role: 'admin' },
              },
              user: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  fullName: { type: 'string' },
                  cpf: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  contact: { type: 'string', nullable: true },
                },
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time', nullable: true },
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
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.logsService.findAll(page, limit);
  }

  // @Get('action/:action')
  // @HttpCode(HttpStatus.OK)
  // @Permissions(Permission.LOGS_READ)
  // @ApiOperation({
  //   summary: 'Filter logs by action',
  //   description: 'Retrieve logs filtered by action type',
  // })
  // @ApiParam({
  //   name: 'action',
  //   description: 'Action type to filter by (e.g., CREATE, UPDATE, DELETE)',
  // })
  // @ApiQuery({
  //   name: 'page',
  //   required: false,
  //   type: Number,
  //   description: 'Page number (default: 1)',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   type: Number,
  //   description: 'Items per page (default: 20)',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Logs retrieved successfully',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       data: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             id: { type: 'string' },
  //             module: { type: 'string' },
  //             route: { type: 'string' },
  //             action: { type: 'string' },
  //             friendlyAction: { type: 'string' },
  //             result: { type: 'string' },
  //             userId: { type: 'string' },
  //             actionDate: { type: 'string' },
  //             parameters: {
  //               type: 'object',
  //               description: 'Request parameters (query, body, route params)',
  //               nullable: true,
  //               example: { name: 'John', role: 'admin' },
  //             },
  //             createdAt: { type: 'string' },
  //             updatedAt: { type: 'string' },
  //             deletedAt: { type: 'string', nullable: true },
  //             deletedBy: { type: 'string', nullable: true },
  //           },
  //         },
  //       },
  //       total: { type: 'number' },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 403,
  //   description: 'Insufficient permissions',
  // })
  // async findByAction(
  //   @Param('action') action: string,
  //   @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
  //   @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  // ) {
  //   return this.logsService.findByAction(action, page, limit);
  // }

  // @Get('user/:userId')
  // @HttpCode(HttpStatus.OK)
  // @Permissions(Permission.LOGS_READ)
  // @ApiOperation({
  //   summary: 'Filter logs by user',
  //   description: 'Retrieve all logs performed by a specific user',
  // })
  // @ApiParam({
  //   name: 'userId',
  //   description: 'User ID to filter by',
  // })
  // @ApiQuery({
  //   name: 'page',
  //   required: false,
  //   type: Number,
  //   description: 'Page number (default: 1)',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   type: Number,
  //   description: 'Items per page (default: 20)',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Logs retrieved successfully',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       data: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             id: { type: 'string' },
  //             module: { type: 'string' },
  //             route: { type: 'string' },
  //             action: { type: 'string' },
  //             friendlyAction: { type: 'string' },
  //             result: { type: 'string' },
  //             userId: { type: 'string' },
  //             actionDate: { type: 'string' },
  //             parameters: {
  //               type: 'object',
  //               description: 'Request parameters (query, body, route params)',
  //               nullable: true,
  //               example: { name: 'John', role: 'admin' },
  //             },
  //             createdAt: { type: 'string' },
  //             updatedAt: { type: 'string' },
  //             deletedAt: { type: 'string', nullable: true },
  //             deletedBy: { type: 'string', nullable: true },
  //           },
  //         },
  //       },
  //       total: { type: 'number' },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 403,
  //   description: 'Insufficient permissions',
  // })
  // async findByUserId(
  //   @Param('userId') userId: string,
  //   @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
  //   @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  // ) {
  //   return this.logsService.findByUserId(userId, page, limit);
  // }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.LOGS_READ)
  @ApiOperation({
    summary: 'Get a specific log',
    description: 'Retrieve a specific log by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Log ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Log retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        module: { type: 'string' },
        route: { type: 'string' },
        action: { type: 'string' },
        friendlyAction: { type: 'string' },
        result: { type: 'string' },
        userId: { type: 'string' },
        actionDate: { type: 'string' },
        parameters: {
          type: 'object',
          description: 'Request parameters (query, body, route params)',
          nullable: true,
          example: { name: 'John', role: 'admin' },
        },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        deletedAt: { type: 'string', nullable: true },
        deletedBy: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Log not found',
  })
  async findById(@Param('id') id: string) {
    return this.logsService.findById(id);
  }
}
