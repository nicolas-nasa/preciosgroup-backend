import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { Permission as PermissionEnum } from '../authentication/enums/permission.enum';
import { Role as RoleEnum } from '../authentication/enums/role.enum';
import { CreatePermissionDto } from '../permissions/dto/create-permission.dto';
import { CreateRoleDto } from '../roles/dto/create-role.dto';
import { Permission } from '../permissions/permissions.entity';
import { Role } from '../roles/roles.entity';
import { UserEntity } from '../users/users.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async seedDatabase(): Promise<void> {
    this.logger.log('Starting database seed...');

    const permissions = await this.seedPermissions();
    const role = await this.seedRoles(permissions);
    await this.seedDefaultUserIfNeeded(role);

    this.logger.log(`✅ Database seed completed successfully!`);
  }

  private async seedPermissions(): Promise<Permission[]> {
    this.logger.log('Seeding permissions...');

    const permissionsData: CreatePermissionDto[] = [
      {
        name: 'Read Permissions',
        description: 'Permission to read permission information',
        key: PermissionEnum.PERMISSIONS_READ,
      },

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

      {
        name: 'Read Logs',
        description: 'Permission to read system logs',
        key: PermissionEnum.LOGS_READ,
      },
      {
        name: 'Create Type of Processes',
        description: 'Permission to create new types of processes',
        key: PermissionEnum.TYPE_OF_PROCESSES_CREATE,
      },
      {
        name: 'Read Type of Processes',
        description: 'Permission to read type of process information',
        key: PermissionEnum.TYPE_OF_PROCESSES_READ,
      },
      {
        name: 'Update Type of Processes',
        description: 'Permission to update type of process information',
        key: PermissionEnum.TYPE_OF_PROCESSES_UPDATE,
      },
      {
        name: 'Delete Type of Processes',
        description: 'Permission to delete types of processes',
        key: PermissionEnum.TYPE_OF_PROCESSES_DELETE,
      },

      {
        name: 'Create Roles',
        description: 'Permission to create new roles',
        key: PermissionEnum.ROLES_CREATE,
      },
      {
        name: 'Read Roles',
        description: 'Permission to read role information',
        key: PermissionEnum.ROLES_READ,
      },
      {
        name: 'Update Roles',
        description: 'Permission to update role information',
        key: PermissionEnum.ROLES_UPDATE,
      },
      {
        name: 'Delete Roles',
        description: 'Permission to delete roles',
        key: PermissionEnum.ROLES_DELETE,
      },
    ];

    const result =
      await this.permissionsService.seedPermissions(permissionsData);
    this.logger.log(`✅ ${result.length} permissions seeded`);

    return result;
  }

  private async seedRoles(permissions: Permission[]): Promise<Role> {
    this.logger.log('Seeding roles...');

    const rolesData: CreateRoleDto = {
      name: 'Admin',
      description: 'Administrator with full access',
      key: RoleEnum.ADMIN,
      permissionIds: permissions.map((p) => p.id),
      isActive: true,
    };

    const result = await this.rolesService.seedRoles([rolesData]);

    this.logger.log(`✅ ${result.length} role seeded`);

    return result[0];
  }

  private async seedDefaultUserIfNeeded(adminRole: Role): Promise<void> {
    this.logger.log('Checking if default user needs to be created...');

    try {
      const existingUsers = await this.usersService.findAll(1, 1);

      if (existingUsers.total > 0) {
        this.logger.log(
          '✅ Users already exist in the database. Skipping default user creation.',
        );
        return;
      }

      this.logger.log('No users found. Creating default user...');

      const defaultUser: Partial<UserEntity> = {
        fullName: this.configService.get('DEFAULT_USER_FULL_NAME'),
        cpf: this.configService.get('DEFAULT_USER_CPF'),
        email: this.configService.get('DEFAULT_USER_EMAIL'),
        password: this.configService.get('DEFAULT_USER_PASSWORD'),
        contact: this.configService.get('DEFAULT_USER_CONTACT'),
        role: adminRole,
        isActive: true,
      };

      const user = await this.usersService.create(defaultUser);

      this.logger.log(`✅ Default user created with email: ${user.email}`);
    } catch (error: unknown) {
      this.logger.error(
        `Error seeding default user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
