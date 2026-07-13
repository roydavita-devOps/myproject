# Production Env Manual Checklist

Last updated: 2026-07-13

## Warning

Railway is currently inactive/expired.

Stage 9.12A and 9.12A.1 are preparation-only. Actual Railway reactivation, production redeploy, and production migrations are deferred to Stage 9.12B.

Do not paste real secret values into this file.

## 1. Railway Backend Env Checklist

- [ ] Railway project is active.
- [ ] Backend service exists.
- [ ] Service deploy source points to the correct GitHub repository.
- [ ] Railway uses root `Dockerfile.railway`.
- [ ] Health check path is `/health/ready`.
- [ ] `NODE_ENV=production`.
- [ ] `DATABASE_URL` is set in Railway.
- [ ] `DIRECT_URL` is set in Railway.
- [ ] `JWT_ACCESS_SECRET` is set and is not a placeholder.
- [ ] `JWT_REFRESH_SECRET` is set and is not a placeholder.
- [ ] `CORS_ORIGINS` includes the Vercel production URL.
- [ ] `ROOT_DOMAIN` matches the intended production domain strategy.
- [ ] `APP_PUBLIC_URL` points to the Vercel production frontend.
- [ ] `GOOGLE_CLIENT_ID` is set if Google login is enabled.
- [ ] `RUN_MIGRATIONS=false` before first relaunch check.
- [ ] `STORAGE_DRIVER=supabase` for durable production uploads.
- [ ] `SUPABASE_URL` is set in Railway only.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Railway only.
- [ ] `SUPABASE_STORAGE_BUCKET=tenant-assets` or approved bucket name.
- [ ] `SUPABASE_STORAGE_PUBLIC_BASE_URL` is set if public URL override is required.
- [ ] `RESEND_API_KEY` is set only if production email is being activated.
- [ ] `EMAIL_FROM` is set only if production email is being activated.

## 2. Vercel Frontend Env Checklist

- [ ] Vercel project is active.
- [ ] Vercel project points to the correct GitHub repository and branch.
- [ ] Build command is `npm run build`.
- [ ] Output directory is `dist`.
- [ ] `VITE_API_URL` points to the correct Railway backend API or confirmed proxy.
- [ ] `VITE_API_URL` does not point to localhost.
- [ ] `VITE_GOOGLE_CLIENT_ID` is set if Google login is enabled.
- [ ] No backend-only secrets are present in Vercel env.
- [ ] Vercel production domain is known and recorded in deployment notes.

## 3. Supabase Database / Storage Checklist

- [ ] Supabase project is active.
- [ ] Supabase Postgres database is reachable.
- [ ] Runtime database URL is correct for Railway backend.
- [ ] Direct migration URL is correct for Prisma migration checks.
- [ ] Database backup/snapshot is available before any migration.
- [ ] Prisma migration status is reviewed before migration deploy.
- [ ] `tenant-assets` bucket exists.
- [ ] Bucket public/private policy matches app rendering expectation.
- [ ] Upload test can create WebP variants.
- [ ] Public image URL renders from Vercel public site.

## 4. Google OAuth Checklist

- [ ] Google OAuth client exists.
- [ ] Vercel production domain is in authorized JavaScript origins.
- [ ] Railway backend URL is allowed if required by OAuth configuration.
- [ ] `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` refer to the same approved client.
- [ ] Google login test account can sign in.
- [ ] Logout disables Google auto-select in the app.

## 5. CORS / API URL Checklist

- [ ] Railway `CORS_ORIGINS` includes Vercel production origin.
- [ ] Railway `CORS_ORIGINS` includes approved Vercel preview origin if previews are used.
- [ ] Localhost origins are not the only production CORS origins.
- [ ] Frontend API base path is `/api/v1`.
- [ ] Auth endpoints work from browser.
- [ ] Upload endpoints work from browser.
- [ ] Public site endpoints work from browser.

## 6. Migration Safety Checklist

- [ ] Production backup/snapshot exists.
- [ ] `prisma migrate status` has been run against production after approval.
- [ ] Pending migrations are reviewed.
- [ ] Maintenance window is approved if needed.
- [ ] `RUN_MIGRATIONS` behavior is understood before redeploy.
- [ ] No destructive Prisma command is planned.
- [ ] Rollback/restore owner is identified.

## 7. Pre-Deploy Approval Checklist

- [ ] Product owner approved Stage 9.12B execution.
- [ ] Railway is active.
- [ ] Vercel env has been reviewed.
- [ ] Railway env has been reviewed.
- [ ] Supabase DB/storage has been reviewed.
- [ ] Smoke test plan is ready.
- [ ] Rollback plan is ready.
- [ ] No real secret values are committed to docs.
