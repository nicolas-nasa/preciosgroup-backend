import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../enums/permission.enum';
import { UsersService } from 'src/users/users.service';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  private extractTokenFromCookies(request: any): string | undefined {
    if (request.cookies && request.cookies.access_token) {
      return request.cookies.access_token;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return undefined;
    }

    return parts[1];
  }

  canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return Promise.resolve(true);
    }

    return this.validatePermissions(context, requiredPermissions);
  }

  private async validatePermissions(
    context: ExecutionContext,
    requiredPermissions: Permission[],
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let user = request.user;

    if (!user) {
      const token = this.extractTokenFromCookies(request);

      if (!token) {
        throw new UnauthorizedException('No authorization token found');
      }

      try {
        const { sub }: { sub: string } = this.jwtService.verify(token);
        const userId = sub;

        user = await this.usersService.findById(userId);
        this.logger.log(
          `User fetched from token: ${user.id} (${user.fullName})`,
        );
        request.user = user;
      } catch (error) {
        this.logger.error(
          `Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        throw new UnauthorizedException('Invalid token');
      }
    }

    if (!user) {
      throw new ForbiddenException('User information not found');
    }
    const userPermissions: string[] = [];
    if (user.roleId) {
      const role = await this.rolesService.findOneWithPermissions(user.roleId);

      if (role && role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach((permission: any) => {
          if (permission.key) {
            userPermissions.push(permission.key);
          }
        });
      }
    }

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have the required permissions for this action',
      );
    }

    return true;
  }
}
