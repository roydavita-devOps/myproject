# UMKM Website Builder SaaS - Phase 1 Architecture Design

## 1. System Architecture

UMKM Website Builder is a multi-tenant SaaS platform using a single shared application stack for all tenants. The system is split into frontend, backend API, PostgreSQL database, reverse proxy, and deployment automation.

```text
Internet
  |
  v
Nginx Reverse Proxy
  |
  +-- app.umkm-builder.com --------------------> Frontend SPA
  |
  +-- api.umkm-builder.com --------------------> NestJS REST API
  |
  +-- {tenant-custom-domain.com} --------------> Frontend Tenant Website Renderer
                                                   |
                                                   v
                                             NestJS REST API
                                                   |
                                                   v
                                             PostgreSQL
```

### Core Components

- Frontend Admin App: React 19, Vite, TypeScript, Tailwind CSS, React Router, React Query, Axios, Framer Motion.
- Frontend Public Website Renderer: React route layer that renders tenant websites by subdomain or custom domain.
- Backend API: NestJS with modular clean architecture, Prisma ORM, JWT auth, RBAC, validation, and tenant-aware request context.
- Database: PostgreSQL with shared tables and strict tenant scoping through `tenant_id`.
- Reverse Proxy: Nginx handles TLS termination, frontend delivery, API routing, and custom-domain routing.
- Infrastructure: Docker Compose for local and VPS deployment.
- CI/CD: GitHub Actions builds, tests, packages Docker images, and deploys to VPS.

### Why This Architecture

Single-codebase multi-tenancy is the right default for this SaaS because UMKM tenants need similar website features while still requiring independent branding, content, domains, and subscriptions. It avoids one deployment per tenant, keeps operational cost low, and scales better for hundreds or thousands of small businesses.

Tradeoff: database-per-tenant gives stronger physical isolation but increases migration, backup, and operational complexity. For this product stage, shared PostgreSQL schema with enforced tenant isolation is more maintainable and commercially practical.

---

## 2. Multi-Tenant Architecture

### Tenant Resolution

Tenant identity is resolved from one of these sources:

1. Custom domain, for example `wartegmoncer.com`.
2. Platform subdomain, for example `warteg-moncer.umkm-builder.com`.
3. Authenticated tenant context in admin/API requests.

Nginx forwards the host header to the backend. The backend resolves the domain against the `domains` table and attaches the tenant context to the request.

```text
Request Host
  |
  v
Domain Resolver Middleware
  |
  +-- domains.domain match found -> tenant_id
  |
  +-- platform admin route -> tenant from JWT/session
  |
  +-- no tenant -> reject or serve public landing/admin route
```

### Tenant Data Model

All tenant-owned records include `tenant_id`, including:

- users
- websites
- themes
- menus
- menu_categories
- galleries
- reviews
- contacts
- analytics
- domains

Global platform records do not require `tenant_id`, including:

- platform roles
- templates
- subscription plans
- super admin users

### Tenant Isolation Strategy

- Every tenant-scoped query must filter by `tenant_id`.
- Backend services receive tenant context from authenticated request or resolved domain.
- Prisma middleware or repository helpers enforce tenant filters for scoped models.
- RBAC guards validate both role and tenant ownership.
- Super Admin access is explicitly separated from tenant access.
- Cross-tenant reads are denied unless the user is Super Admin and the route is marked as platform-level.

Tradeoff: Prisma does not automatically enforce row-level tenancy unless designed carefully. The backend should combine service-level tenant context with PostgreSQL indexes and optional Row Level Security for high-risk tables.

---

## 3. Database ERD

```text
roles
  id PK
  name
  scope

users
  id PK
  tenant_id FK nullable -> tenants.id
  role_id FK -> roles.id
  name
  email
  password_hash
  status

tenants
  id PK
  name
  slug
  status
  subscription_id FK -> subscriptions.id

subscriptions
  id PK
  tenant_id FK -> tenants.id
  plan
  status
  current_period_start
  current_period_end

websites
  id PK
  tenant_id FK -> tenants.id
  template_id FK -> templates.id
  theme_id FK -> themes.id
  status
  business_name
  tagline
  description
  address
  phone
  whatsapp
  email
  maps_url
  opening_hours

templates
  id PK
  name
  business_type
  schema
  status

themes
  id PK
  tenant_id FK -> tenants.id
  name
  primary_color
  secondary_color
  typography
  logo_url
  hero_image_url

menu_categories
  id PK
  tenant_id FK -> tenants.id
  website_id FK -> websites.id
  name
  sort_order

menus
  id PK
  tenant_id FK -> tenants.id
  website_id FK -> websites.id
  category_id FK -> menu_categories.id
  name
  description
  price
  image_url
  sort_order
  status

galleries
  id PK
  tenant_id FK -> tenants.id
  website_id FK -> websites.id
  category
  image_url
  alt_text
  sort_order

reviews
  id PK
  tenant_id FK -> tenants.id
  website_id FK -> websites.id
  customer_name
  rating
  comment
  source
  status

contacts
  id PK
  tenant_id FK -> tenants.id
  website_id FK -> websites.id
  name
  email
  phone
  message

analytics
  id PK
  tenant_id FK -> tenants.id
  website_id FK -> websites.id
  event_type
  page_path
  metadata
  occurred_at

domains
  id PK
  tenant_id FK -> tenants.id
  domain
  type
  status
  verified_at
```

### Indexing Strategy

- Unique `tenants.slug`.
- Unique `users.email` per tenant for tenant users; globally unique email can be used if cross-tenant account reuse is not needed.
- Unique `domains.domain`.
- Composite indexes on `(tenant_id, id)` for all tenant-owned tables.
- Composite indexes on `(tenant_id, website_id)` for content tables.
- Analytics indexes on `(tenant_id, website_id, occurred_at)` and `(tenant_id, event_type, occurred_at)`.

---

## 4. Security Strategy

### Authentication

- JWT access token for short-lived API access.
- Refresh token rotation stored server-side as hashed token records.
- Passwords hashed with Argon2 or bcrypt.
- Forgot/reset password tokens stored hashed with expiry.

### Authorization

RBAC roles:

- Super Admin: platform-level tenant, subscription, template, and analytics management.
- Tenant Admin: owns tenant website, menus, gallery, content, theme, and business data.
- Editor: can update content and gallery, cannot delete tenant or modify subscription.

Authorization should check:

1. Authenticated identity.
2. Role permission.
3. Tenant ownership.
4. Resource ownership.

### API Protection

- Helmet security headers.
- CORS allowlist for admin app and tenant domains.
- Rate limiting for auth, contact forms, and public tracking endpoints.
- DTO validation using class-validator.
- Prisma parameterized queries for SQL injection protection.
- File upload validation for image type, size, and storage path.
- Audit logs for tenant deletion, suspension, role changes, and subscription changes.

### Public Website Security

- Public read endpoints expose only published website data.
- Draft/unpublished content requires authenticated tenant access.
- Contact and tracking endpoints are rate-limited and spam-protected.

---

## 5. Infrastructure Design

### Docker Architecture

```text
docker-compose.yml
  |
  +-- nginx
  +-- frontend
  +-- backend
  +-- postgres
```

### Container Responsibilities

- `frontend`: builds and serves React app assets.
- `backend`: runs NestJS API and Prisma migrations.
- `postgres`: stores all SaaS data.
- `nginx`: handles reverse proxy, TLS, static routing, API routing, and tenant custom domains.

### Environment Variables

Required environment groups:

- App: `NODE_ENV`, `APP_URL`, `API_URL`
- Database: `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- Auth: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, token expiry values
- CORS: `CORS_ORIGINS`
- Domain: `ROOT_DOMAIN`, `CUSTOM_DOMAIN_ENABLED`
- Uploads: `UPLOAD_DRIVER`, storage path or bucket config

Tradeoff: Docker Compose is enough for early commercial VPS deployment. Kubernetes is unnecessary at the first stage and would add operational weight before the product needs it.

---

## 6. Deployment Strategy

### VPS Deployment Flow

1. GitHub Actions builds and tests frontend/backend.
2. Docker images are built and pushed or source is deployed to VPS.
3. VPS runs `docker compose pull` or receives updated source.
4. Migrations run before backend restart.
5. Services start with `docker compose up -d`.
6. Nginx serves the updated frontend and routes API traffic.

### Production Routing

- `app.umkm-builder.com` -> admin frontend.
- `api.umkm-builder.com` -> backend API.
- `*.umkm-builder.com` -> public tenant website renderer.
- custom tenant domains -> public tenant website renderer after domain verification.

### Backup Strategy for Phase 1 Design

- Daily PostgreSQL logical backups.
- Retention policy: 7 daily, 4 weekly, 3 monthly.
- Backup restore test at least monthly.
- Store backups outside the VPS.

### Scaling Strategy

Initial scale:

- Single VPS with Docker Compose.
- Shared PostgreSQL.
- Nginx reverse proxy.

Next scale:

- Separate database server.
- Add Redis for caching, rate limit state, and queues.
- Separate frontend static hosting/CDN.
- Horizontal backend replicas behind Nginx/load balancer.
- Object storage for images.

---

## Phase 1 Approval Gate

Phase 1 is complete at architecture level. No implementation code should be generated until approval is given to continue to Phase 2: Database & Backend Design.
