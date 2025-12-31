import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import type { Response, Request } from 'express';
import { Public } from './decorators/public.decorator';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User sign in',
    description: 'Authenticate user with CPF and password to get JWT tokens',
  })
  @ApiBody({
    description: 'Sign in credentials',
    schema: {
      type: 'object',
      properties: {
        cpf: { type: 'string', example: '12345678900' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['cpf', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'User authenticated successfully (tokens sent via httpOnly cookies)',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            fullName: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or inactive account',
  })
  async signIn(
    @Body() signInDto: { cpf: string; password: string },
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.authenticationService.signIn(
      signInDto.cpf,
      signInDto.password,
      response,
    );
    response.json(result);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get a new access token using a refresh token',
  })
  @ApiBody({
    description: 'Refresh token',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
      },
      required: ['token'],
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Token refreshed successfully (tokens sent via httpOnly cookies)',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            fullName: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid token',
  })
  async refreshToken(
    @Body() refreshTokenDto: { token: string },
    @Res() response: Response,
  ): Promise<void> {
    if (!refreshTokenDto.token) {
      throw new UnauthorizedException('Token is required');
    }
    const result = await this.authenticationService.refreshToken(
      refreshTokenDto.token,
      response,
    );
    response.status(200).json(result);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and remove authentication cookie',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async logout(
    @Res() response: Response,
    @Req() request: Request & { user?: Record<string, unknown> },
  ): Promise<void> {
    const token = (request.cookies?.access_token ||
      request.headers.authorization?.replace('Bearer ', '')) as
      | string
      | undefined;

    const result = await this.authenticationService.logout(response, token);
    response.status(200).json(result);
  }
}
