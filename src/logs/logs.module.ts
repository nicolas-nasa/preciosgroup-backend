import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { LogEntity } from './logs.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Permission } from 'src/permissions/permissions.entity';
import { RolesService } from 'src/roles/roles.service';
import { Role } from 'src/roles/roles.entity';
import { PermissionsService } from 'src/permissions/permissions.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([LogEntity, Permission, Role]),
    UsersModule,
  ],
  controllers: [LogsController],
  providers: [LogsService, RolesService, PermissionsService],
  exports: [LogsService],
})
export class LogsModule {}
