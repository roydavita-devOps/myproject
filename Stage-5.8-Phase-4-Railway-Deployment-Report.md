# RAILWAY DEPLOYMENT REPORT

## Status

PASS - Railway backend deployment preparation is complete.

This phase prepares backend deployment configuration and checklist only. No Railway project was created and no live Railway deployment was executed from this workspace.

## Sources Verified

Railway official documentation verified on 2026-06-03:

- Config as Code: `railway.json` can define build/deploy settings and code-defined settings override service dashboard values for the deployment.
- Dockerfile path: `build.dockerfilePath` supports non-standard Dockerfile locations.
- Healthchecks: Railway waits for the configured healthcheck path to return HTTP 200 before marking a deployment active.
- Railway injects `PORT`, and the application should listen on that variable for healthchecks and routing.

## Railway Configuration

Added root-level Railway configuration:

- `railway.json`
- `Dockerfile.railway`

### `railway.json`

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.railway",
    "watchPatterns": [
      "backend/**",
      "Dockerfile.railway",
      "railway.json"
    ]
  },
  "deploy": {
    "healthcheckPath": "/health/ready",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

### `Dockerfile.railway`

Purpose:

- Builds only the NestJS backend from monorepo root.
- Keeps Railway backend deployment independent from the frontend.
- Preserves the same production runtime shape as `backend/Dockerfile`.
- Runs `backend/docker-entrypoint.sh`, which executes `prisma migrate deploy` when `RUN_MIGRATIONS=true`.

Why a root Railway Dockerfile was added:

- The repository is a monorepo.
- Railway config points to a Dockerfile path from repo root.
- A root Dockerfile avoids ambiguity around Docker build context when using `backend/Dockerfile`.

## Backend Compatibility Review

PASS.

Backend already satisfies Railway deployment requirements:

- Docker-compatible.
- Listens on `PORT` from environment with fallback to `4000`.
- Exposes health endpoints:
  - `GET /health`
  - `GET /health/live`
  - `GET /health/ready`
- Runs Prisma migrations through `prisma migrate deploy`.
- Uses environment variables for database, JWT, CORS, storage, and root domain.
- Does not use Railway proprietary APIs.
- Does not use Railway proprietary storage.

Healthcheck selected:

```text
/health/ready
```

Reason:

- It validates database readiness.
- It prevents Railway from activating a backend that started but cannot reach PostgreSQL.

## Environment Variables

Required Railway backend variables:

```text
NODE_ENV=production
PORT=<Railway injected or explicit fallback>
DATABASE_URL=<Supabase PostgreSQL standard connection URL>
JWT_ACCESS_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN_DAYS=30
CORS_ORIGINS=<Vercel frontend URL,local/staging URLs if needed>
ROOT_DOMAIN=<pilot public root domain>
RUN_MIGRATIONS=true
STORAGE_DRIVER=local
CACHE_DRIVER=none
UPLOAD_STORAGE_PATH=/app/uploads
UPLOAD_PUBLIC_BASE_URL=
MALWARE_SCAN_ENABLED=false
```

Pilot-specific recommended values:

```text
NODE_ENV=production
RUN_MIGRATIONS=true
CACHE_DRIVER=none
STORAGE_DRIVER=local
MALWARE_SCAN_ENABLED=false
```

Important:

- `STORAGE_DRIVER=local` is acceptable only as a temporary backend runtime setting before Phase 6 storage validation.
- Railway filesystem is ephemeral unless a volume is configured.
- Public pilot uploads must not rely on Railway ephemeral filesystem long term.
- Phase 6 must introduce/validate storage abstraction for Supabase Storage -> MinIO portability.

## Deployment Checklist

### Pre-Deploy

1. Confirm latest `pilot` branch has passing CI.
2. Confirm Supabase PostgreSQL pilot database is ready.
3. Confirm `DATABASE_URL` uses standard PostgreSQL connection string.
4. Confirm `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are non-placeholder and at least 32 characters.
5. Confirm `CORS_ORIGINS` includes the Vercel frontend URL.
6. Confirm no Supabase Auth or Railway proprietary service is added.
7. Confirm `RUN_MIGRATIONS=true` for first deployment.
8. Confirm database backup exists if deploying over existing pilot data.

### Railway Service Setup

1. Create Railway project for public pilot.
2. Create backend service from GitHub repository.
3. Select branch:

```text
pilot
```

4. Ensure Railway uses config-as-code from:

```text
railway.json
```

5. Confirm build uses:

```text
Dockerfile.railway
```

6. Add required backend environment variables.
7. Deploy service.
8. Confirm healthcheck path:

```text
/health/ready
```

### Post-Deploy Validation

Validate public Railway backend URL:

```text
GET /health
GET /health/live
GET /health/ready
GET /health/database
```

Expected:

- `/health/live` returns HTTP 200.
- `/health/ready` returns HTTP 200 only if database is reachable.
- `/health/database` reports database status `ok`.

Then validate application endpoints after Vercel frontend is connected in Phase 5:

- Register.
- Login.
- Refresh token.
- Upload logo.
- Upload gallery.
- Publish website.
- Open public site.

## Rollback Plan

Railway rollback options:

1. Redeploy previous successful deployment from Railway deployment history.
2. Revert commit on `pilot` branch and redeploy.
3. Disable `RUN_MIGRATIONS` only if rolling back application code without schema changes.
4. Restore database backup if a migration caused data/schema failure.

Rollback decision rules:

- If healthcheck fails because database is unreachable, fix `DATABASE_URL` or database network first.
- If migration fails, stop deploy and restore database from pre-migration backup if needed.
- If application crashes after deploy, rollback Railway deployment to previous active version.

## Vendor Lock-In Review

PASS.

The implementation remains vendor agnostic:

- Railway config is deployment configuration only.
- No Railway SDK was added.
- No Railway API call was added to business logic.
- Backend remains Docker-compatible.
- Local `docker compose up -d` remains unchanged.
- Future VPS deployment can ignore `railway.json` and `Dockerfile.railway`.

Future VPS replacement:

- Use existing `backend/Dockerfile` and `docker-compose.yml`.
- Keep PostgreSQL through `DATABASE_URL`.
- Replace storage through env-driven storage adapter after Phase 6.
- Keep Nginx as reverse proxy.

## Validation

Commands passed:

```bash
docker build -f Dockerfile.railway -t umkm-backend-railway-check .
```

```powershell
Get-Content -Raw railway.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

Validation result:

- Railway backend image builds successfully from repository root.
- `railway.json` is valid JSON.
- Backend entrypoint, Prisma migration, and runtime command are included in the Railway image.

## Phase 4 Verdict

PASS.

Backend is ready to be connected to Railway in the public pilot flow after required Railway project variables are configured.

Proceed to Phase 5 - Vercel Frontend Deployment after approval.

STOP.
