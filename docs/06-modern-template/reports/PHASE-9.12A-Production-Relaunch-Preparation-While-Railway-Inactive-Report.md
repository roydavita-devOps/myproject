# Phase 9.12A - Production Relaunch Preparation While Railway Inactive Report

Date: 2026-07-13

## 1. Executive Summary

Stage 9.12A is implemented as a preparation-only package.

No production deployment was attempted. No Railway, Vercel, Supabase, GitHub Actions secrets, DNS, production environment variables, or production database state were modified. No production migration was run.

The stage produced a relaunch preparation package for future Stage 9.12B execution after Railway is reactivated.

## 2. Scope

Included:

- Deployment file audit.
- Environment variable inventory.
- Production architecture mapping.
- Supabase readiness checklist.
- Prisma/migration readiness notes.
- Railway reactivation runbook.
- Vercel relaunch checklist.
- CORS/API alignment checklist.
- Post-reactivation smoke test plan.
- Rollback plan.
- Risk register.
- Documentation updates.

Excluded:

- Railway reactivation.
- Railway deployment.
- Vercel production deployment.
- Production migrations.
- Production seed/reset.
- Production secret changes.
- Supabase database/storage changes.
- GitHub Actions secret changes.
- DNS/custom domain changes.
- Payment, subscription, marketplace, entitlement, hosting renewal, luxury, or new template work.

## 3. Current Deployment Audit

| Area | Finding |
| --- | --- |
| Root smoke command | `npm run smoke-test` -> `playwright test --config=playwright.config.ts`. |
| Frontend build | `npm run build` in `frontend/` -> `tsc -b && vite build`. |
| Frontend Docker | `frontend/Dockerfile`, Node 24 Alpine builder, nginx runner. |
| Frontend Vercel config | `frontend/vercel.json` rewrites SPA routes to `index.html`; no API proxy is declared there. |
| Backend build | `npm run build` in `backend/` -> `nest build`. |
| Backend start | `node dist/main.js`. |
| Railway build | `railway.json` uses `Dockerfile.railway`. |
| Railway entrypoint | `backend/docker-entrypoint.sh`. |
| Railway migration behavior | Entrypoint runs `npx prisma migrate deploy` when `RUN_MIGRATIONS=true`. |
| Railway health | `/health/ready`, timeout 300 seconds. |
| Backend API prefix | `/api/v1`, with health routes excluded. |
| CORS | Backend reads comma-separated `CORS_ORIGINS`. |
| API URL strategy | Frontend reads `VITE_API_URL`, default `/api/v1`. |
| Prisma schema | Uses `DATABASE_URL` and `DIRECT_URL`. |
| Latest migration | `20260702090000_add_theme_hero_media`. |
| Supabase storage | Supported through `STORAGE_DRIVER=supabase`; service role key is backend-only. |
| GitHub workflows | Backend build, frontend build, tests, Docker image build, smoke test, and VPS deploy workflow exist. |

## 4. Environment Variable Inventory

Full inventory is documented in:

- `docs/01-architecture/DEPLOYMENT_ENVIRONMENT_MATRIX.md`
- `docs/01-architecture/PRODUCTION_RELAUNCH_PREPARATION.md`

Key variables:

| Area | Variables |
| --- | --- |
| Vercel/frontend | `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID` |
| Railway/backend | `NODE_ENV`, `PORT`, `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS`, `ROOT_DOMAIN`, `APP_PUBLIC_URL`, `GOOGLE_CLIENT_ID`, `RUN_MIGRATIONS` |
| Supabase storage | `STORAGE_DRIVER`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, `SUPABASE_STORAGE_PUBLIC_BASE_URL` |
| Email deferred | `RESEND_API_KEY`, `EMAIL_FROM` |
| Optional | `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN_DAYS`, `AUTH_TOKEN_RESPONSE_ENABLED`, `CACHE_DRIVER`, `MALWARE_SCAN_ENABLED` |

No real secret values were added.

## 5. Production Architecture Mapping

Expected production flow:

```text
User browser
  -> Vercel frontend
  -> Railway backend API
  -> Supabase Postgres
  -> Supabase Storage
```

Key risk:

- `frontend/vercel.json` currently does not define an API proxy. If production uses `VITE_API_URL=/api/v1`, confirm another proxy strategy exists. Otherwise use an absolute Railway API URL such as `https://<railway-backend-domain>/api/v1`.

## 6. Supabase Readiness Checklist

Prepared checklist:

1. Supabase project active.
2. Database reachable.
3. Runtime pooler endpoint correct.
4. `DATABASE_URL` and `DIRECT_URL` correct.
5. Prisma migration status verified.
6. `tenant-assets` bucket exists.
7. Bucket policy matches public rendering expectation.
8. `SUPABASE_SERVICE_ROLE_KEY` exists only in Railway backend.
9. Upload pipeline can create image variants.
10. Public image URLs render in templates.

No Supabase production connection was attempted.

## 7. Prisma / Migration Readiness

Findings:

- Migrations exist.
- Latest migration folder: `20260702090000_add_theme_hero_media`.
- Schema uses `DATABASE_URL` and `DIRECT_URL`.
- Railway entrypoint can run migrations automatically when `RUN_MIGRATIONS=true`.

Recommendation:

- For relaunch, keep `RUN_MIGRATIONS=false` until backup and `prisma migrate status` have been reviewed.
- Run production migration only after explicit Stage 9.12B approval.

## 8. Railway Reactivation Runbook

Documented in:

- `docs/01-architecture/PRODUCTION_RELAUNCH_PREPARATION.md`

Core sequence:

1. Reactivate/confirm Railway.
2. Confirm service and GitHub source.
3. Verify env variables.
4. Keep migration disabled until backup/status.
5. Redeploy backend after approval.
6. Validate `/health/ready`.
7. Validate `/health/storage`.
8. Verify migration status.
9. Run migration only after approval.
10. Run production smoke test.

## 9. Vercel Relaunch Checklist

Documented in:

- `docs/01-architecture/PRODUCTION_RELAUNCH_PREPARATION.md`
- `docs/01-architecture/DEPLOYMENT_ENVIRONMENT_MATRIX.md`

Critical checks:

- Confirm `VITE_API_URL`.
- Confirm Google client ID.
- Confirm frontend production URL.
- Confirm Railway backend URL.
- Confirm Railway `CORS_ORIGINS` includes Vercel origin.
- Redeploy frontend only after backend health is OK.

## 10. CORS / API Alignment Checklist

Documented matrix includes:

- Local nginx.
- Local Vite.
- Vercel production.
- Vercel preview.
- Railway backend.

Critical endpoints:

- `/api/v1/auth/login`
- `/api/v1/auth/refresh`
- `/api/v1/auth/google`
- `/api/v1/websites`
- Upload endpoints.
- Public site endpoints.
- `/health/ready`
- `/health/storage`

## 11. Post-Reactivation Smoke Test Plan

Created:

- `docs/01-architecture/PRODUCTION_SMOKE_TEST_PLAN.md`

Coverage:

- Health.
- Login.
- Register if safe.
- Google login if configured.
- Dashboard.
- Business information.
- Slug.
- Template modal.
- Restaurant Premium.
- Cafe Premium.
- Free grouped templates.
- Upload/storage.
- Publish readiness.
- Publish/public route.
- Unpublish.
- Logout/session.

## 12. Rollback Plan

Created:

- `docs/01-architecture/PRODUCTION_ROLLBACK_PLAN.md`

Rollback paths:

- Railway previous deployment.
- Vercel previous deployment.
- Git revert after approval.
- Env variable rollback.
- Supabase backup restore only after impact assessment.
- Storage objects preserved by default.

## 13. Risk Register

Documented in:

- `docs/01-architecture/PRODUCTION_RELAUNCH_PREPARATION.md`

Key risks:

- Railway inactive/billing not restored.
- Env values missing/outdated.
- Vercel points to old backend.
- CORS mismatch.
- Prisma migration unknown/failed.
- Supabase DB unreachable.
- Supabase storage bucket/policy mismatch.
- Google OAuth domain mismatch.
- Large JS bundle warning remains.
- Local-only changes not production validated.
- Public route differs in production.
- Server-side publish readiness hardening remains future work.

## 14. Documentation Updates

Created:

- `docs/01-architecture/PRODUCTION_RELAUNCH_PREPARATION.md`
- `docs/01-architecture/DEPLOYMENT_ENVIRONMENT_MATRIX.md`
- `docs/01-architecture/PRODUCTION_SMOKE_TEST_PLAN.md`
- `docs/01-architecture/PRODUCTION_ROLLBACK_PLAN.md`

Updated:

- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/06-modern-template/README.md`

## 15. Files Modified

- `docs/01-architecture/PRODUCTION_RELAUNCH_PREPARATION.md`
- `docs/01-architecture/DEPLOYMENT_ENVIRONMENT_MATRIX.md`
- `docs/01-architecture/PRODUCTION_SMOKE_TEST_PLAN.md`
- `docs/01-architecture/PRODUCTION_ROLLBACK_PLAN.md`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/06-modern-template/README.md`
- `docs/06-modern-template/reports/PHASE-9.12A-Production-Relaunch-Preparation-While-Railway-Inactive-Report.md`

## 16. Local Validation Performed

Commands run:

```powershell
npm --prefix backend exec prisma validate
```

Result:

- Failed because Prisma looked for `schema.prisma` from the root context and did not find it. This was a command-location issue, not a schema validation result.

Commands run:

```powershell
npx prisma validate
```

from `backend/` with dummy local-only `DATABASE_URL` and `DIRECT_URL`.

Result:

- Passed. Schema at `backend/prisma/schema.prisma` is valid.

Commands run:

```powershell
git diff -- docs
```

Result:

- Documentation-only diff reviewed.

Not run:

- Frontend test/lint/build.
- Backend build.
- Docker rebuild.
- Smoke tests.

Reason:

- Stage 9.12A is documentation/runbook preparation only and no application code was changed.

## 17. Deferred Items

Deferred to Stage 9.12B or later:

- Railway reactivation.
- Railway backend redeploy.
- Vercel production redeploy.
- Production migration status check against Supabase.
- Production migration deploy.
- Supabase production connection validation.
- Production smoke test execution.
- Payment/subscription/marketplace/entitlement.
- Hosting renewal/custom domain setup.
- Backend refactor or schema changes.

## 18. Go / No-Go Decision

Go for product owner review of the preparation package.

No-Go for production relaunch until:

- Railway is active.
- Stage 9.12B is explicitly approved.
- Production env values are verified.
- Supabase backup and migration status are confirmed.
- Backend health is green before frontend redeploy.

