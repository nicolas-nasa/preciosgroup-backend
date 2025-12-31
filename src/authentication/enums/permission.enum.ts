import { Role } from './role.enum';

export enum Permission {
  // Users
  USERS_CREATE = 'users:create',
  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  // Customers
  CUSTOMERS_CREATE = 'customers:create',
  CUSTOMERS_READ = 'customers:read',
  CUSTOMERS_UPDATE = 'customers:update',
  CUSTOMERS_DELETE = 'customers:delete',

  // Orders
  ORDERS_CREATE = 'orders:create',
  ORDERS_READ = 'orders:read',
  ORDERS_UPDATE = 'orders:update',
  ORDERS_DELETE = 'orders:delete',

  // Processes
  PROCESSES_CREATE = 'processes:create',
  PROCESSES_READ = 'processes:read',
  PROCESSES_UPDATE = 'processes:update',
  PROCESSES_DELETE = 'processes:delete',

  // Files
  FILES_CREATE = 'files:create',
  FILES_READ = 'files:read',
  FILES_UPDATE = 'files:update',
  FILES_DELETE = 'files:delete',

  // Logs
  LOGS_READ = 'logs:read',
  LOGS_DELETE = 'logs:delete',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  [Role.MANAGER]: [
    Permission.USERS_READ,
    Permission.USERS_UPDATE,
    Permission.CUSTOMERS_CREATE,
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_UPDATE,
    Permission.ORDERS_CREATE,
    Permission.ORDERS_READ,
    Permission.ORDERS_UPDATE,
    Permission.PROCESSES_CREATE,
    Permission.PROCESSES_READ,
    Permission.PROCESSES_UPDATE,
    Permission.FILES_CREATE,
    Permission.FILES_READ,
    Permission.FILES_UPDATE,
    Permission.LOGS_READ,
  ],
  [Role.OPERATOR]: [
    Permission.CUSTOMERS_READ,
    Permission.ORDERS_CREATE,
    Permission.ORDERS_READ,
    Permission.ORDERS_UPDATE,
    Permission.PROCESSES_CREATE,
    Permission.PROCESSES_READ,
    Permission.PROCESSES_UPDATE,
    Permission.FILES_CREATE,
    Permission.FILES_READ,
    Permission.FILES_UPDATE,
  ],
  [Role.CUSTOMER]: [
    Permission.CUSTOMERS_READ,
    Permission.ORDERS_READ,
    Permission.ORDERS_CREATE,
    Permission.PROCESSES_READ,
    Permission.FILES_READ,
  ],
  [Role.VIEWER]: [
    Permission.CUSTOMERS_READ,
    Permission.ORDERS_READ,
    Permission.PROCESSES_READ,
    Permission.FILES_READ,
    Permission.LOGS_READ,
  ],
};
