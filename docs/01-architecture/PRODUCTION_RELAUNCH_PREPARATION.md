# Production Relaunch Preparation

Last updated: 2026-07-13

## Purpose

This document prepares UMKM Builder for a future production relaunch after Railway is reactivated.

## Warning

Railway is currently inactive/expired.

Stage 9.12A is preparation-only. Actual Railway reactivation, production redeploy, and production migrations are deferred to Stage 9.12B.

Do not run production migrations until backup and migration status are verified.

Stage 9.12A is preparation only:

- Do not deploy.
- Do not run production migrations.
- Do not modify Railway, Vercel, Supabase, GitHub Actions secrets, DNS, or production secrets.
- Do not write real secret values into documentation.

Related docs:

- [DEPLOYMENT_ENVIRONMENT_MATRIX.md](./DEPLOYMENT_ENVIRONMENT_MATRIX.md)
- [PRODUCTION_ENV_MANUAL_CHECKLIST.md](./PRODUCTION_ENV_MANUAL_CHECKLIST.md)
- [PRODUCTION_SMOKE_TEST_PLAN.md](./PRODUCTION_SMOKE_TEST_PLAN.md)
- [PRODUCTION_ROLLBACK_PLAN.md](./PRODUCTION_ROLLBACK_PLAN.md)

## Current Deployment Audit

| Area | Current finding |
| --- | --- |
| Frontend build command | `npm run build` in `frontend/`, which runs `tsc -b && vite build`. |
| Frontend output | `frontend/dist`. |
| Frontend Dockerfile | `frontend/Dockerfile`, Node 24 Alpine builder, nginx runner. |
| Vercel config | `frontend/vercel.json` rewrites all routes to `index.html`; no API proxy is declared in this file. |
| Backend build command | `npm run build` in `backend/`, which runs `nest build`. |
| Backend start command | `node dist/main.js`. |
| Railway Dockerfile | Root `Dockerfile.railway`. |
| Railway entrypoint | `backend/docker-entrypoint.sh`. Runs `npx prisma migrate deploy` when `RUN_MIGRATIONS=true`. |
| Railway health check | `/health/ready` in `railway.json`. |
| Backend global API prefix | `/api/v1`; health routes are excluded from prefix. |
| CORS config | `CORS_ORIGINS` comma-separated list in backend `main.ts`. |
| API URL strategy | Frontend reads `VITE_API_URL`, default `/api/v1`. |
| Prisma datasource | `DATABASE_URL` and `DIRECT_URL` in `backend/prisma/schema.prisma`. |
| Latest migration folder | `20260702090000_add_theme_hero_media`. |
| Supabase storage | Backend supports `STORAGE_DRIVER=supabase` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, and optional public base URL. |
| GitHub workflows | Build/test/smoke/docker workflows exist. VPS deploy workflow also exists and triggers on main push when VPS secrets are configured. |

## Environment Variable Inventory

Never store real secrets in docs.

### Vercel / Frontend

| Variable | Required | Purpose | Example | Risk if missing | Validation |
| --- | --- | --- | --- | --- | --- |
| `VITE_API_URL` | Yes | Browser API target. | `https://<railway-backend>/api/v1` | Frontend cannot call backend or calls wrong host. | Login/dashboard network requests succeed. |
| `VITE_GOOGLE_CLIENT_ID` | Required if Google login enabled | Google Identity Services browser client id. | `<client-id>.apps.googleusercontent.com` | Google login button fails or token audience mismatch. | Google login smoke test. |

### Railway / Backend

| Variable | Required | Purpose | Example | Risk if missing | Validation |
| --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | Yes | Production mode and validation. | `production` | Production validations may not run. | Startup logs and env validation. |
| `PORT` | Platform-provided | HTTP bind port. | `${PORT}` | Service may not bind. | Railway health check passes. |
| `DATABASE_URL` | Yes | Runtime Prisma connection. | `postgresql://***REDACTED***` | Backend cannot read/write DB. | `/health/ready`. |
| `DIRECT_URL` | Yes | Prisma migration/direct connection. | `postgresql://***REDACTED***` | Migration status/deploy may fail. | `prisma migrate status`. |
| `JWT_ACCESS_SECRET` | Yes | Access token signing. | `***REDACTED-32-PLUS-CHARS***` | Login/session invalid or backend refuses startup. | Login smoke test. |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing. | `***REDACTED-32-PLUS-CHARS***` | Refresh fails or backend refuses startup. | Refresh smoke test. |
| `JWT_ACCESS_EXPIRES_IN` | Optional | Access token TTL. | `15m` | Unexpected session lifetime. | Auth refresh behavior. |
| `JWT_REFRESH_EXPIRES_IN_DAYS` | Optional | Refresh token TTL. | `30` | Unexpected session lifetime. | Login after refresh. |
| `CORS_ORIGINS` | Yes | Allowed browser origins. | `https://<vercel-domain>` | Browser CORS failure. | Browser request from Vercel. |
| `ROOT_DOMAIN` | Yes | Root domain/session assumptions. | `<root-domain>` | Cookie/public URL behavior may be wrong. | Login and public route test. |
| `APP_PUBLIC_URL` | Yes | Links in emails and app references. | `https://<vercel-domain>` | Emails point to wrong host. | Email link inspection. |
| `GOOGLE_CLIENT_ID` | Required if Google login enabled | Backend Google token audience. | `<client-id>.apps.googleusercontent.com` | Google login fails. | Google login smoke test. |
| `AUTH_TOKEN_RESPONSE_ENABLED` | Optional | Token response compatibility flag. | `false` | Auth response mismatch if frontend expects alternate behavior. | Login smoke test. |
| `RUN_MIGRATIONS` | Yes, risky | Controls startup migration deploy. | `false` until status/backup verified | Accidental migration before backup. | Railway logs. |
| `STORAGE_DRIVER` | Yes | Upload storage adapter. | `supabase` | Local/none storage causes non-durable or failed uploads. | `/health/storage`. |
| `SUPABASE_URL` | Required if storage is Supabase | Supabase project URL. | `https://<project>.supabase.co` | Storage adapter fails. | `/health/storage`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required if storage is Supabase | Backend-only service role key. | `***REDACTED***` | Upload/delete fails. | Upload and delete smoke test. |
| `SUPABASE_STORAGE_BUCKET` | Required if storage is Supabase | Bucket name. | `tenant-assets` | Upload paths fail. | Upload smoke test. |
| `SUPABASE_STORAGE_PUBLIC_BASE_URL` | Optional | Public URL override. | `https://<project>.supabase.co/storage/v1/object/public/tenant-assets` | Public images may use default SDK URL behavior. | Public image render. |
| `RESEND_API_KEY` | Optional/deferred | Email provider API key. | `***REDACTED***` | Email flows disabled or fail. | Email integration test after activation. |
| `EMAIL_FROM` | Optional/deferred | Sender address. | `UMKM Builder <noreply@example.com>` | Email rejected or wrong sender. | Email delivery test. |
| `CACHE_DRIVER` | Optional | Cache config. | `none` | Health cache state not configured. | `/health/cache`. |
| `MALWARE_SCAN_ENABLED` | Optional | Upload scanning toggle. | `false` | Upload policy mismatch. | Upload test. |

## Production Architecture Mapping

Expected production flow:

```text
User browser
  -> Vercel frontend
  -> Railway backend API
  -> Supabase Postgres
  -> Supabase Storage
```

Local Docker flow:

```text
Browser
  -> nginx on localhost
  -> frontend container
  -> backend container
  -> postgres container
  -> local uploads volume when enabled
```

Failure points:

- Vercel can load but API calls fail if `VITE_API_URL` points to localhost or wrong Railway URL.
- Railway backend can start but fail readiness if Supabase DB connection is wrong.
- Browser can be blocked if `CORS_ORIGINS` omits the Vercel origin.
- Uploads can fail if Supabase storage env values or bucket policy are wrong.
- Public images can break if storage public URL or bucket policy is wrong.
- Publish/public routes can appear broken if frontend points to old backend.

## Supabase Readiness Checklist

Verify manually after Railway/Supabase access is ready:

1. Supabase project is active.
2. Supabase Postgres is reachable.
3. Runtime `DATABASE_URL` uses the intended pooler/connection mode.
4. `DIRECT_URL` is valid for Prisma migration checks.
5. Prisma migration status is known before deploy.
6. `tenant-assets` bucket exists.
7. Bucket public/private policy matches public template rendering.
8. `SUPABASE_SERVICE_ROLE_KEY` is configured only in Railway backend.
9. Upload pipeline can create optimized image variants.
10. Public Supabase image URLs render in Restaurant Premium, Cafe Premium, and Free templates.

Future commands only after access is approved:

```powershell
npm --prefix backend exec prisma migrate status
npm --prefix backend run prisma:deploy
```

Do not run production migration until backup and migration status are verified.

## Prisma / Migration Readiness

Local schema audit:

- `backend/prisma/schema.prisma` uses `DATABASE_URL`.
- `backend/prisma/schema.prisma` uses `DIRECT_URL`.
- Migrations exist.
- Latest migration folder: `20260702090000_add_theme_hero_media`.

Future production migration sequence:

1. Confirm Supabase backup/snapshot.
2. Confirm `DATABASE_URL` and `DIRECT_URL`.
3. Run migration status only.
4. Review pending migrations.
5. Approve migration window.
6. Run `npm --prefix backend run prisma:deploy` or allow Railway entrypoint migration only after approval.
7. Validate `/health/ready`.

Rollback warning:

- Code rollback does not automatically roll back database schema.
- Database restore must be handled as a separate, explicit incident action.

## Railway Reactivation Runbook

Do not execute in Stage 9.12A.

1. Confirm Railway billing/project is active.
2. Confirm backend service still exists.
3. Confirm deployment source is GitHub repo `roydavita-devOps/myproject`.
4. Confirm Railway uses root `Dockerfile.railway`.
5. Confirm health check path `/health/ready`.
6. Set or verify env variables from the inventory.
7. Keep `RUN_MIGRATIONS=false` until backup and migration status are verified.
8. Redeploy backend only after env review.
9. Validate backend logs.
10. Validate `https://<railway-backend>/health/ready`.
11. Validate `https://<railway-backend>/health/storage`.
12. Run migration status after backup confirmation.
13. Run migration deploy only after approval.
14. Validate API auth endpoints.
15. Validate CORS from Vercel.
16. Validate upload/storage.
17. Validate public site routes.
18. Validate publish flow.
19. Validate Restaurant Premium.
20. Validate Cafe Premium.
21. Validate Free template groups.
22. Run production smoke test checklist.

Warnings:

- Do not run migrations before backup and migration status are confirmed.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in Vercel or frontend.
- Do not point Vercel `VITE_API_URL` to localhost.
- Do not leave only localhost origins in production `CORS_ORIGINS`.

## Vercel Relaunch Checklist

Do not deploy in Stage 9.12A.

1. Confirm Vercel project.
2. Confirm GitHub branch source.
3. Confirm build command `npm run build`.
4. Confirm output directory `dist`.
5. Confirm `VITE_API_URL`.
6. Confirm `VITE_GOOGLE_CLIENT_ID` if Google login is enabled.
7. Confirm frontend production URL.
8. Confirm Railway backend URL.
9. Confirm `CORS_ORIGINS` on Railway includes Vercel production URL.
10. Redeploy frontend only after backend health is OK.

## CORS / API Alignment Matrix

| Environment | Frontend URL | Backend URL | CORS origin expected | API base |
| --- | --- | --- | --- | --- |
| Local nginx | `http://localhost` | `http://localhost` | `http://localhost` | `/api/v1` |
| Local Vite | `http://localhost:5173` | `http://localhost:4000` or nginx | `http://localhost:5173` | `http://localhost:4000/api/v1` or `/api/v1` |
| Vercel production | `https://<vercel-production-domain>` | `https://<railway-backend-domain>` | `https://<vercel-production-domain>` | `https://<railway-backend-domain>/api/v1` unless a proxy is approved |
| Vercel preview | `https://<vercel-preview-domain>` | `https://<railway-backend-domain>` | Preview origin if enabled | Same as production API strategy |

Endpoints to validate:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/google`
- `GET /api/v1/websites`
- Upload endpoints
- Public site endpoints
- `/health/ready`
- `/health/storage`

## Post-Reactivation Smoke Test Plan

Use [PRODUCTION_SMOKE_TEST_PLAN.md](./PRODUCTION_SMOKE_TEST_PLAN.md).

Minimum coverage:

- Health.
- Login/register if safe.
- Google login if configured.
- Dashboard.
- Business information save.
- Slug validation.
- Template selection modal.
- Restaurant Premium.
- Cafe Premium.
- Free grouped templates.
- Upload/storage.
- Publish readiness.
- Publish and public route.
- Logout/session behavior.

## Rollback Plan

Use [PRODUCTION_ROLLBACK_PLAN.md](./PRODUCTION_ROLLBACK_PLAN.md).

Minimum rollback paths:

- Revert Railway deployment to previous deployment.
- Revert Vercel deployment to previous deployment.
- Revert Git commit only after approval.
- Restore Supabase backup only after impact review.
- Revert env variable changes.
- Keep Supabase storage objects intact unless exact problem paths are known.

## Risk Register

| Risk | Severity | Likelihood | Impact | Mitigation | Validation | Owner/action |
| --- | --- | --- | --- | --- | --- | --- |
| Railway inactive/billing not restored | High | High | Backend cannot redeploy. | Defer 9.12B until Railway active. | Railway dashboard. | Product owner. |
| Railway env missing/outdated | High | Medium | Backend fails or wrong services used. | Use env inventory. | `/health/ready`, logs. | Operator. |
| Vercel points to old backend URL | High | Medium | Frontend API calls fail or use stale backend. | Verify `VITE_API_URL`. | Browser network tab. | Operator. |
| CORS mismatch | High | Medium | Browser cannot call backend. | Align `CORS_ORIGINS`. | Login from Vercel. | Operator. |
| Prisma migrations pending/failed | High | Medium | Schema/app mismatch. | Backup then status before deploy. | `prisma migrate status`. | Operator/DB owner. |
| Supabase DB unreachable | High | Medium | Backend readiness fails. | Verify URLs and pooler mode. | `/health/ready`. | Operator. |
| Supabase storage bucket/policy mismatch | High | Medium | Uploads or public images fail. | Verify bucket and public policy. | `/health/storage`, upload smoke. | Operator. |
| Google OAuth domain mismatch | Medium | Medium | Google login fails. | Add approved Vercel domain in Google console. | Google login smoke. | Product owner/operator. |
| Large JS bundle warning remains | Low | High | Performance risk, not launch blocker. | Track later code splitting. | Build output. | Engineering. |
| Local-only changes not production validated | Medium | High while Railway inactive | Unknown production behavior. | Run 9.12B validation after reactivation. | Production smoke plan. | Engineering/operator. |
| Public route differs in production | High | Medium | Published sites fail. | Validate public slug after deploy. | Public site smoke. | Operator. |
| Server-side publish readiness hardening future | Medium | Medium | UI gate only may be bypassable by API clients. | Track future backend hardening. | API review. | Engineering. |

## Go / No-Go

Go for preparation package review.

No-Go for production relaunch until:

- Railway is active.
- Env inventory is verified.
- Supabase DB/storage is verified.
- Migration status and backup are confirmed.
- 9.12B execution is explicitly approved.
