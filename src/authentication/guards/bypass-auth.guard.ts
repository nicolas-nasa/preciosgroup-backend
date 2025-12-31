import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { enviroments } from 'src/utils/enviroments.utils';

@Injectable()
export class BypassAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Get the bypass header (default name: X-Bypass-Auth)
    const bypassHeader = request.headers['x-bypass-auth'] as string | undefined;

    // Get the secret value from environment variables
    const secretBypass = enviroments.SECRET_BYPASS;

    // If SECRET_BYPASS is configured and the header matches, allow access
    if (secretBypass && bypassHeader === secretBypass) {
      // Create a mock user object for bypass access with a fixed UUID
      request.user = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'bypass',
        role: 'admin',
        permissions: [],
      };
      return true;
    }

    // If no bypass, return false to pass to next guard
    return false;
  }
}
