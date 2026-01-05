import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users.entity';
import { PermissionsService } from 'src/permissions/permissions.service';
import { Permission } from 'src/permissions/permissions.entity';
import { Role } from 'src/roles/roles.entity';
import { RolesService } from 'src/roles/roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, Permission, Role])],
  controllers: [UsersController],
  providers: [UsersService, PermissionsService, RolesService],
  exports: [UsersService],
})
export class UsersModule {}
