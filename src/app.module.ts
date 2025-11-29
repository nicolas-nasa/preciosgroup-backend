import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ServicesModule } from './services/services.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configEnviroments, enviroments } from './utils/enviroments.utils';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    CustomersModule,
    ServicesModule,
    AuthenticationModule,
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
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
