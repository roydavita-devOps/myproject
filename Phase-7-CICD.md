# UMKM Website Builder SaaS - Phase 7 CI/CD

## 1. GitHub Repository

Repository target:

```text
https://github.com/roydavita-devOps/myproject
```

The CI/CD setup is designed for this monorepo structure:

```text
backend/
frontend/
nginx/
docker-compose.yml
.github/workflows/
scripts/deploy-vps.sh
```

---

## 2. GitHub Workflows

### Build Frontend

File:

```text
.github/workflows/frontend-build.yml
```

Runs on:

- Push to `main` or `develop` when frontend files change.
- Pull request to `main` or `develop` when frontend files change.

Steps:

1. Checkout code.
2. Setup Node.js 24.
3. Run `npm ci`.
4. Run `npm run build`.

### Build Backend

File:

```text
.github/workflows/backend-build.yml
```

Runs on:

- Push to `main` or `develop` when backend files change.
- Pull request to `main` or `develop` when backend files change.

Steps:

1. Checkout code.
2. Setup Node.js 24.
3. Run `npm ci`.
4. Run `npx prisma generate`.
5. Run `npm run build`.

### Run Tests

File:

```text
.github/workflows/test.yml
```

Runs on:

- Push to `main` or `develop`.
- Pull request to `main` or `develop`.

Jobs:

- Backend tests with `npm test`.
- Frontend build/typecheck with `npm run build`.

### Docker Build Pipeline

File:

```text
.github/workflows/docker-build.yml
```

Runs on:

- Pull request to `main`: build only, no push.
- Push to `main`: build and push images.
- Tags matching `v*`: build and push release images.
- Manual dispatch.

Images:

```text
ghcr.io/roydavita-devOps/myproject/backend
ghcr.io/roydavita-devOps/myproject/frontend
```

Tags:

- Branch name
- Git tag
- `sha-<commit>`
- `latest` on default branch

### VPS Deployment Pipeline

File:

```text
.github/workflows/deploy-vps.yml
```

Runs on:

- Push to `main`.
- Manual dispatch with branch input.

Deployment behavior:

1. Connect to VPS over SSH.
2. Enter app directory.
3. Fetch and pull the target branch.
4. Ensure `.env` exists.
5. Run `docker compose build`.
6. Run `docker compose up -d`.
7. Run `docker compose ps`.
8. Check `http://localhost/health` when `curl` is available.

---

## 3. Required GitHub Secrets

Set these in GitHub repository settings:

```text
VPS_HOST
VPS_PORT
VPS_USER
VPS_SSH_PRIVATE_KEY
VPS_APP_DIR
```

Recommended values:

- `VPS_HOST`: VPS IP or hostname.
- `VPS_PORT`: SSH port, usually `22`.
- `VPS_USER`: Linux user with access to Docker.
- `VPS_SSH_PRIVATE_KEY`: private key for that user.
- `VPS_APP_DIR`: app directory, for example `/opt/umkm-website-builder`.

The VPS app directory must already contain a clone of:

```text
git@github.com:roydavita-devOps/myproject.git
```

The VPS must also have a production `.env` file based on `.env.example`.

---

## 4. VPS Preparation

One-time setup on the VPS:

```text
sudo mkdir -p /opt/umkm-website-builder
sudo chown -R $USER:$USER /opt/umkm-website-builder
git clone git@github.com:roydavita-devOps/myproject.git /opt/umkm-website-builder
cd /opt/umkm-website-builder
cp .env.example .env
```

Then edit `.env` and replace:

- `POSTGRES_PASSWORD`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ROOT_DOMAIN`
- `CORS_ORIGINS`

Docker must be installed and the deploy user must be able to run:

```text
docker compose ps
```

---

## 5. Branch Strategy

Recommended branches:

```text
main       production branch
develop    integration branch
feature/*  feature work
fix/*      bug fixes
release/*  optional release preparation
```

Rules:

- Pull requests into `develop` for normal feature work.
- Pull requests from `develop` into `main` for production release.
- Direct pushes to `main` should be avoided except for emergency fixes.
- Tag production releases as `vX.Y.Z`.

---

## 6. Pull Request Workflow

Before merge:

1. Frontend build must pass when frontend files changed.
2. Backend build must pass when backend files changed.
3. Test workflow must pass.
4. Docker build must pass for PRs to `main`.
5. Reviewer checks tenant isolation and RBAC impact for backend changes.

Recommended PR checklist:

```text
- [ ] Build passes
- [ ] Tests pass
- [ ] Tenant isolation considered
- [ ] RBAC impact considered
- [ ] Migration impact reviewed
- [ ] Docker/deployment impact reviewed
```

---

## 7. Release Strategy

### Standard Release

1. Merge approved changes into `develop`.
2. Validate staging or local Docker stack.
3. Open PR from `develop` to `main`.
4. Merge after all checks pass.
5. GitHub Actions deploys `main` to VPS.
6. Create a tag:
   ```text
   git tag v0.1.0
   git push origin v0.1.0
   ```

### Rollback

If a release fails after deployment:

1. SSH into VPS.
2. Checkout previous known-good commit or tag.
3. Run:
   ```text
   docker compose build
   docker compose up -d
   ```

Database rollback should not be automatic. Destructive migrations require manual review and backups before deployment.

---

## 8. Verification

Local verification completed:

```text
npm run build          # backend
npm test               # backend
npm run build          # frontend
docker compose --env-file .env.example config
```

The Phase 6 Docker stack was also previously verified with:

```text
docker compose --env-file .env.example build
docker compose --env-file .env.example up -d
```

Current production stack endpoint:

```text
http://localhost/
http://localhost/health
http://localhost/api/v1
```

---

## Phase 7 Approval Gate

Phase 7 CI/CD is complete. Do not proceed to Phase 8: SaaS Operations until approval is given.
