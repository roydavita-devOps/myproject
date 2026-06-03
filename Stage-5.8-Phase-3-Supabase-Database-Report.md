# SUPABASE DATABASE REPORT

## Status

PASS - the database layer is compatible with Supabase PostgreSQL as a standard PostgreSQL target.

This phase is a migration review and operating plan only. No Supabase database migration was executed in this phase.

## Prisma Compatibility Review

Current database architecture:

- ORM: Prisma.
- Database provider: PostgreSQL.
- Connection source: `DATABASE_URL`.
- Migration command: `prisma migrate deploy`.
- Development command: `prisma migrate dev`.
- Seed command: `npm run seed`.
- Local database: PostgreSQL 17 in Docker Compose.

Compatibility verdict:

PASS.

The Prisma schema uses portable PostgreSQL features:

- UUID columns via Prisma `@db.Uuid`.
- Prisma-managed UUID defaults with `@default(uuid())`.
- PostgreSQL enums.
- JSONB columns.
- Decimal columns.
- Foreign keys.
- Indexes and unique constraints.
- Standard check constraint for review rating.
- Standard `public` schema through `?schema=public`.

No forbidden Supabase-specific database features are used:

- No Supabase Auth.
- No Supabase Realtime.
- No Supabase Edge Functions.
- No Supabase Row Level Security dependency.
- No database functions required for application behavior.
- No provider SDK in business logic.

Validation performed:

```bash
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:15432/umkm_builder?schema=public'
npx prisma validate
```

Result:

```text
The schema at prisma\schema.prisma is valid
```

Initial validation without `DATABASE_URL` failed as expected because Prisma requires the env var to load datasource config.

## Migration Plan

Objective:

Move pilot database runtime from local Docker PostgreSQL to Supabase PostgreSQL while keeping the app database layer portable.

### Pre-Migration Requirements

1. Create Supabase project for pilot.
2. Use only Supabase PostgreSQL.
3. Do not enable Supabase Auth for this application.
4. Do not add RLS policies as an application dependency.
5. Do not add Supabase functions, triggers, or Realtime.
6. Store Supabase database URL only as environment secret.
7. Keep Prisma schema unchanged unless a genuine application schema change is required.

### Required Environment

Backend pilot environment:

```text
DATABASE_URL=postgresql://...supabase.../postgres?schema=public
RUN_MIGRATIONS=true
NODE_ENV=production
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CORS_ORIGINS=...
ROOT_DOMAIN=...
```

Important:

- `DATABASE_URL` must use Supabase's direct PostgreSQL connection string or a transaction-pooler mode compatible with Prisma migration/deploy behavior.
- For migrations, prefer a direct connection string if Supabase provides separate pooled and direct URLs.
- Do not use `prisma db push` for pilot.

### Migration Steps

1. Freeze pilot schema changes.
2. Confirm latest commit has passing CI.
3. Create pilot Supabase PostgreSQL database.
4. Store pilot database URL in GitHub Environment secret:

```text
PILOT_DATABASE_URL
```

5. Run migration deploy against the Supabase pilot database:

```bash
cd backend
DATABASE_URL="$PILOT_DATABASE_URL" npx prisma migrate deploy
```

6. Verify migration state:

```bash
DATABASE_URL="$PILOT_DATABASE_URL" npx prisma migrate status
```

7. Seed pilot demo tenants only if the pilot environment needs demo data:

```bash
DATABASE_URL="$PILOT_DATABASE_URL" ROOT_DOMAIN="<pilot-domain>" npm run seed
```

8. Deploy Railway backend with the same `DATABASE_URL`.
9. Validate backend health:

```text
GET /health/database
GET /health/ready
```

10. Run smoke test against public pilot URL after frontend/backend deployment phases.

## Backup Plan

Backup objective:

Create a restore point before and after each pilot migration/deployment.

### Before Migration

If migrating from an existing local/VPS pilot database:

```bash
pg_dump "$SOURCE_DATABASE_URL" --format=custom --file=backup-before-supabase-pilot.dump
```

Also export a plain SQL copy for human inspection:

```bash
pg_dump "$SOURCE_DATABASE_URL" --format=plain --file=backup-before-supabase-pilot.sql
```

### After Migration

After `prisma migrate deploy` succeeds:

```bash
pg_dump "$PILOT_DATABASE_URL" --format=custom --file=backup-after-supabase-migration.dump
```

### Backup Storage Rules

- Do not commit backups to Git.
- Store backups in an encrypted private location.
- Label backups with environment, timestamp, source commit, and migration version.
- Keep at least:
  - pre-migration backup
  - post-migration backup
  - latest daily pilot backup during pilot testing

### Minimum Backup Metadata

```text
environment=pilot
source_commit=<git-sha>
database_provider=supabase-postgresql
prisma_migration=20260602181100_init
created_at=<timestamp>
operator=<person>
```

## Rollback Plan

Rollback objective:

Restore a known-good pilot state without redesigning the database or changing application logic.

### Rollback Triggers

Rollback if any of the following occur:

- `prisma migrate deploy` fails.
- `/health/database` returns error.
- `/health/ready` returns error after deployment.
- Login/register flow fails against pilot database.
- Tenant data isolation regression is detected.
- Data corruption or unexpected destructive migration is detected.

### Rollback Option A - Abort Before Traffic

Use when migration fails before pilot traffic is pointed to the new backend.

Steps:

1. Stop deployment.
2. Keep previous environment active.
3. Fix migration/configuration issue.
4. Re-run migration against a fresh Supabase pilot database.

### Rollback Option B - Restore Supabase Pilot Database

Use when Supabase pilot database is active but must return to previous state.

Steps:

1. Put pilot backend in maintenance mode or stop Railway service.
2. Create immediate failed-state backup for forensic analysis:

```bash
pg_dump "$PILOT_DATABASE_URL" --format=custom --file=failed-state.dump
```

3. Restore latest known-good backup to a clean PostgreSQL database.
4. Point `PILOT_DATABASE_URL` to restored database.
5. Run:

```bash
npx prisma migrate status
```

6. Restart backend.
7. Validate:

```text
GET /health/database
GET /health/ready
```

8. Run pilot smoke test.

### Rollback Option C - Repoint To Previous PostgreSQL

Use if Supabase database is unavailable.

Steps:

1. Set `PILOT_DATABASE_URL` back to previous PostgreSQL endpoint.
2. Restart backend.
3. Validate health endpoints.
4. Run smoke tests.
5. Investigate Supabase issue offline.

## Risks And Mitigations

### Risk: Prisma migration uses pooled connection incompatible with migration locking

Severity: High

Mitigation:

Use direct Supabase PostgreSQL connection for migration deploy. Use pooled connection only for runtime if validated with Prisma.

### Risk: Supabase RLS introduced as tenancy control

Severity: High

Mitigation:

Do not use RLS in public pilot. Tenant isolation remains in NestJS services and Prisma queries.

### Risk: Seed data pollutes real pilot users

Severity: Medium

Mitigation:

Run seed only on demo/staging database or on pilot before real users are invited. Do not re-run demo seed after pilot users exist unless approved.

### Risk: Stored asset URLs reference old environment

Severity: Medium

Mitigation:

Phase 6 must validate storage adapter and asset URL strategy before real pilot uploads are relied on.

### Risk: Missing backup before migration

Severity: High

Mitigation:

No migration is approved unless pre-migration backup exists and restore steps are documented.

## Supabase Usage Boundaries

Allowed:

- Supabase PostgreSQL as standard PostgreSQL.
- Supabase dashboard for database administration.
- Supabase backups if available in project plan.

Forbidden:

- Supabase Auth.
- Supabase Realtime.
- Supabase Edge Functions.
- Supabase database functions as required application logic.
- Supabase RLS as the primary tenant isolation model.
- Provider SDK in backend business logic for database access.

## Future VPS Migration Strategy

Future target:

- Ubuntu VPS.
- PostgreSQL.
- Docker Compose.
- Nginx.
- MinIO.

Database migration from Supabase to VPS:

1. Stop pilot writes.
2. Dump Supabase PostgreSQL:

```bash
pg_dump "$SUPABASE_DATABASE_URL" --format=custom --file=supabase-to-vps.dump
```

3. Restore to VPS PostgreSQL:

```bash
pg_restore --clean --if-exists --dbname "$VPS_DATABASE_URL" supabase-to-vps.dump
```

4. Set backend `DATABASE_URL` to VPS PostgreSQL.
5. Run `prisma migrate status`.
6. Start backend.
7. Validate health and smoke tests.

Expected application rewrite:

None.

## Phase 3 Verdict

PASS.

The platform can use Supabase PostgreSQL for public pilot without database redesign, provided migrations use standard Prisma deploy flow and Supabase remains a PostgreSQL provider only.

Proceed to Phase 4 - Railway Backend Deployment after approval.

STOP.
