# UMKM Website Builder SaaS - Phase 3 Backend Implementation

## 1. Folder Structure

```text
backend/
  package.json
  nest-cli.json
  tsconfig.json
  tsconfig.build.json
  jest.config.ts
  .env.example
  prisma/
    schema.prisma
  src/
    main.ts
    app.module.ts
    prisma/
      prisma.module.ts
      prisma.service.ts
    common/
      common.module.ts
      decorators/
        current-user.decorator.ts
        public.decorator.ts
        roles.decorator.ts
        tenant-context.decorator.ts
      guards/
        jwt-auth.guard.ts
        roles.guard.ts
        tenant.guard.ts
      middleware/
        tenant-resolver.middleware.ts
      types/
        authenticated-user.type.ts
        request-with-context.type.ts
        tenant-context.type.ts
    modules/
      auth/
      tenants/
      websites/
      menus/
```

## 2. Source Code Delivered

The backend implementation now includes:

- NestJS bootstrap with global `/api/v1` prefix, Helmet, CORS, and validation pipe.
- Prisma service and full Prisma schema for the multi-tenant SaaS database.
- Common auth/tenant/RBAC layer:
  - `JwtAuthGuard`
  - `RolesGuard`
  - `TenantGuard`
  - `TenantResolverMiddleware`
  - decorators for current user, roles, public routes, and tenant context.
- Auth module:
  - register tenant and Tenant Admin in one transaction
  - login
  - refresh token rotation
  - logout
  - forgot password
  - reset password
- Tenants module:
  - list tenants
  - create tenant
  - update tenant
  - suspend tenant
  - activate tenant
  - soft delete tenant
- Websites module:
  - tenant-scoped website CRUD
  - publish/unpublish
  - preview
  - public website rendering by host or slug
- Menus module:
  - menu category CRUD
  - menu item CRUD
  - reorder
  - archive delete

All tenant-owned mutations validate ownership by `tenant_id` before updating records.

## 3. Unit Test Strategy

### Priority 1: Auth Service

Test cases:

- `register` creates tenant, subscription, user, theme, website, and subdomain inside a transaction.
- `register` rejects duplicate tenant slug.
- `login` rejects invalid credentials.
- `login` rejects suspended users or suspended tenants.
- `refresh` rejects expired/revoked tokens.
- `refresh` revokes old token and issues replacement.
- `resetPassword` updates password and revokes all active refresh tokens.

### Priority 2: Tenant Isolation

Test cases:

- Website update fails when `tenant_id` does not own website.
- Menu update fails when `tenant_id` does not own menu.
- Category assignment fails when category belongs to another tenant.
- Public site only returns `PUBLISHED` websites.

### Priority 3: Guards

Test cases:

- `JwtAuthGuard` rejects missing/invalid bearer token.
- `RolesGuard` rejects users without required role.
- `TenantGuard` rejects tenant users without tenant context.
- Super Admin can access platform routes but does not automatically bypass tenant-scoped services.

### Priority 4: Controllers

Use Nest testing module with mocked services:

- Validate controller route methods call the expected service method.
- Validate role decorators are present on restricted routes.
- Validate DTO validation rejects malformed request payloads in e2e tests.

## 4. Implementation Notes

- This phase intentionally implements backend only. Frontend, Docker, GitHub Actions, and deployment scripts are reserved for later approved phases.
- Dependencies are declared in `backend/package.json`, but package installation is a separate environment action.
- Custom SQL constraints from Phase 2, such as review rating range checks, should be added in the first Prisma migration.

## Phase 3 Approval Gate

Phase 3 backend implementation is complete for the initial production-oriented backend foundation. Do not proceed to Phase 4: Frontend Design until approval is given.
