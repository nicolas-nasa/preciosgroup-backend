import { Injectable, Logger } from '@nestjs/common';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';
import { Permission as PermissionEnum } from '../authentication/enums/permission.enum';
import { Role as RoleEnum } from '../authentication/enums/role.enum';
import { CreatePermissionDto } from '../permissions/dto/create-permission.dto';
import { CreateRoleDto } from '../roles/dto/create-role.dto';
import { Permission } from '../permissions/permissions.entity';
import { Role } from '../roles/roles.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService,
  ) {}

  async seedDatabase(): Promise<void> {
    this.logger.log('Starting database seed...');

    const permissions = await this.seedPermissions();
    await this.seedRoles(permissions);

    this.logger.log(`✅ Database seed completed successfully!`);
  }

  private async seedPermissions(): Promise<Permission[]> {
    this.logger.log('Seeding permissions...');

    const permissionsData: CreatePermissionDto[] = [
      // Users
      {
        name: 'Create Users',
        description: 'Permission to create new users',
        key: PermissionEnum.USERS_CREATE,
      },
      {
        name: 'Read Users',
        description: 'Permission to read user information',
        key: PermissionEnum.USERS_READ,
      },
      {
        name: 'Update Users',
        description: 'Permission to update user information',
        key: PermissionEnum.USERS_UPDATE,
      },
      {
        name: 'Delete Users',
        description: 'Permission to delete users',
        key: PermissionEnum.USERS_DELETE,
      },

      // Customers
      {
        name: 'Create Customers',
        description: 'Permission to create new customers',
        key: PermissionEnum.CUSTOMERS_CREATE,
      },
      {
        name: 'Read Customers',
        description: 'Permission to read customer information',
        key: PermissionEnum.CUSTOMERS_READ,
      },
      {
        name: 'Update Customers',
        description: 'Permission to update customer information',
        key: PermissionEnum.CUSTOMERS_UPDATE,
      },
      {
        name: 'Delete Customers',
        description: 'Permission to delete customers',
        key: PermissionEnum.CUSTOMERS_DELETE,
      },

      // Orders
      {
        name: 'Create Orders',
        description: 'Permission to create new orders',
        key: PermissionEnum.ORDERS_CREATE,
      },
      {
        name: 'Read Orders',
        description: 'Permission to read order information',
        key: PermissionEnum.ORDERS_READ,
      },
      {
        name: 'Update Orders',
        description: 'Permission to update order information',
        key: PermissionEnum.ORDERS_UPDATE,
      },
      {
        name: 'Delete Orders',
        description: 'Permission to delete orders',
        key: PermissionEnum.ORDERS_DELETE,
      },

      // Processes
      {
        name: 'Create Processes',
        description: 'Permission to create new processes',
        key: PermissionEnum.PROCESSES_CREATE,
      },
      {
        name: 'Read Processes',
        description: 'Permission to read process information',
        key: PermissionEnum.PROCESSES_READ,
      },
      {
        name: 'Update Processes',
        description: 'Permission to update process information',
        key: PermissionEnum.PROCESSES_UPDATE,
      },
      {
        name: 'Delete Processes',
        description: 'Permission to delete processes',
        key: PermissionEnum.PROCESSES_DELETE,
      },

      // Files
      {
        name: 'Create Files',
        description: 'Permission to create/upload files',
        key: PermissionEnum.FILES_CREATE,
      },
      {
        name: 'Read Files',
        description: 'Permission to read/download files',
        key: PermissionEnum.FILES_READ,
      },
      {
        name: 'Update Files',
        description: 'Permission to update file information',
        key: PermissionEnum.FILES_UPDATE,
      },
      {
        name: 'Delete Files',
        description: 'Permission to delete files',
        key: PermissionEnum.FILES_DELETE,
      },

      // Logs
      {
        name: 'Read Logs',
        description: 'Permission to read system logs',
        key: PermissionEnum.LOGS_READ,
      },
      {
        name: 'Delete Logs',
        description: 'Permission to delete logs',
        key: PermissionEnum.LOGS_DELETE,
      },
    ];

    const result =
      await this.permissionsService.seedPermissions(permissionsData);
    this.logger.log(`✅ ${result.length} permissions seeded`);

    return result;
  }

  private async seedRoles(permissions: Permission[]): Promise<Role[]> {
    this.logger.log('Seeding roles...');

    const permissionMap = new Map(permissions.map((p) => [p.key, p.id]));

    const rolesData: CreateRoleDto[] = [
      {
        name: 'Admin',
        description: 'Administrator with full access',
        key: RoleEnum.ADMIN,
        permissionIds: permissions.map((p) => p.id),
        isActive: true,
      },
      {
        name: 'Manager',
        description: 'Manager with limited access',
        key: RoleEnum.MANAGER,
        permissionIds: [
          permissionMap.get(PermissionEnum.USERS_READ) || '',
          permissionMap.get(PermissionEnum.USERS_UPDATE) || '',
          permissionMap.get(PermissionEnum.CUSTOMERS_CREATE) || '',
          permissionMap.get(PermissionEnum.CUSTOMERS_READ) || '',
          permissionMap.get(PermissionEnum.CUSTOMERS_UPDATE) || '',
          permissionMap.get(PermissionEnum.ORDERS_CREATE) || '',
          permissionMap.get(PermissionEnum.ORDERS_READ) || '',
          permissionMap.get(PermissionEnum.ORDERS_UPDATE) || '',
          permissionMap.get(PermissionEnum.PROCESSES_CREATE) || '',
          permissionMap.get(PermissionEnum.PROCESSES_READ) || '',
          permissionMap.get(PermissionEnum.PROCESSES_UPDATE) || '',
          permissionMap.get(PermissionEnum.FILES_READ) || '',
          permissionMap.get(PermissionEnum.LOGS_READ) || '',
        ].filter((id): id is string => Boolean(id)),
        isActive: true,
      },
      {
        name: 'Operator',
        description: 'Operator with read and create access',
        key: RoleEnum.OPERATOR,
        permissionIds: [
          permissionMap.get(PermissionEnum.CUSTOMERS_READ) || '',
          permissionMap.get(PermissionEnum.CUSTOMERS_CREATE) || '',
          permissionMap.get(PermissionEnum.ORDERS_READ) || '',
          permissionMap.get(PermissionEnum.ORDERS_CREATE) || '',
          permissionMap.get(PermissionEnum.PROCESSES_READ) || '',
          permissionMap.get(PermissionEnum.PROCESSES_CREATE) || '',
          permissionMap.get(PermissionEnum.FILES_READ) || '',
          permissionMap.get(PermissionEnum.FILES_CREATE) || '',
        ].filter((id): id is string => Boolean(id)),
        isActive: true,
      },
      {
        name: 'Customer',
        description: 'Customer with read-only access',
        key: RoleEnum.CUSTOMER,
        permissionIds: [
          permissionMap.get(PermissionEnum.CUSTOMERS_READ) || '',
          permissionMap.get(PermissionEnum.ORDERS_READ) || '',
          permissionMap.get(PermissionEnum.FILES_READ) || '',
        ].filter((id): id is string => Boolean(id)),
        isActive: true,
      },
      {
        name: 'Viewer',
        description: 'Viewer with minimal read-only access',
        key: RoleEnum.VIEWER,
        permissionIds: [
          permissionMap.get(PermissionEnum.CUSTOMERS_READ) || '',
          permissionMap.get(PermissionEnum.ORDERS_READ) || '',
        ].filter((id): id is string => Boolean(id)),
        isActive: true,
      },
    ];

    const result = await this.rolesService.seedRoles(rolesData);

    this.logger.log(`✅ ${result.length} roles seeded`);

    return result;
  }
}
