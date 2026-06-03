# UMKM Website Builder SaaS - Phase 2 Database & Backend Design

## 1. PostgreSQL Design

The database uses a shared-schema multi-tenant model. Tenant-owned tables include `tenant_id` and must be queried through tenant-aware services. This keeps infrastructure simple for commercial launch while still supporting hundreds or thousands of tenants from one codebase.

### Database Principles

- Use UUID primary keys to avoid predictable IDs and simplify future distributed systems.
- Use `tenant_id` on every tenant-owned table.
- Use soft status fields for operational workflows such as suspension, draft content, and review moderation.
- Use JSONB only for configurable or semi-structured fields such as template schema, social media links, opening hours, analytics metadata, and theme typography.
- Keep billing/subscription records tenant-scoped but separate from website content.
- Add composite indexes around `tenant_id` because tenant filtering is the most frequent query predicate.

### Migration Strategy

1. All schema changes are generated through Prisma migrations.
2. Development uses `npx prisma migrate dev`.
3. Production uses `npx prisma migrate deploy` during backend release.
4. Destructive migrations require explicit pre-migration backup and manual review.
5. High-volume tables such as `analytics` should use additive migrations first, then backfill jobs, then constraint tightening in a separate release.

Tradeoff: PostgreSQL Row Level Security can add a second isolation layer, but it increases Prisma integration complexity. The initial implementation should enforce tenant scoping in repository/service helpers and reserve RLS for high-risk tables once the product stabilizes.

---

## 2. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum RoleName {
  SUPER_ADMIN
  TENANT_ADMIN
  EDITOR
}

enum RoleScope {
  PLATFORM
  TENANT
}

enum UserStatus {
  ACTIVE
  INVITED
  SUSPENDED
}

enum TenantStatus {
  ACTIVE
  TRIAL
  SUSPENDED
  DELETED
}

enum SubscriptionPlan {
  FREE
  STARTER
  BUSINESS
  ENTERPRISE
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  EXPIRED
}

enum WebsiteStatus {
  DRAFT
  PUBLISHED
  UNPUBLISHED
  ARCHIVED
}

enum TemplateStatus {
  ACTIVE
  INACTIVE
}

enum BusinessType {
  WARTEG
  RESTAURANT
  CAFE
  LAUNDRY
  WORKSHOP
  CLINIC
  SALON
  RETAIL
  LOCAL_SERVICE
}

enum ContentStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum ReviewStatus {
  PENDING
  PUBLISHED
  REJECTED
}

enum ReviewSource {
  INTERNAL
  GOOGLE_PLACEHOLDER
}

enum DomainType {
  SUBDOMAIN
  CUSTOM
}

enum DomainStatus {
  PENDING
  VERIFIED
  FAILED
  DISABLED
}

enum AnalyticsEventType {
  PAGE_VIEW
  CONTACT_CLICK
  WHATSAPP_CLICK
  PHONE_CLICK
  MAP_CLICK
  FORM_SUBMIT
  CONVERSION
}

model Role {
  id          String    @id @default(uuid()) @db.Uuid
  name        RoleName  @unique
  scope       RoleScope
  description String?
  users       User[]
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("roles")
}

model User {
  id                  String         @id @default(uuid()) @db.Uuid
  tenantId            String?        @map("tenant_id") @db.Uuid
  roleId              String         @map("role_id") @db.Uuid
  name                String
  email               String
  passwordHash        String         @map("password_hash")
  status              UserStatus     @default(ACTIVE)
  lastLoginAt         DateTime?      @map("last_login_at")
  tenant              Tenant?        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  role                Role           @relation(fields: [roleId], references: [id])
  refreshTokens       RefreshToken[]
  passwordResetTokens PasswordResetToken[]
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([roleId])
  @@map("users")
}

model Tenant {
  id             String         @id @default(uuid()) @db.Uuid
  name           String
  slug           String         @unique
  status         TenantStatus   @default(TRIAL)
  users          User[]
  subscriptions  Subscription[]
  websites       Website[]
  themes         Theme[]
  domains        Domain[]
  menuCategories MenuCategory[]
  menus          Menu[]
  galleries      Gallery[]
  reviews        Review[]
  contacts       Contact[]
  analytics      Analytics[]
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  deletedAt      DateTime?      @map("deleted_at")

  @@index([status])
  @@map("tenants")
}

model Subscription {
  id                 String             @id @default(uuid()) @db.Uuid
  tenantId           String             @map("tenant_id") @db.Uuid
  plan               SubscriptionPlan   @default(FREE)
  status             SubscriptionStatus @default(TRIALING)
  monthlyPrice       Decimal            @default(0) @map("monthly_price") @db.Decimal(12, 2)
  currentPeriodStart DateTime?          @map("current_period_start")
  currentPeriodEnd   DateTime?          @map("current_period_end")
  canceledAt         DateTime?          @map("canceled_at")
  tenant             Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt          DateTime           @default(now()) @map("created_at")
  updatedAt          DateTime           @updatedAt @map("updated_at")

  @@index([tenantId, status])
  @@map("subscriptions")
}

model Template {
  id           String         @id @default(uuid()) @db.Uuid
  name         String
  businessType BusinessType   @map("business_type")
  schema       Json
  status       TemplateStatus @default(ACTIVE)
  websites     Website[]
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")

  @@unique([name, businessType])
  @@index([businessType, status])
  @@map("templates")
}

model Theme {
  id             String    @id @default(uuid()) @db.Uuid
  tenantId       String    @map("tenant_id") @db.Uuid
  name           String
  primaryColor   String    @map("primary_color")
  secondaryColor String    @map("secondary_color")
  accentColor    String?   @map("accent_color")
  typography     Json
  logoUrl        String?   @map("logo_url")
  heroImageUrl   String?   @map("hero_image_url")
  tenant         Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  websites       Website[]
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  @@index([tenantId])
  @@map("themes")
}

model Website {
  id            String        @id @default(uuid()) @db.Uuid
  tenantId      String        @map("tenant_id") @db.Uuid
  templateId    String        @map("template_id") @db.Uuid
  themeId       String?       @map("theme_id") @db.Uuid
  status        WebsiteStatus @default(DRAFT)
  businessName  String        @map("business_name")
  tagline       String?
  description   String?
  address       String?
  phone         String?
  whatsapp      String?
  email         String?
  socialMedia   Json?         @map("social_media")
  mapsUrl       String?       @map("maps_url")
  openingHours  Json?         @map("opening_hours")
  publishedAt   DateTime?     @map("published_at")
  tenant        Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  template      Template      @relation(fields: [templateId], references: [id])
  theme         Theme?        @relation(fields: [themeId], references: [id])
  categories    MenuCategory[]
  menus         Menu[]
  galleries     Gallery[]
  reviews       Review[]
  contacts      Contact[]
  analytics     Analytics[]
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  @@index([tenantId, status])
  @@index([tenantId, templateId])
  @@map("websites")
}

model MenuCategory {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @map("tenant_id") @db.Uuid
  websiteId String   @map("website_id") @db.Uuid
  name      String
  sortOrder Int      @default(0) @map("sort_order")
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  website   Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  menus     Menu[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([tenantId, websiteId, name])
  @@index([tenantId, websiteId])
  @@map("menu_categories")
}

model Menu {
  id          String        @id @default(uuid()) @db.Uuid
  tenantId    String        @map("tenant_id") @db.Uuid
  websiteId   String        @map("website_id") @db.Uuid
  categoryId  String?       @map("category_id") @db.Uuid
  name        String
  description String?
  price       Decimal?      @db.Decimal(12, 2)
  imageUrl    String?       @map("image_url")
  sortOrder   Int           @default(0) @map("sort_order")
  status      ContentStatus @default(ACTIVE)
  tenant      Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  website     Website       @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  category    MenuCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  @@index([tenantId, websiteId])
  @@index([tenantId, categoryId])
  @@map("menus")
}

model Gallery {
  id        String        @id @default(uuid()) @db.Uuid
  tenantId  String        @map("tenant_id") @db.Uuid
  websiteId String        @map("website_id") @db.Uuid
  category  String?
  imageUrl  String        @map("image_url")
  altText   String?       @map("alt_text")
  sortOrder Int           @default(0) @map("sort_order")
  status    ContentStatus @default(ACTIVE)
  tenant    Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  website   Website       @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  createdAt DateTime      @default(now()) @map("created_at")
  updatedAt DateTime      @updatedAt @map("updated_at")

  @@index([tenantId, websiteId])
  @@map("galleries")
}

model Review {
  id           String       @id @default(uuid()) @db.Uuid
  tenantId     String       @map("tenant_id") @db.Uuid
  websiteId    String       @map("website_id") @db.Uuid
  customerName String       @map("customer_name")
  rating       Int
  comment      String?
  source       ReviewSource @default(INTERNAL)
  status       ReviewStatus @default(PENDING)
  tenant       Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  website      Website      @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  @@index([tenantId, websiteId, status])
  @@map("reviews")
}

model Contact {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @map("tenant_id") @db.Uuid
  websiteId String   @map("website_id") @db.Uuid
  name      String
  email     String?
  phone     String?
  message   String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  website   Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")

  @@index([tenantId, websiteId, createdAt])
  @@map("contacts")
}

model Analytics {
  id          String             @id @default(uuid()) @db.Uuid
  tenantId    String             @map("tenant_id") @db.Uuid
  websiteId   String             @map("website_id") @db.Uuid
  eventType   AnalyticsEventType @map("event_type")
  pagePath    String?            @map("page_path")
  metadata    Json?
  occurredAt  DateTime           @default(now()) @map("occurred_at")
  tenant      Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  website     Website            @relation(fields: [websiteId], references: [id], onDelete: Cascade)

  @@index([tenantId, websiteId, occurredAt])
  @@index([tenantId, eventType, occurredAt])
  @@map("analytics")
}

model Domain {
  id         String       @id @default(uuid()) @db.Uuid
  tenantId   String       @map("tenant_id") @db.Uuid
  domain     String       @unique
  type       DomainType
  status     DomainStatus @default(PENDING)
  verifiedAt DateTime?    @map("verified_at")
  tenant     Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt  DateTime     @default(now()) @map("created_at")
  updatedAt  DateTime     @updatedAt @map("updated_at")

  @@index([tenantId, status])
  @@map("domains")
}

model RefreshToken {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @map("user_id") @db.Uuid
  tokenHash   String    @map("token_hash")
  userAgent   String?   @map("user_agent")
  ipAddress   String?   @map("ip_address")
  expiresAt   DateTime  @map("expires_at")
  revokedAt   DateTime? @map("revoked_at")
  replacedBy  String?   @map("replaced_by") @db.Uuid
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now()) @map("created_at")

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

model PasswordResetToken {
  id        String    @id @default(uuid()) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  tokenHash String    @map("token_hash")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now()) @map("created_at")

  @@index([userId])
  @@index([expiresAt])
  @@map("password_reset_tokens")
}
```

### Constraints Not Fully Expressed by Prisma

- `reviews.rating` should be constrained to `1..5` through SQL migration.
- Tenant users must have `tenant_id`; only `SUPER_ADMIN` users may have `tenant_id = null`.
- `Domain.type = SUBDOMAIN` should match the platform root domain pattern.
- `Website.theme_id`, when present, must reference a theme from the same tenant. Enforce in service logic because PostgreSQL composite foreign keys are more awkward through Prisma.

---

## 3. Backend Module Design

The backend should use NestJS modules with clear ownership boundaries. Controllers handle HTTP contracts, services handle business rules, repositories wrap Prisma access, and guards enforce auth/RBAC/tenant boundaries.

```text
backend/
  src/
    main.ts
    app.module.ts
    config/
      config.module.ts
      env.schema.ts
    prisma/
      prisma.module.ts
      prisma.service.ts
    common/
      decorators/
        current-user.decorator.ts
        tenant-context.decorator.ts
        roles.decorator.ts
        public.decorator.ts
      guards/
        jwt-auth.guard.ts
        roles.guard.ts
        tenant.guard.ts
      interceptors/
        response.interceptor.ts
      filters/
        http-exception.filter.ts
      middleware/
        tenant-resolver.middleware.ts
      types/
        authenticated-user.type.ts
        tenant-context.type.ts
    modules/
      auth/
      users/
      tenants/
      subscriptions/
      templates/
      websites/
      themes/
      menus/
      galleries/
      reviews/
      contacts/
      analytics/
      domains/
      uploads/
```

### Module Responsibilities

- `auth`: register, login, refresh token rotation, logout, password reset.
- `users`: tenant user management, invitations later, editor/admin lifecycle.
- `tenants`: Super Admin tenant CRUD, suspension, deletion workflow.
- `subscriptions`: plan assignment, subscription status, upgrade/downgrade flow.
- `templates`: global reusable website templates.
- `websites`: website profile, publish/unpublish, preview data.
- `themes`: tenant theme selection and customization.
- `menus`: categories and menu/service items.
- `galleries`: image metadata, ordering, categorization.
- `reviews`: customer review moderation and Google placeholder source.
- `contacts`: public contact form submissions and tenant inbox.
- `analytics`: event tracking and reporting.
- `domains`: custom domain verification and tenant resolution.
- `uploads`: image upload validation and storage adapter.

### Tenant-Aware Repository Rule

Every tenant-owned repository method must accept `tenantId` explicitly:

```ts
findWebsiteById(tenantId: string, websiteId: string)
updateMenuItem(tenantId: string, menuId: string, dto: UpdateMenuDto)
```

Avoid methods that only accept `id` for tenant-scoped models. This prevents accidental cross-tenant access.

---

## 4. REST API Specification

Base path: `/api/v1`

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create tenant, first Tenant Admin user, default website draft |
| POST | `/auth/login` | Public | Authenticate by email/password |
| POST | `/auth/refresh` | Public with refresh token | Rotate refresh token and return new tokens |
| POST | `/auth/logout` | Authenticated | Revoke current refresh token |
| POST | `/auth/forgot-password` | Public | Issue reset token email workflow |
| POST | `/auth/reset-password` | Public | Reset password using valid token |
| GET | `/auth/me` | Authenticated | Return current user, role, tenant |

### Tenants

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/tenants` | Super Admin | List tenants |
| POST | `/tenants` | Super Admin | Create tenant manually |
| GET | `/tenants/:id` | Super Admin | Get tenant detail |
| PUT | `/tenants/:id` | Super Admin | Update tenant |
| PATCH | `/tenants/:id/suspend` | Super Admin | Suspend tenant |
| PATCH | `/tenants/:id/activate` | Super Admin | Activate tenant |
| DELETE | `/tenants/:id` | Super Admin | Soft delete tenant |

### Subscriptions

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/subscriptions/plans` | Authenticated | List available plans |
| GET | `/subscriptions/current` | Tenant Admin | Get current tenant subscription |
| PATCH | `/subscriptions/current/upgrade` | Tenant Admin | Request plan upgrade |
| PATCH | `/subscriptions/current/cancel` | Tenant Admin | Cancel subscription |
| GET | `/admin/subscriptions` | Super Admin | Platform subscription list |
| PUT | `/admin/subscriptions/:id` | Super Admin | Manually update subscription |

### Templates

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/templates` | Authenticated | List active templates |
| GET | `/templates/:id` | Authenticated | Get template detail |
| POST | `/templates` | Super Admin | Create template |
| PUT | `/templates/:id` | Super Admin | Update template |
| DELETE | `/templates/:id` | Super Admin | Disable template |

### Websites

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/websites` | Tenant Admin, Editor | List own tenant websites |
| POST | `/websites` | Tenant Admin | Create website |
| GET | `/websites/:id` | Tenant Admin, Editor | Get website detail |
| PUT | `/websites/:id` | Tenant Admin, Editor | Update business information |
| PATCH | `/websites/:id/publish` | Tenant Admin | Publish website |
| PATCH | `/websites/:id/unpublish` | Tenant Admin | Unpublish website |
| GET | `/websites/:id/preview` | Tenant Admin, Editor | Preview draft website |
| DELETE | `/websites/:id` | Tenant Admin | Archive website |

### Public Website

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/public/site` | Public with domain context | Get published tenant website data by host |
| GET | `/public/site/:slug` | Public | Get published tenant website data by platform slug |
| POST | `/public/contact` | Public with domain context | Submit contact form |
| POST | `/public/analytics` | Public with domain context | Track public events |

### Themes

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/themes` | Tenant Admin, Editor | List tenant themes |
| POST | `/themes` | Tenant Admin | Create theme |
| GET | `/themes/:id` | Tenant Admin, Editor | Get theme |
| PUT | `/themes/:id` | Tenant Admin | Update colors, typography, images |
| DELETE | `/themes/:id` | Tenant Admin | Delete unused theme |

### Menu Management

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/menu-categories` | Tenant Admin, Editor | List categories |
| POST | `/menu-categories` | Tenant Admin, Editor | Create category |
| PUT | `/menu-categories/:id` | Tenant Admin, Editor | Update category |
| DELETE | `/menu-categories/:id` | Tenant Admin | Delete category |
| GET | `/menus` | Tenant Admin, Editor | List menu/service items |
| POST | `/menus` | Tenant Admin, Editor | Create item |
| PUT | `/menus/:id` | Tenant Admin, Editor | Update item |
| PATCH | `/menus/reorder` | Tenant Admin, Editor | Reorder items |
| DELETE | `/menus/:id` | Tenant Admin | Delete item |

### Gallery

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/galleries` | Tenant Admin, Editor | List images |
| POST | `/galleries` | Tenant Admin, Editor | Add image metadata after upload |
| PUT | `/galleries/:id` | Tenant Admin, Editor | Update image metadata |
| PATCH | `/galleries/reorder` | Tenant Admin, Editor | Reorder images |
| DELETE | `/galleries/:id` | Tenant Admin, Editor | Delete image |

### Reviews

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/reviews` | Tenant Admin, Editor | List reviews |
| POST | `/reviews` | Tenant Admin, Editor | Create manual review |
| PUT | `/reviews/:id` | Tenant Admin, Editor | Update review |
| PATCH | `/reviews/:id/publish` | Tenant Admin, Editor | Publish review |
| PATCH | `/reviews/:id/reject` | Tenant Admin, Editor | Reject review |
| DELETE | `/reviews/:id` | Tenant Admin | Delete review |

### Contacts

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/contacts` | Tenant Admin, Editor | List submitted contacts |
| GET | `/contacts/:id` | Tenant Admin, Editor | Get contact detail |
| DELETE | `/contacts/:id` | Tenant Admin | Delete contact |

### Analytics

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/analytics/summary` | Tenant Admin, Editor | Visitors, clicks, conversions |
| GET | `/analytics/pages` | Tenant Admin, Editor | Popular pages |
| GET | `/analytics/events` | Tenant Admin, Editor | Event list |
| GET | `/admin/analytics/platform` | Super Admin | Platform-wide metrics |

### Domains

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/domains` | Tenant Admin | List tenant domains |
| POST | `/domains` | Tenant Admin | Add custom domain |
| POST | `/domains/:id/verify` | Tenant Admin | Verify DNS setup |
| DELETE | `/domains/:id` | Tenant Admin | Remove domain |

### Uploads

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/uploads/images` | Tenant Admin, Editor | Upload logo, hero, menu, gallery images |

---

## 5. RBAC Design

### Permission Matrix

| Capability | Super Admin | Tenant Admin | Editor |
| --- | --- | --- | --- |
| Manage tenants | Yes | No | No |
| Suspend/delete tenant | Yes | No | No |
| Manage subscriptions | Yes | Own tenant upgrade/cancel | No |
| Manage templates | Yes | View only | View only |
| Manage website settings | Platform support only | Yes | Limited content fields |
| Publish/unpublish website | No tenant bypass by default | Yes | No |
| Manage themes | Platform support only | Yes | No |
| Manage menu content | No tenant bypass by default | Yes | Yes |
| Manage gallery | No tenant bypass by default | Yes | Yes |
| Manage reviews | No tenant bypass by default | Yes | Yes |
| View tenant analytics | Platform aggregate | Own tenant | Own tenant |
| Manage custom domains | Platform support only | Yes | No |

### Guard Stack

Protected routes should use this order:

1. `JwtAuthGuard`: validates access token.
2. `TenantGuard`: resolves and validates tenant context where required.
3. `RolesGuard`: validates role permissions.
4. Resource-level service checks: validates record ownership by `tenant_id`.

### Super Admin Boundary

Super Admin should not silently bypass tenant scoping on tenant routes. Platform routes should use `/admin/*` or explicit metadata such as `@PlatformRoute()`. This reduces the chance of accidental cross-tenant operations.

---

## 6. Authentication Flow

### Register Flow

```text
POST /auth/register
  |
  +-- validate tenant slug and email
  +-- create tenant with TRIAL status
  +-- create FREE/TRIAL subscription
  +-- create Tenant Admin user
  +-- create default theme
  +-- create draft website from selected template
  +-- create platform subdomain record
  +-- return access token, refresh token, tenant context
```

This flow should run inside a database transaction. If any provisioning step fails, the tenant should not be partially created.

### Login Flow

```text
POST /auth/login
  |
  +-- find active user by tenant/email strategy
  +-- verify password hash
  +-- reject suspended user or suspended tenant
  +-- create refresh token hash
  +-- return JWT access token and refresh token
```

Access token claims:

```json
{
  "sub": "user_uuid",
  "tenantId": "tenant_uuid_or_null",
  "role": "TENANT_ADMIN",
  "scope": "TENANT"
}
```

### Refresh Flow

```text
POST /auth/refresh
  |
  +-- verify refresh token exists by hash
  +-- check expiry and revoked_at
  +-- revoke old token
  +-- create replacement token
  +-- issue new access token and refresh token
```

Refresh token rotation is required because long-lived bearer tokens are high impact if leaked.

### Forgot/Reset Password Flow

```text
POST /auth/forgot-password
  |
  +-- always return generic success response
  +-- if user exists, store hashed reset token with expiry
  +-- send reset email later through mail adapter

POST /auth/reset-password
  |
  +-- verify reset token hash and expiry
  +-- update password hash
  +-- mark token used
  +-- revoke all refresh tokens for user
```

---

## 7. Authorization Flow

### Tenant Admin Updating Menu Item

```text
PUT /menus/:id
  |
  +-- JwtAuthGuard validates user
  +-- TenantGuard attaches tenant_id from token
  +-- RolesGuard allows TENANT_ADMIN or EDITOR
  +-- MenuService.update(tenantId, menuId, dto)
  +-- Prisma WHERE includes id and tenant_id
```

### Super Admin Suspending Tenant

```text
PATCH /tenants/:id/suspend
  |
  +-- JwtAuthGuard validates user
  +-- RolesGuard requires SUPER_ADMIN
  +-- TenantService.suspendTenant(tenantId)
  +-- set tenant status SUSPENDED
  +-- optionally revoke active tenant refresh tokens
```

### Public Domain Website Rendering

```text
GET /public/site
  |
  +-- TenantResolver reads Host header
  +-- DomainService finds verified domain
  +-- PublicWebsiteService loads published website only
  +-- response excludes draft/private admin fields
```

---

## 8. DTO and Validation Rules

### Auth DTOs

- `RegisterDto`: business name, slug, admin name, email, password, business type.
- `LoginDto`: email, password, optional tenant slug if global email reuse is enabled.
- `RefreshTokenDto`: refresh token.
- `ForgotPasswordDto`: email.
- `ResetPasswordDto`: token, new password.

### Website DTOs

- `CreateWebsiteDto`: template id, business name, optional business type.
- `UpdateWebsiteDto`: tagline, description, address, phone, WhatsApp, email, social media, maps URL, opening hours.
- `PublishWebsiteDto`: optional publish checklist confirmation.

### Content DTOs

- Menu price must be decimal and non-negative.
- Review rating must be integer from 1 to 5.
- Sort order must be integer and non-negative.
- Image URL fields must come from upload service output, not arbitrary untrusted external input by default.

---

## 9. Backend Design Tradeoffs

- Shared schema over database-per-tenant: better cost and operational simplicity for UMKM market; isolation must be enforced carefully in code.
- REST over GraphQL: easier to secure, test, cache, document, and consume from a small React admin app.
- JSONB for template/theme flexible fields: avoids schema churn while templates evolve; core business entities stay relational.
- Refresh token table over stateless refresh token only: enables revocation, rotation, device tracking, and tenant suspension enforcement.
- Explicit `/admin/*` platform routes: clearer separation between Super Admin operations and tenant operations.

---

## Phase 2 Approval Gate

Phase 2 is complete at design level. No NestJS source code should be generated until approval is given to continue to Phase 3: Backend Implementation.
