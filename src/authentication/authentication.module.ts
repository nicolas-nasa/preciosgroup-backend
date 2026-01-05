import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsGuard } from './guards/user-permissions.guard';
import { enviroments } from 'src/utils/enviroments.utils';
import { LogsModule } from 'src/logs/logs.module';
import { RolesService } from 'src/roles/roles.service';
import { Role } from 'src/roles/roles.entity';
import { PermissionsService } from 'src/permissions/permissions.service';
import { Permission } from 'src/permissions/permissions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, UserEntity, Permission]),
    JwtModule.register({
      global: true,
      secret: enviroments.SECRET_KEY,
      signOptions: { expiresIn: '24h' },
    }),
    LogsModule,
  ],
  providers: [
    AuthenticationService,
    UsersService,
    PermissionsGuard,
    RolesService,
    PermissionsService,
  ],
  controllers: [AuthenticationController],
  exports: [PermissionsGuard, UsersService, RolesService, PermissionsService],
})
export class AuthenticationModule {}
