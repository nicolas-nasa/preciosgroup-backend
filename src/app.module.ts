import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ProcessesModule } from './processes/processes.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configEnviroments, enviroments } from './utils/enviroments.utils';
import { ConfigModule } from '@nestjs/config';
import { LogsModule } from './logs/logs.module';
import { OrdersModule } from './orders/orders.module';
import { FilesModule } from './files/files.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { SeedModule } from './seed/seed.module';
import { TypeOfProcessesModule } from './type-of-processes/type-of-processes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthenticationModule,
    FilesModule,
    LogsModule,
    OrdersModule,
    CustomersModule,
    ProcessesModule,
    PermissionsModule,
    RolesModule,
    TypeOfProcessesModule,
    SeedModule,
    TypeOrmModule.forRoot({
      type: enviroments.DATABASE_TYPE,
      host: enviroments.DATABASE_HOST,
      port: enviroments.DATABASE_PORT,
      username: enviroments.DATABASE_USER,
      password: enviroments.DATABASE_PASSWORD,
      database: enviroments.DATABASE_DATABASE,
      autoLoadEntities: true,
      synchronize: configEnviroments.isProduction() ? false : true,
      migrations: [`${__dirname}/migrations/*{.ts,.js}`],
      migrationsTableName: 'migrations',
      ...(configEnviroments.isProduction() && {
        ssl: { rejectUnauthorized: false },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
