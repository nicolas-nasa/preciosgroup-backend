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
    response?: Response,
  ): Promise<{ message: string; user?: any }> {
    try {
      const user = await this.usersService.findByCpf(cpf);

      if (!user) {
        // Registrar log de falha de login
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
        // Registrar log de usuário inativo
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
        // Registrar log de senha inválida
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
        username: user.email,
        sub: user.id,
        role: user.role,
      };

      const access_token = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

      // Set httpOnly cookies if response is provided
      if (response) {
        response.cookie('access_token', access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000, // 1 hour in milliseconds
        });
        response.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 2592000000, // 30 days in milliseconds
        });
      }

      this.logger.log(`User signed in: ${cpf}`);

      // Registrar log de login com sucesso
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

  async refreshToken(
    token: string,
    response?: Response,
  ): Promise<{ message: string; user?: any }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decodedToken = this.jwtService.decode(token);
      const decoded = decodedToken as { sub?: string } | null;

      if (!decoded || !decoded.sub) {
        // Registrar log de token inválido
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
        // Registrar log de usuário não encontrado ou inativo
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
        username: user.email,
        sub: user.id,
        role: user.role,
      };

      const access_token = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

      // Set httpOnly cookies if response is provided
      if (response) {
        response.cookie('access_token', access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000, // 1 hour in milliseconds
        });
        response.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 2592000000, // 30 days in milliseconds
        });
      }

      this.logger.log(`Token refreshed for user: ${user.id}`);

      // Registrar log de refresh token com sucesso
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

    // Extract userId from token if provided
    if (token) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

    // Registrar log de logout com o userId se disponível
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
