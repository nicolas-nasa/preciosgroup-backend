import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1709337600000 implements MigrationInterface {
  name = 'InitialSchema1709337600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. permissions (no FK dependencies)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(50) NOT NULL,
        "description" varchar(255) NOT NULL,
        "key" varchar(50) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
        CONSTRAINT "UQ_permissions_key" UNIQUE ("key")
      )
    `);

    // 2. roles (no FK dependencies)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(50) NOT NULL,
        "description" varchar(255) NOT NULL,
        "key" varchar(50) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_roles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "UQ_roles_key" UNIQUE ("key")
      )
    `);

    // 3. role_permissions (junction table)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "role_permissions" (
        "roleId" uuid NOT NULL,
        "permissionId" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId"),
        CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_role_permissions_roleId" ON "role_permissions" ("roleId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_role_permissions_permissionId" ON "role_permissions" ("permissionId")`);

    // 4. users (FK to roles)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "full_name" varchar NOT NULL,
        "cpf" varchar NOT NULL,
        "email" varchar,
        "contact" varchar,
        "roleId" uuid,
        "password" varchar NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMPTZ,
        "deleted_by" varchar,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_by" varchar,
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_cpf" UNIQUE ("cpf"),
        CONSTRAINT "FK_users_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    // 5. customers (no FK dependencies)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "company_name" varchar NOT NULL,
        "cnpj" varchar NOT NULL,
        "representant_name" varchar NOT NULL,
        "representant_contact" varchar NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMPTZ,
        "deleted_by" varchar,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_by" varchar,
        CONSTRAINT "PK_customers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_customers_cnpj" UNIQUE ("cnpj")
      )
    `);

    // 6. type_of_processes (no FK dependencies)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "type_of_processes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "agrouped" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMPTZ,
        "deleted_by" varchar,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_by" varchar,
        CONSTRAINT "PK_type_of_processes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_type_of_processes_name" UNIQUE ("name")
      )
    `);

    // 7. orders (FK to customers)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "status" varchar NOT NULL,
        "customerId" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMPTZ,
        "deleted_by" varchar,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_by" varchar,
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_customer" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // 8. processes (FK to orders, type_of_processes)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "processes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "amout" int NOT NULL,
        "type" varchar NOT NULL,
        "status" varchar NOT NULL,
        "description" text,
        "orderId" uuid,
        "typeOfProcessId" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMPTZ,
        "deleted_by" varchar,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_by" varchar,
        CONSTRAINT "PK_processes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_processes_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_processes_typeOfProcess" FOREIGN KEY ("typeOfProcessId") REFERENCES "type_of_processes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // 9. files (FK to processes)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "files" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "amout" int NOT NULL,
        "type" varchar NOT NULL,
        "status" varchar NOT NULL,
        "processId" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMPTZ,
        "deleted_by" varchar,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_by" varchar,
        CONSTRAINT "PK_files" PRIMARY KEY ("id"),
        CONSTRAINT "FK_files_process" FOREIGN KEY ("processId") REFERENCES "processes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // 10. logs (FK to users)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "module" varchar,
        "route" varchar,
        "action" varchar NOT NULL,
        "friendly_action" varchar,
        "result" varchar,
        "user_id" uuid,
        "action_date" TIMESTAMPTZ NOT NULL,
        "parameters" jsonb,
        "error_data" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMPTZ,
        "deleted_by" varchar,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_by" varchar,
        CONSTRAINT "PK_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_logs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "files" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "processes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "type_of_processes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions" CASCADE`);
  }
}
