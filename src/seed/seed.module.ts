import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [PermissionsModule, RolesModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
