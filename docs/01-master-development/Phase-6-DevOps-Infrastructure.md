# UMKM Website Builder SaaS - Phase 6 DevOps & Infrastructure

## 1. Docker Configuration

Phase 6 adds a production-oriented Docker Compose stack:

```text
docker-compose.yml
  |
  +-- postgres   PostgreSQL 17 with named volume
  +-- backend    NestJS API on port 4000 inside the network
  +-- frontend   React static build served by Nginx inside the network
  +-- nginx      public reverse proxy on ports 80 and 443
```

### Files Added

```text
.env.example
docker-compose.yml
backend/
  Dockerfile
  .dockerignore
  docker-entrypoint.sh
  prisma/migrations/20260602181100_init/migration.sql
frontend/
  Dockerfile
  .dockerignore
  nginx-spa.conf
nginx/
  nginx.conf
  conf.d/app.conf
  certs/.gitkeep
```

### Backend Container

The backend uses a multi-stage Node 24 Alpine image:

1. Install dependencies.
2. Generate Prisma Client.
3. Build NestJS TypeScript.
4. Install production dependencies.
5. Copy compiled `dist`, Prisma schema, Prisma Client, and migrations.
6. Run `prisma migrate deploy` at container startup when `RUN_MIGRATIONS=true`.
7. Start `node dist/main.js`.

Prisma CLI is kept in backend production dependencies because the container runs migration deploy during startup.

### Frontend Container

The frontend uses a multi-stage build:

1. Build React/Vite static assets.
2. Serve `dist` from an Nginx Alpine image.
3. Use SPA fallback to `index.html`.

`VITE_API_URL` defaults to `/api/v1`, so the browser calls the same public origin and Nginx proxies API requests to the backend.

---

## 2. Nginx Configuration

The public Nginx container is the only public entrypoint.

```text
http://localhost/
  -> frontend service

http://localhost/api/v1/*
  -> backend service

http://localhost/health
  -> Nginx health response
```

### Reverse Proxy Behavior

Nginx forwards these headers to the backend:

- `Host`
- `X-Real-IP`
- `X-Forwarded-For`
- `X-Forwarded-Proto`

The `Host` header is important for tenant/custom-domain resolution.

### TLS

The current config exposes port 443 and mounts `nginx/certs`, but TLS certificate server blocks are not enabled yet. For production, add a domain-specific HTTPS server block after certificates are provisioned by Certbot, Cloudflare Origin Certificates, or another certificate workflow.

---

## 3. Environment Variables

Root `.env.example`:

```text
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-me-postgres
POSTGRES_DB=umkm_builder

JWT_ACCESS_SECRET=change-me-long-random-access-secret
JWT_REFRESH_SECRET=change-me-long-random-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN_DAYS=30

ROOT_DOMAIN=localhost
CORS_ORIGINS=http://localhost,http://localhost:5173
VITE_API_URL=/api/v1
RUN_MIGRATIONS=true

HTTP_PORT=80
HTTPS_PORT=443
```

For production, create `.env` from `.env.example` and replace all secrets. Do not deploy with the example JWT or database passwords.

Recommended production values:

- `ROOT_DOMAIN=yourdomain.com`
- `CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com`
- `VITE_API_URL=/api/v1`
- strong random values for `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`

---

## 4. Single Command Deployment

Local or VPS deployment:

```text
docker compose up -d
```

When using the provided example env explicitly:

```text
docker compose --env-file .env.example up -d
```

Production release flow:

1. Copy/update source on VPS.
2. Ensure `.env` exists with production secrets.
3. Build images:
   ```text
   docker compose build
   ```
4. Start or update stack:
   ```text
   docker compose up -d
   ```
5. Check status:
   ```text
   docker compose ps
   ```
6. Check backend logs:
   ```text
   docker compose logs --tail=50 backend
   ```

---

## 5. Database Migration Strategy

The first Prisma migration has been generated at:

```text
backend/prisma/migrations/20260602181100_init/migration.sql
```

The backend entrypoint runs:

```text
npx prisma migrate deploy
```

This makes container startup apply pending migrations automatically. For production, keep this enabled for normal additive migrations, but review destructive migrations manually before deploying.

Manual migration command:

```text
docker compose exec backend npx prisma migrate deploy
```

---

## 6. Verification Results

Commands run:

```text
docker compose --env-file .env.example config
npm run build
npm test
docker compose --env-file .env.example build
docker compose --env-file .env.example up -d
docker compose --env-file .env.example ps
docker compose --env-file .env.example logs --tail=30 backend
```

Results:

- Compose config is valid.
- Frontend production build succeeds.
- Backend build succeeds.
- Backend unit tests pass.
- Frontend and backend Docker images build successfully.
- Production stack starts successfully.
- Postgres container is healthy.
- Backend container starts NestJS successfully.
- Nginx `/health` returns HTTP 200.
- Frontend root `/` returns HTTP 200.
- API route `/api/v1/public/site/demo` reaches backend through Nginx and returns expected 404 because no demo tenant exists.

Current local URLs:

- Frontend through production Nginx: `http://localhost/`
- Nginx health: `http://localhost/health`
- API base: `http://localhost/api/v1`

---

## 7. Operational Notes

- The Docker stack currently uses one PostgreSQL container and a named Docker volume. Backups are still a Phase 8 operational concern.
- Port 80 and 443 are bound by the Nginx container. Stop conflicting local services before running the production stack.
- Custom tenant domains will route through the same frontend/backend pair because Nginx preserves the `Host` header.
- For real custom domains, DNS and TLS automation must be added before commercial production use.

## Phase 6 Approval Gate

Phase 6 DevOps & Infrastructure is complete. Do not proceed to Phase 7: CI/CD until approval is given.
