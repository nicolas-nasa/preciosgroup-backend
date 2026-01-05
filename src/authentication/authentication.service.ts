import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LogsService } from 'src/logs/logs.service';
import { FriendlyActionEnum, ResultEnum } from 'src/logs/enums/action.enum';
import type { Response } from 'express';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logsService: LogsService,
  ) {}

  async signIn(
    cpf: string,
    password: string,
  ): Promise<{
    message: string;
    access_token: string;
    refresh_token: string;
    user: any;
  }> {
    try {
      const user = await this.usersService.findByCpf(cpf);

      if (!user) {
        await this.logsService.create({
          module: 'authentication',
          route: '/authentication/sign-in',
          action: 'POST',
          friendlyAction: FriendlyActionEnum.LOGIN,
          result: ResultEnum.INVALID_CREDENTIALS,
          userId: undefined,
          actionDate: new Date(),
        });

        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isActive) {
        await this.logsService.create({
          module: 'authentication',
          route: '/authentication/sign-in',
          action: 'POST',
          friendlyAction: FriendlyActionEnum.LOGIN,
          result: ResultEnum.USER_INACTIVE,
          userId: user.id,
          actionDate: new Date(),
        });

        throw new UnauthorizedException('User account is inactive');
      }

      const isPasswordValid = this.usersService.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        await this.logsService.create({
          module: 'authentication',
          route: '/authentication/sign-in',
          action: 'POST',
          friendlyAction: FriendlyActionEnum.LOGIN,
          result: ResultEnum.INVALID_CREDENTIALS,
          userId: user.id,
          actionDate: new Date(),
        });

        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        sub: user.id,
      };

      const access_token = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

      this.logger.log(`User signed in: ${cpf}`);

      await this.logsService.create({
        module: 'authentication',
        route: '/authentication/sign-in',
        action: 'POST',
        friendlyAction: FriendlyActionEnum.LOGIN,
        result: ResultEnum.SUCCESS,
        userId: user.id,
        actionDate: new Date(),
      });

      return {
        message: 'Signed in successfully',
        access_token,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error instanceof Error
            ? error.message
            : 'Unknown error'
          : 'Unknown error';
      this.logger.error(`Sign in failed for ${cpf}: ${message}`);
      throw error;
    }
  }

  async refreshToken(token: string): Promise<{
    message: string;
    access_token: string;
    refresh_token: string;
    user: any;
  }> {
    try {
      const decodedToken = this.jwtService.decode(token);
      const decoded = decodedToken as { sub?: string } | null;

      if (!decoded || !decoded.sub) {
        await this.logsService.create({
          module: 'authentication',
          route: '/authentication/refresh-token',
          action: 'POST',
          friendlyAction: FriendlyActionEnum.REFRESH_TOKEN,
          result: ResultEnum.INVALID_TOKEN,
          userId: undefined,
          actionDate: new Date(),
        });

        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.usersService.findById(decoded.sub);

      if (!user || !user.isActive) {
        const result = !user ? ResultEnum.NOT_FOUND : ResultEnum.USER_INACTIVE;

        await this.logsService.create({
          module: 'authentication',
          route: '/authentication/refresh-token',
          action: 'POST',
          friendlyAction: FriendlyActionEnum.REFRESH_TOKEN,
          result,
          userId: decoded.sub,
          actionDate: new Date(),
        });

        throw new UnauthorizedException('User not found or inactive');
      }

      const payload = {
        sub: user.id,
        r: user.role,
      };

      const access_token = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

      this.logger.log(`Token refreshed for user: ${user.id}`);

      await this.logsService.create({
        module: 'authentication',
        route: '/authentication/refresh-token',
        action: 'POST',
        friendlyAction: FriendlyActionEnum.REFRESH_TOKEN,
        result: ResultEnum.SUCCESS,
        userId: user.id,
        actionDate: new Date(),
      });

      return {
        message: 'Token refreshed successfully',
        access_token,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error instanceof Error
            ? error.message
            : 'Unknown error'
          : 'Unknown error';
      this.logger.error(`Token refresh failed: ${message}`);
      throw error;
    }
  }

  async logout(
    response: Response,
    token?: string,
  ): Promise<{ message: string }> {
    let userId: string | undefined;

    if (token) {
      try {
        const decodedToken = this.jwtService.decode(token);
        const decoded = decodedToken as { sub?: string } | null;
        userId = decoded?.sub;
      } catch {
        this.logger.warn('Failed to decode token during logout');
      }
    }

    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    this.logger.log(`User logged out${userId ? ` (${userId})` : ''}`);

    if (userId) {
      await this.logsService.create({
        module: 'authentication',
        route: '/authentication/logout',
        action: 'POST',
        friendlyAction: FriendlyActionEnum.LOGOUT,
        result: ResultEnum.SUCCESS,
        userId,
        actionDate: new Date(),
      });
    }

    return { message: 'Logged out successfully' };
  }
}
