import { Controller, Get, HttpCode, HttpStatus, Response } from '@nestjs/common';
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
  getHealthStatus(@Response() response: any): void {
    const result = this.appService.healthStatus();
    response.status(200).send(result);
  }
}
