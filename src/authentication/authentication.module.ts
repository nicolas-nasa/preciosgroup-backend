import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { CombinedAuthGuard } from './guards/combined-auth.guard';
import { BypassAuthGuard } from './guards/bypass-auth.guard';
import { enviroments } from 'src/utils/enviroments.utils';
import { LogsModule } from 'src/logs/logs.module';

console.log('SECRET_KEY:', enviroments.SECRET_KEY);

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
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
    RolesGuard,
    PermissionsGuard,
    CombinedAuthGuard,
    BypassAuthGuard,
  ],
  controllers: [AuthenticationController],
  exports: [RolesGuard, PermissionsGuard, CombinedAuthGuard, BypassAuthGuard],
})
export class AuthenticationModule {}
