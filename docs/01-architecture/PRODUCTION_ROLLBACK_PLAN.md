# Production Rollback Plan

Last updated: 2026-07-13

## Purpose

This rollback plan is for the future Railway/Vercel/Supabase production relaunch.

## Warning

Railway is currently inactive/expired.

Stage 9.12A is preparation-only. Actual Railway reactivation, production redeploy, and production migrations are deferred to Stage 9.12B.

Do not run production migrations until backup and migration status are verified.

Stage 9.12A does not execute rollback, deploy, migration, or production changes.

Related docs:

- [PRODUCTION_RELAUNCH_PREPARATION.md](./PRODUCTION_RELAUNCH_PREPARATION.md)
- [DEPLOYMENT_ENVIRONMENT_MATRIX.md](./DEPLOYMENT_ENVIRONMENT_MATRIX.md)
- [PRODUCTION_ENV_MANUAL_CHECKLIST.md](./PRODUCTION_ENV_MANUAL_CHECKLIST.md)
- [PRODUCTION_SMOKE_TEST_PLAN.md](./PRODUCTION_SMOKE_TEST_PLAN.md)

## Rollback Triggers

Rollback or pause relaunch if any of these occur:

- Railway backend fails readiness after redeploy.
- Vercel production frontend cannot call Railway backend.
- Production auth/login is broken.
- Prisma migration fails or database state is inconsistent.
- Supabase uploads fail or public images break.
- Published websites return incorrect status.
- Severe error rate appears in Railway logs.
- Production secrets are found exposed in frontend or logs.

## Code Rollback

1. Identify the last known good Git commit.
2. In Railway, redeploy the previous known-good backend deployment if available.
3. In Vercel, promote or redeploy the previous known-good frontend deployment if available.
4. If deployment platform rollback is unavailable, revert the Git commit in a new commit and deploy that revert after approval.
5. Validate `/health/ready`, login, dashboard, public route, and upload/storage after rollback.

## Environment Rollback

1. Compare changed Railway env variables against the pre-reactivation inventory.
2. Revert only variables changed during relaunch.
3. Never move `SUPABASE_SERVICE_ROLE_KEY` to Vercel/frontend.
4. Revalidate CORS after any `CORS_ORIGINS` rollback.
5. Revalidate `VITE_API_URL` after any Vercel env rollback.

## Database Rollback

Database rollback must be handled separately from code rollback.

1. Do not run destructive Prisma commands.
2. Stop further migrations.
3. Confirm latest Supabase backup/snapshot.
4. Identify whether the issue is schema, data, or application-code compatibility.
5. Restore backup only after approval and clear impact assessment.
6. After restore, redeploy the matching application commit.
7. Validate migration history and public routes before reopening access.

Warning:

- Code rollback does not automatically roll back schema or data.
- Database restore may lose data created after the backup point.
- Storage objects should not be deleted unless explicitly proven problematic.

## Storage Rollback

1. Keep Supabase storage objects intact by default.
2. If upload deletion or variant generation causes issues, disable user upload actions at the application level only through a separately approved change.
3. Do not bulk delete storage objects during incident response unless exact affected paths are known.
4. Revalidate public image URLs after rollback.

## Public Access Mitigation

If severe production issue impacts public websites:

1. Prefer restoring previous deployment first.
2. If needed, temporarily disable public access through platform routing or app status only after approval.
3. Do not mass-unpublish customer websites as a rollback shortcut.

## Incident Documentation

After rollback:

1. Record timeline.
2. Record affected services.
3. Record root cause.
4. Record mitigation used.
5. Record validation after recovery.
6. Add follow-up actions to project status/roadmap.
