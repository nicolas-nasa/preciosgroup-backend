import { Controller, Get, Res } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './authentication/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  @Public()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check API health status',
  })
  @ApiResponse({
    status: 200,
    description: 'API is running',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string' },
        version: { type: 'string' },
      },
    },
  })
  getHealthStatus(@Res() response: Response): void {
    // const result = this.appService.healthStatus();
    response.status(200);
  }
}
