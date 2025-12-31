import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Check for SECRET_BYPASS header first
    const bypassHeader = request.headers['x-bypass-auth'] as string | undefined;
    const secretBypass = process.env.SECRET_BYPASS;

    // If bypass is configured and header matches, skip JWT validation
    if (secretBypass && bypassHeader === secretBypass) {
      request.user = {
        id: 'bypass-user',
        username: 'bypass',
        role: 'admin',
        permissions: [],
      };
      return true;
    }

    // Otherwise, proceed with JWT validation
    let token: string | undefined;

    // Try to get token from Authorization header first
    const authHeader = request.headers.authorization as string | undefined;
    if (authHeader) {
      token = authHeader.split(' ')[1];
    }

    // If no token in header, check for access_token cookie
    if (!token && request.cookies && request.cookies.access_token) {
      token = request.cookies.access_token;
    }

    if (!token) {
      throw new UnauthorizedException('No authorization header or cookie');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
