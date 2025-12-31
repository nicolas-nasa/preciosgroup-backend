import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { CombinedAuthGuard } from './authentication/guards/combined-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const seedService = app.get(SeedService);
  await seedService.seedDatabase();

  app.enableCors({
    origin: 'http://localhost:3000',
    withCredentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Bypass-Auth'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(cookieParser());

  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new CombinedAuthGuard(jwtService, reflector));

  const config = new DocumentBuilder()
    .setTitle('Precios Group API')
    .setDescription(
      'The Precios Group API with JWT and SECRET_BYPASS authentication support. **For bypass auth in Swagger: Click "Authorize" button, select "bypass-auth", and enter the bypass token value.**',
    )
    .setVersion('1.0')
    .addServer('http://localhost:3001', 'Development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT Bearer token for authentication. Format: Bearer <your-jwt-token>',
      },
      'jwt-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Bypass-Auth',
        in: 'header',
        description:
          'Bypass authentication token from SECRET_BYPASS env variable (value: TESTE)',
      },
      'bypass-auth',
    )
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management (requires authentication)')
    .addTag('Orders', 'Order management (requires authentication)')
    .addTag('Processes', 'Process management (requires authentication)')
    .addTag('Customers', 'Customer management (requires authentication)')
    .addTag('Files', 'File management (requires authentication)')
    .addTag('Logs', 'System logs (requires authentication)')
    .addTag('Permissions', 'Permission management (admin only)')
    .addTag('Roles', 'Role management (admin only)')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
