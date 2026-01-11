import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SeedService } from './seed/seed.service';
import { SanitizeResponseInterceptor } from './common/interceptors/sanitize-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const seedService = app.get(SeedService);
  await seedService.seedDatabase();

  app.use(cookieParser());

  app.enableCors({
    origin: '*',
  });

  app.useGlobalInterceptors(new SanitizeResponseInterceptor());

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

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
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'JWT token stored in httpOnly cookie after login',
    })
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
    .addTag(
      'Type-of-Processes',
      'Type of processes management (requires authentication)',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    swaggerOptions: {
      layout: 'BaseLayout',
      swaggerUI: {
        defaultModelsExpandDepth: 1,
      },
    },
    customCss: `
      .topbar {
        display: flex !important;
        align-items: center !important;
        padding: 10px 20px !important;
      }
      .topbar-wrapper {
        display: flex !important;
        align-items: center !important;
        width: 100% !important;
      }
      .topbar h1 {
        margin: 0 !important;
        flex: 1 !important;
      }
      .auth-wrapper {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
      }
      .authorize {
        margin-left: auto !important;
      }
    `,
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
