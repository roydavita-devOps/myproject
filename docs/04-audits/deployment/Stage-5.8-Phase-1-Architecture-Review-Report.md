# ARCHITECTURE REVIEW REPORT

## Status

PASS WITH ACTION ITEMS - the platform architecture is suitable for a vendor-agnostic public pilot, provided the later deployment phases keep provider-specific logic out of application code.

This report covers Stage 5.8 Phase 1 only. No provider deployment was implemented in this phase.

## 1. Localhost Architecture

Current local stack:

- Frontend: React + Vite + TypeScript, built as a static SPA.
- Backend: NestJS, Docker-compatible, runs on Node.js.
- Database: PostgreSQL 17 through Docker Compose.
- ORM: Prisma.
- Auth: JWT implemented inside NestJS.
- Storage: tenant-scoped local filesystem uploads under `UPLOAD_STORAGE_PATH`.
- Reverse proxy: Nginx routes `/api/v1/*` to backend and all other traffic to frontend.
- CI/CD: GitHub Actions build, test, smoke test, Docker image build, and VPS deploy workflows.

Local runtime command remains:

```bash
docker compose up -d
```

Local architecture flow:

1. Browser opens Nginx.
2. Nginx serves frontend routes from the frontend container.
3. Frontend calls backend through `VITE_API_URL`.
4. Backend validates JWT, resolves tenant context, and accesses PostgreSQL through Prisma.
5. Uploads are stored by backend and exposed through `/api/v1/uploads/...`.

## 2. Pilot Cloud Architecture

Target public pilot architecture:

- GitHub: source control, PR workflow, and GitHub Actions.
- Vercel: frontend hosting only.
- Railway: backend hosting only.
- Supabase: PostgreSQL database and object storage only.

Pilot cloud flow:

1. Pilot user opens Vercel-hosted frontend.
2. Frontend calls Railway-hosted backend using `VITE_API_URL`.
3. Railway backend validates JWT and tenant context.
4. Backend connects to Supabase PostgreSQL using standard `DATABASE_URL`.
5. Backend stores/read uploads through the storage abstraction.
6. Public site routes remain application routes, not provider-specific routes.

Required environment variables:

- `VITE_API_URL`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN_DAYS`
- `CORS_ORIGINS`
- `ROOT_DOMAIN`
- `RUN_MIGRATIONS`
- `STORAGE_DRIVER`
- `UPLOAD_STORAGE_PATH`
- `UPLOAD_PUBLIC_BASE_URL`
- `MALWARE_SCAN_ENABLED`

Additional storage env vars will be needed when Supabase Storage support is implemented in a later phase, but those variables must stay behind the backend storage abstraction.

## 3. Migration Impact Assessment

Frontend impact:

- Low.
- React SPA is portable.
- Vercel can host it without Vercel-specific app logic.
- `VITE_API_URL` already supports external backend URLs.

Backend impact:

- Medium.
- Backend is Docker-compatible and env-driven.
- Railway can run the backend image or Node build.
- Health endpoints are available.
- Main risk is upload storage because current implementation is filesystem-based.

Database impact:

- Low.
- Prisma schema uses standard PostgreSQL-compatible models and migrations.
- Supabase PostgreSQL can be used through a standard PostgreSQL connection string.
- No Supabase Auth, Realtime, Edge Function, or proprietary database feature is required.

Storage impact:

- Medium.
- Current storage is local filesystem.
- Upload validation is strong and tenant-scoped.
- A provider-neutral storage interface should be introduced before Supabase Storage deployment.
- Future MinIO migration should swap only the storage driver and env vars.

CI/CD impact:

- Medium.
- Existing GitHub Actions support build/test/smoke/Docker workflows.
- Pilot branch and environment-specific secrets are not yet formalized.
- Provider deployment workflows should be added without embedding provider-specific assumptions in app code.

## 4. Vendor Lock-In Risks

### Risk: Supabase Storage SDK leaking into business logic

Severity: High

Reason:

If controllers/services directly call Supabase SDK methods, later migration to MinIO will require application rewrite.

Mitigation:

Introduce a storage adapter boundary:

- `StorageService`
- `LocalStorageAdapter`
- `SupabaseStorageAdapter`
- future `S3CompatibleStorageAdapter` for MinIO

Frontend must continue to call only backend upload endpoints.

### Risk: Vercel-specific frontend runtime assumptions

Severity: Medium

Reason:

Using Vercel Edge Functions, Server Actions, rewrites as app dependencies, or Vercel-only auth would break portability.

Mitigation:

Keep frontend as standard static SPA.
Use only `VITE_API_URL` for backend connectivity.

### Risk: Railway-specific deployment behavior

Severity: Medium

Reason:

Railway proprietary variables or storage would create migration work.

Mitigation:

Run backend as a normal Node/Docker service.
Use standard env vars.
Keep `/health`, `/health/live`, and `/health/ready`.

### Risk: Supabase PostgreSQL feature creep

Severity: Medium

Reason:

RLS, Supabase Auth, functions, triggers, or Realtime could shift tenancy/auth out of the app.

Mitigation:

Use Supabase only as standard PostgreSQL.
Keep JWT auth and tenant isolation inside NestJS + Prisma.

### Risk: upload public URL coupling

Severity: Medium

Reason:

Stored asset URLs may include provider-specific public URLs.

Mitigation:

Prefer storing canonical object keys plus deriving public URLs through backend/storage adapter where possible.
For pilot, if public URLs are stored, document a migration script path for future MinIO migration.

## 5. Future VPS Migration Strategy

Target future architecture:

- Ubuntu VPS
- Docker Compose
- PostgreSQL
- MinIO
- Nginx
- GitHub Actions deployment

Migration strategy:

1. Keep backend Docker image portable.
2. Keep frontend as static SPA.
3. Keep database as standard PostgreSQL and Prisma migrations.
4. Keep authentication inside NestJS JWT.
5. Keep upload logic behind backend endpoints.
6. Use S3-compatible storage adapter for MinIO.
7. Use env vars to switch:
   - database host
   - storage driver
   - storage bucket
   - public asset base URL
   - CORS origins
   - root domain
8. Use Nginx to proxy `/api/v1` and serve frontend/public routes.

Expected VPS migration impact:

- Application rewrite: none.
- Database redesign: none.
- Frontend rewrite: none.
- Backend code change: none after storage adapter is implemented.
- Required changes: env vars, Docker Compose config, Nginx config, DNS, SSL.

## Phase 1 Findings

PASS:

- PostgreSQL-only database foundation.
- Prisma-only ORM.
- JWT auth implemented inside NestJS.
- Docker-compatible backend and frontend.
- Environment-driven local stack.
- Health endpoints exist.
- CI validates build/test/smoke/Docker image.
- Frontend API target is env-configurable.
- Tenant isolation exists in backend request flow.

ACTION ITEMS BEFORE PUBLIC PILOT:

1. Formalize branch strategy: `main`, `staging`, `pilot`.
2. Formalize GitHub environment secrets for local/staging/pilot.
3. Add provider-specific deployment documentation without provider-specific business logic.
4. Implement or formalize storage adapter before Supabase Storage deployment.
5. Document Supabase PostgreSQL migration and rollback plan before applying migrations.
6. Validate CORS and public URLs for Vercel frontend to Railway backend.
7. Keep local Docker Compose path working unchanged.

## Phase 1 Verdict

Architecture is suitable for Stage 5.8 public pilot planning.

Decision:

PASS WITH ACTION ITEMS.

Proceed to Phase 2 - GitHub Preparation after approval.

STOP.
