# Deployment Environment Matrix

Last updated: 2026-07-13

## Purpose

This document maps UMKM Builder local and production deployment environments for future Railway reactivation.

## Warning

Railway is currently inactive/expired.

Stage 9.12A is preparation-only. Actual Railway reactivation, production redeploy, and production migrations are deferred to Stage 9.12B.

Do not run production migrations until backup and migration status are verified.

Stage 9.12A is preparation only. Do not deploy, modify production secrets, run production migrations, or change DNS from this document.

Related docs:

- [PRODUCTION_RELAUNCH_PREPARATION.md](./PRODUCTION_RELAUNCH_PREPARATION.md)
- [PRODUCTION_ENV_MANUAL_CHECKLIST.md](./PRODUCTION_ENV_MANUAL_CHECKLIST.md)
- [PRODUCTION_SMOKE_TEST_PLAN.md](./PRODUCTION_SMOKE_TEST_PLAN.md)
- [PRODUCTION_ROLLBACK_PLAN.md](./PRODUCTION_ROLLBACK_PLAN.md)

## Environment Matrix

| Environment | Frontend URL | Backend URL | CORS origin expected | API base | Database | Storage |
| --- | --- | --- | --- | --- | --- | --- |
| Local Docker | `http://localhost` | `http://localhost/api/v1` via nginx proxy | `http://localhost`, optionally `http://localhost:5173` | `/api/v1` | Docker Postgres | Local volume or disabled |
| Local Vite | `http://localhost:5173` | `http://localhost:4000/api/v1` or nginx `/api/v1` | `http://localhost:5173` | `http://localhost:4000/api/v1` | Docker Postgres | Local volume or disabled |
| Vercel Production | `https://<vercel-production-domain>` | `https://<railway-backend-domain>/api/v1` or proxied API strategy | Vercel production origin | `/api/v1` or absolute Railway API URL | Supabase Postgres | Supabase Storage |
| Vercel Preview | `https://<vercel-preview-domain>` | `https://<railway-backend-domain>/api/v1` | Vercel preview origin if enabled | `/api/v1` or absolute Railway API URL | Supabase Postgres | Supabase Storage |
| Railway Backend | N/A | `https://<railway-backend-domain>` | Vercel production and approved preview origins | `/api/v1`, health outside prefix | Supabase Postgres | Supabase Storage |

## Frontend / Vercel

| Variable | Required | Purpose | Redacted example | Validation |
| --- | --- | --- | --- | --- |
| `VITE_API_URL` | Yes | Frontend API target. | `https://<railway-backend-domain>/api/v1` or `/api/v1` if proxy is configured | Login and dashboard API calls succeed. |
| `VITE_GOOGLE_CLIENT_ID` | Required if Google login is enabled | Google Identity Services client id exposed to browser. | `<google-client-id>.apps.googleusercontent.com` | Google button renders and login works. |

Build command:

- `npm run build` from `frontend/`.

Output directory:

- `frontend/dist`.

Current `frontend/vercel.json` only rewrites all routes to `index.html`. It does not define an API proxy. If production uses `VITE_API_URL=/api/v1`, confirm Vercel has a separate API rewrite/proxy outside this file or use an absolute Railway API URL.

## Backend / Railway

| Variable | Required | Purpose | Redacted example | Validation |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | Yes | Enables production validation. | `production` | Backend starts with production checks. |
| `PORT` | Usually provided by Railway | HTTP port. | `4000` or Railway-provided port | Railway service binds correctly. |
| `DATABASE_URL` | Yes | Prisma runtime DB URL. | `postgresql://***REDACTED***` | `/health/ready` returns database OK. |
| `DIRECT_URL` | Yes | Prisma direct migration URL. | `postgresql://***REDACTED***` | `prisma migrate status` can inspect migration state. |
| `JWT_ACCESS_SECRET` | Yes | Access token signing secret. | `***REDACTED-32-PLUS-CHARS***` | Login returns usable access token. |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret. | `***REDACTED-32-PLUS-CHARS***` | Refresh endpoint works. |
| `JWT_ACCESS_EXPIRES_IN` | Optional | Access token expiry. | `15m` | Token expiry matches intended policy. |
| `JWT_REFRESH_EXPIRES_IN_DAYS` | Optional | Refresh token lifetime. | `30` | Refresh session persists as expected. |
| `CORS_ORIGINS` | Yes | Allowed browser origins. | `https://<vercel-production-domain>` | Browser requests from Vercel are accepted. |
| `ROOT_DOMAIN` | Yes | Cookie/domain and public slug assumptions. | `<production-root-domain>` | Auth/session/public URLs behave correctly. |
| `APP_PUBLIC_URL` | Yes | Public app URL for email links. | `https://<vercel-production-domain>` | Email links point to production frontend. |
| `GOOGLE_CLIENT_ID` | Required if Google login is enabled | Backend verifies Google id token audience. | `<google-client-id>.apps.googleusercontent.com` | Google login succeeds. |
| `AUTH_TOKEN_RESPONSE_ENABLED` | Optional | Compatibility token response flag. | `false` | Auth response behavior matches frontend. |
| `RUN_MIGRATIONS` | Yes, use carefully | Controls automatic `prisma migrate deploy` in container entrypoint. | `false` before manual status check; `true` only after approval | Logs show migration decision. |
| `STORAGE_DRIVER` | Yes for durable uploads | Selects storage adapter. | `supabase` | `/health/storage` returns OK. |
| `SUPABASE_URL` | Required if `STORAGE_DRIVER=supabase` | Supabase project URL. | `https://<project>.supabase.co` | Storage adapter initializes. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required if `STORAGE_DRIVER=supabase` | Backend-only service role key. | `***REDACTED***` | Upload/delete operations work. |
| `SUPABASE_STORAGE_BUCKET` | Required if `STORAGE_DRIVER=supabase` | Upload bucket name. | `tenant-assets` | Upload variants are created. |
| `SUPABASE_STORAGE_PUBLIC_BASE_URL` | Optional | Public base URL override. | `https://<project>.supabase.co/storage/v1/object/public/tenant-assets` | Public image URLs render. |
| `RESEND_API_KEY` | Optional until email activation | Resend API key. | `***REDACTED***` | Password/email flows send mail when enabled. |
| `EMAIL_FROM` | Optional until email activation | Sender identity. | `UMKM Builder <noreply@example.com>` | Delivered email has correct sender. |
| `CACHE_DRIVER` | Optional | Cache driver. | `none` | `/health/cache` reports expected state. |
| `MALWARE_SCAN_ENABLED` | Optional | Upload scanning flag. | `false` | Upload flow matches policy. |

Build/start:

- Railway uses root `Dockerfile.railway`.
- Entrypoint: `backend/docker-entrypoint.sh`.
- Runtime command: `node dist/main.js`.
- Health check: `/health/ready`.

## Supabase

| Item | Expected value | Validation |
| --- | --- | --- |
| Database | Supabase Postgres project active. | `prisma migrate status` after access is ready. |
| Pooler runtime URL | Transaction-mode pooler if required by runtime. | Backend DB health passes. |
| Direct URL | Session/direct URL for migrations. | Migration status can be checked. |
| Storage bucket | `tenant-assets`. | Bucket exists and upload can write variants. |
| Public URL policy | Public rendering must be able to load uploaded objects. | Public site image URLs load in browser. |
| Service role key | Railway backend only. | Not present in Vercel/frontend env. |

## GitHub Workflows

| Workflow | Behavior |
| --- | --- |
| `backend-build.yml` | Builds backend on backend changes for `main`, `staging`, and `pilot`. |
| `frontend-build.yml` | Builds frontend with `VITE_API_URL=/api/v1`. |
| `test.yml` | Runs backend tests and frontend build. |
| `smoke-test.yml` | Builds Docker stack locally in CI, waits on `/health/ready`, then runs Playwright smoke tests. |
| `docker-build.yml` | Builds and publishes GHCR images on push/tag except pull requests. |
| `deploy-vps.yml` | Production VPS deployment workflow exists and triggers on push to `main` or manual dispatch when VPS secrets exist. Current intended production stack in this stage remains Vercel/Railway/Supabase; do not use this workflow for Railway reactivation. |

## Known Alignment Risks

- `frontend/vercel.json` does not currently proxy `/api/v1`; production must use an absolute `VITE_API_URL` or add a separately approved proxy strategy.
- `RUN_MIGRATIONS=true` makes Railway container startup run migrations automatically. For relaunch recovery, set this only after backup and migration status are verified.
- `STORAGE_DRIVER=local` is not durable on stateless production. Production uploads require `STORAGE_DRIVER=supabase`.
- `CORS_ORIGINS` must include exact Vercel production origin and any approved preview origin.
