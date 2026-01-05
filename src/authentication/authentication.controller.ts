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
      'User authenticated successfully (tokens sent via httpOnly cookies; access_token and refresh_token returned only in non-production environments)',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        access_token: {
          type: 'string',
          description: 'Only returned in DEV and TST modes',
        },
        refresh_token: {
          type: 'string',
          description: 'Only returned in DEV and TST modes',
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
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const result = await this.authenticationService.signIn(
      signInDto.cpf,
      signInDto.password,
    );

    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400000,
    });
    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2592000000,
    });
    response.status(200).send({
      message: result.message,
      access_token: result.access_token,
    });
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get a new access token using a refresh token from cookies',
  })
  @ApiResponse({
    status: 200,
    description:
      'Token refreshed successfully (tokens sent via httpOnly cookies; access_token and refresh_token returned only in non-production environments)',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        access_token: {
          type: 'string',
          description: 'Only returned in DEV and TST modes',
        },
        refresh_token: {
          type: 'string',
          description: 'Only returned in DEV and TST modes',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid token',
  })
  async refreshToken(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request & { cookies?: Record<string, string> },
  ): Promise<void> {
    const token = request.cookies?.refresh_token;

    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const result = await this.authenticationService.refreshToken(token);
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 2592000000,
    });
    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 2592000000,
    });

    response.status(200).send({
      message: result.message,
      access_token: result.access_token,
    });
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and remove authentication cookies',
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
    @Req() request: Request & { cookies?: Record<string, string> },
  ): Promise<void> {
    const token = request.cookies?.access_token;

    const result = await this.authenticationService.logout(response, token);
    response.status(200).json(result);
  }
}
