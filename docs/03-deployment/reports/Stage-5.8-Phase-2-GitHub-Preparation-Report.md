# GITHUB PREPARATION REPORT

## Status

PASS - GitHub preparation for the public pilot branch model is complete.

This phase prepares source control and CI strategy only. It does not deploy Vercel, Railway, or Supabase resources.

## Branch Strategy

Required branches:

- `main`
- `staging`
- `pilot`

Branch responsibilities:

### main

- Stable integration branch.
- Source of truth for accepted implementation.
- Existing VPS deployment workflow remains limited to this branch.
- Should require pull request review before merge.

### staging

- Pre-pilot validation branch.
- Used to test migration/deployment changes before public pilot.
- CI must run backend build, frontend build, tests, Docker image build, and smoke tests.

### pilot

- Public pilot release branch.
- Used for real pilot user deployment flow.
- Must not include billing, payments, monetization, white label, or domain automation.
- CI must run backend build, frontend build, tests, Docker image build, and smoke tests.

Recommended merge flow:

```text
feature/* -> staging -> pilot -> main
```

Emergency pilot fix flow:

```text
hotfix/* -> pilot -> staging -> main
```

Branch protection recommendation:

- Require pull request before merge.
- Require status checks.
- Require branch to be up to date before merge.
- Restrict force pushes.
- Restrict deletions.
- Require linear history if the team prefers a clean audit trail.

## Environment Strategy

GitHub Environments to configure:

- `staging`
- `pilot`
- `production`

Environment purpose:

### staging

- Internal validation.
- Uses non-production database/storage.
- Can be reset safely.

### pilot

- Public pilot users.
- Uses pilot database/storage.
- Must preserve pilot user data during validation.
- Requires manual approval for deployment workflows.

### production

- Reserved for later go-live.
- Existing VPS workflow currently references `production`.
- Do not use commercial production until Production Readiness status is PASS.

Application env mapping:

- Frontend:
  - `VITE_API_URL`
- Backend:
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

## Secret Strategy

Use GitHub Environment secrets rather than repository-wide secrets for provider credentials.

Recommended staging secrets:

- `STAGING_DATABASE_URL`
- `STAGING_JWT_ACCESS_SECRET`
- `STAGING_JWT_REFRESH_SECRET`
- `STAGING_CORS_ORIGINS`
- `STAGING_ROOT_DOMAIN`
- `STAGING_VITE_API_URL`
- `STAGING_STORAGE_DRIVER`
- `STAGING_UPLOAD_PUBLIC_BASE_URL`

Recommended pilot secrets:

- `PILOT_DATABASE_URL`
- `PILOT_JWT_ACCESS_SECRET`
- `PILOT_JWT_REFRESH_SECRET`
- `PILOT_CORS_ORIGINS`
- `PILOT_ROOT_DOMAIN`
- `PILOT_VITE_API_URL`
- `PILOT_STORAGE_DRIVER`
- `PILOT_UPLOAD_PUBLIC_BASE_URL`

Provider deployment secrets to add in later phases:

- Railway token/project/service references for backend deployment.
- Vercel token/project/org references for frontend deployment.
- Supabase PostgreSQL connection string.
- Supabase Storage credentials only if storage adapter requires them.

Secret rules:

- Never commit provider tokens.
- Never put Supabase Auth or provider auth secrets into application auth flow.
- JWT secrets remain owned by NestJS.
- `DATABASE_URL` must point to standard PostgreSQL only.
- Use separate staging and pilot databases.
- Use separate staging and pilot storage buckets.

## GitHub Actions Strategy

Updated workflows:

- `backend-build.yml`
- `frontend-build.yml`
- `test.yml`
- `docker-build.yml`
- `smoke-test.yml`

Branch coverage is now:

```yaml
branches: [main, staging, pilot]
```

Workflow roles:

- Backend Build: validates NestJS compile and Prisma client generation.
- Frontend Build: validates React/Vite production build.
- Run Tests: validates backend tests and frontend type/build.
- Build Docker Images: validates Docker-compatible backend/frontend images.
- Smoke Tests: validates Docker Compose flow, health readiness, login, upload, publish, share, and mobile viewport.

Deploy workflow:

- Existing `deploy-vps.yml` remains automatic on `main` only.
- This avoids accidental staging/pilot deployment to the VPS production target.
- Future Vercel/Railway workflows should be added in later deployment phases with explicit GitHub Environment mapping.

Recommended future deployment triggers:

```text
push to staging -> deploy staging environment
push to pilot -> deploy pilot environment with manual approval
manual dispatch -> controlled redeploy
```

## Implementation Completed

Implemented:

- Updated CI branch targets from `main/develop` to `main/staging/pilot`.
- Preserved existing local Docker Compose and VPS workflow behavior.
- Prepared branch model for public pilot promotion.
- Created remote `staging` branch from current `main`.
- Created remote `pilot` branch from current `main`.

Not implemented in this phase:

- Vercel deployment.
- Railway deployment.
- Supabase PostgreSQL migration.
- Supabase Storage adapter.
- GitHub Environment creation through UI/API.

## Validation

Validation performed:

- Verified commit author and committer are `roydavita-devOps`.
- Verified working tree before implementation.
- Verified branch model after creation.
- Verified workflow files target the correct branches.

## Phase 2 Verdict

PASS.

Proceed to Phase 3 - Supabase PostgreSQL Migration after approval.

STOP.
