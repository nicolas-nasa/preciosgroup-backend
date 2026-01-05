# Precios Group Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

**A complete, production-ready backend for managing prices, customers, orders, and processes with enterprise-grade authentication, authorization, and logging.**

## Overview

This is a comprehensive **NestJS 11.0** backend application built with **TypeORM** and **JWT authentication**. It implements complete **Permission-Based Access Control (PBAC)** with:

- ✅ 1 Role (ADMIN)
- ✅ 26 Granular Permissions
- ✅ 2-Layer Authorization (JWT → UserPermissionsGuard)
- ✅ 42 REST Endpoints across 6 Resource Controllers
- ✅ Complete Swagger/OpenAPI Documentation
- ✅ Automatic Logging via Interceptors
- ✅ TypeScript Compilation with 0 Errors

## Quick Links

- **🚀 [QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- **🔐 [AUTHENTICATION_AND_PERMISSIONS.md](./AUTHENTICATION_AND_PERMISSIONS.md)** - Complete auth/RBAC reference
- **📋 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical architecture & endpoints
- **📝 [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)** - curl, JavaScript, Postman examples

## Features

### Authentication & Authorization
- **JWT-based authentication** with access token (1h) + refresh token (7d)
- **Two-layer authorization guards**: JwtAuthGuard → UserPermissionsGuard
- **Permission-Based Access Control** with granular permissions per action
- **26 Granular Permissions** across users, customers, orders, processes, files, logs, and type-of-processes
- **Swagger-integrated** with @ApiBearerAuth() on all protected endpoints

### Resource Management
- **Users Module**: Create, read, update, delete users with role assignment
- **Customers Module**: Manage customer data with CNPJ search and soft delete
- **Orders Module**: Track orders with status filtering and customer linking
- **Processes Module**: Manage processes linked to orders
- **Files Module**: Store and manage files linked to processes
- **Logs Module**: Automatic logging of all create/update actions

### Code Quality
- **TypeScript** strict mode enabled
- **Jest Unit Tests**: 124 tests covering all services and controllers
- **Guard Mocking**: Tests properly isolate business logic from authentication
- **ESLint Configuration**: Modern linting with recommended best practices
- **Proper Error Handling**: Comprehensive exception handling and validation

### Documentation
- **Swagger/OpenAPI**: Auto-generated API documentation at `/api/docs`
- **Schema Examples**: All endpoints include request/response schemas
- **Markdown Guides**: Complete setup, usage, and troubleshooting guides

## Installation

### Prerequisites
- **Node.js** 18.x or higher
- **pnpm** 8.x or higher
- **MySQL/PostgreSQL** database

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Configure database connection in .env
# DATABASE_URL=mysql://user:password@localhost:3306/preciosgroup
```

## Running the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run start:prod

# Build TypeScript
pnpm run build
```

## Testing

```bash
# Run all unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage report
pnpm run test:cov

# Run e2e tests
pnpm run test:e2e
```

**Test Results:**
```
✓ Test Suites: 15 passed, 15 total
✓ Tests: 124 passed, 124 total
✓ Execution Time: ~6.7 seconds
```

## API Documentation

Once the application is running, access the Swagger UI at:
```
http://localhost:3000/api/docs
```

### Endpoints Overview

| Resource | Create | Read | Update | Delete | Count |
|----------|--------|------|--------|--------|-------|
| Users | 1 | 3 | 2 | 2 | 8 |
| Customers | 1 | 4 | 1 | 2 | 8 |
| Orders | 1 | 4 | 1 | 2 | 8 |
| Processes | 1 | 4 | 1 | 2 | 8 |
| Files | 1 | 4 | 1 | 2 | 8 |
| Authentication | 2 | - | - | - | 2 |
| **TOTAL** | **7** | **19** | **6** | **10** | **42** |

## RBAC System

### Role
1. **ADMIN** - Full system access with all permissions

### Example: Creating a User

```bash
# Sign in to get JWT token
curl -X POST http://localhost:3000/authentication/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Use token in subsequent requests
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure123",
    "name": "John Doe",
    "role": "MANAGER"
  }'
```

See [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for more examples with curl, JavaScript, and Postman.

## Project Structure

```
src/
├── authentication/          # Centralized auth/RBAC
│   ├── enums/              # Role & Permission definitions
│   ├── decorators/         # @Roles() & @Permissions()
│   ├── guards/             # JWT, Roles, Permissions validation
│   ├── authentication.controller.ts
│   ├── authentication.service.ts
│   └── authentication.module.ts
├── users/                   # User management module
├── customers/               # Customer management module
├── orders/                  # Order management module
├── processes/               # Process management module
├── files/                   # File management module
├── logs/                    # Automatic action logging
├── common/                  # Shared interceptors & utilities
└── main.ts                  # Application bootstrap
```

## Architecture

### Three-Layer Authorization Guard Stack

1. **JwtAuthGuard**: Validates JWT token signature and extracts user
2. **UserPermissionsGuard**: Checks if user has required permissions

### Example Endpoint Protection

```typescript
@UseGuards(UserPermissionsGuard)
@Post()
@Permissions(USERS_CREATE)
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

### Automatic Logging

All create/update operations are automatically logged via `LoggingInterceptor`:
- **Action**: CREATE, UPDATE
- **Entity**: User, Customer, Order, Process, File
- **User ID**: Who performed the action
- **Timestamp**: When the action occurred
- **Soft Delete Support**: Tracked separately

## Key Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | 11.0.1 | Backend framework |
| TypeScript | 5.x | Type safety |
| TypeORM | 0.3.x | Database ORM |
| JWT | 11.0.2 | Token authentication |
| bcryptjs | 6.0.0 | Password hashing |
| Jest | 29.x | Unit testing |
| Swagger | 7.x | API documentation |

## Important Notes

- ⚠️ **Do not** modify enums and permission mappings manually - they are centralized in `src/authentication/enums/permission.enum.ts`
- 🔐 **JWT Tokens** are signed with a secret key stored in `.env` - never commit it
- 📝 **Logs** table automatically tracks all create/update actions via interceptor
- 🧪 **Tests** mock all guards to avoid JWT dependencies in unit tests
- 📊 **Swagger** documentation is auto-generated from decorators

## Troubleshooting

### JWT Token Errors
- **Invalid token**: Check token format in Authorization header: `Bearer <token>`
- **Token expired**: Use refresh endpoint to get new access token
- **Missing token**: Add `@ApiBearerAuth()` decorator to Swagger documentation

### Permission Denied Errors
- Check user role in database (`users` table)
- Verify permission is mapped to role in `permission.enum.ts`
- Review endpoint's `@Roles()` and `@Permissions()` decorators

### Build Errors
- Run `pnpm install` to ensure all dependencies are installed
- Delete `dist/` folder and run `pnpm run build` again
- Check TypeScript errors with `pnpm tsc --noEmit`

### Test Failures
- Ensure all guards are mocked in test setup with `.overrideGuard()`
- Check mock service methods return correct data types
- Run single test file with `pnpm test -- <filename>`

## Next Steps

1. **Review**: Read [QUICK_START.md](./QUICK_START.md) for essential info
2. **Sign In**: Use test credentials to get JWT token
3. **Explore**: Check [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for code samples
4. **Deploy**: Follow production deployment checklist in docs
5. **Customize**: Modify roles/permissions as needed in permission enum

## Support & Documentation

- **Official NestJS Docs**: https://docs.nestjs.com
- **TypeORM Documentation**: https://typeorm.io
- **JWT Authentication Guide**: https://jwt.io

## License

This project is proprietary software. All rights reserved.

---

**Last Updated**: 2024 | **Status**: ✅ Production Ready | **Tests**: 124/124 Passing

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
