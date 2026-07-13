# Production Smoke Test Plan

Last updated: 2026-07-13

## Purpose

This is the future post-reactivation smoke test checklist for UMKM Builder production.

## Warning

Railway is currently inactive/expired.

Stage 9.12A is preparation-only. Actual Railway reactivation, production redeploy, and production migrations are deferred to Stage 9.12B.

Do not run production migrations until backup and migration status are verified.

Do not run this against production until Railway is reactivated, backend health is green, production env values are verified, and migration status has been reviewed.

Related docs:

- [PRODUCTION_RELAUNCH_PREPARATION.md](./PRODUCTION_RELAUNCH_PREPARATION.md)
- [DEPLOYMENT_ENVIRONMENT_MATRIX.md](./DEPLOYMENT_ENVIRONMENT_MATRIX.md)
- [PRODUCTION_ENV_MANUAL_CHECKLIST.md](./PRODUCTION_ENV_MANUAL_CHECKLIST.md)
- [PRODUCTION_ROLLBACK_PLAN.md](./PRODUCTION_ROLLBACK_PLAN.md)

## Preconditions

- Railway backend service is active.
- Vercel frontend production URL is known.
- Supabase database and storage are active.
- Production secrets are configured without exposing values in documentation.
- Backend `/health/ready` passes.
- Migration status has been verified and any production migration has been approved separately.

## Smoke Test Checklist

| # | Area | Check | Expected result |
| --- | --- | --- | --- |
| 1 | Health | Open `https://<railway-backend-domain>/health/ready`. | Status OK and database OK. |
| 2 | Health | Open `https://<railway-backend-domain>/health/storage`. | OK when `STORAGE_DRIVER=supabase`. |
| 3 | Frontend | Open Vercel production URL. | App shell loads without console/network API base errors. |
| 4 | Auth | Login with an existing test/admin account. | Dashboard loads and token is stored. |
| 5 | Auth | Refresh page after login. | Session remains valid or refresh endpoint succeeds. |
| 6 | Auth | Logout. | App session clears; Google auto-select is disabled if Google login was used. |
| 7 | Register | Register only if production test data is approved. | Tenant and default website are created. |
| 8 | Google Login | Use Google login if configured. | Backend verifies token and dashboard loads. |
| 9 | Dashboard | Open dashboard and website editor. | Website data loads. |
| 10 | Business Info | Save business name, tagline, contact, address, maps URL, opening hours. | Changes persist after refresh. |
| 11 | Slug | Validate and save slug. | Slug persists and duplicate validation works. |
| 12 | Template Catalog | Open template page. | Restaurant Premium is primary; modal opens. |
| 13 | Premium Template | Select Restaurant Premium and confirm. | Template key persists; preview/public render uses Restaurant Premium. |
| 14 | Premium Template | Select Cafe Premium and confirm. | Template key persists; preview/public render uses Cafe Premium. |
| 15 | Free Groups | Select Food & Beverage Free. | Existing primary key `restaurant_classic` persists. |
| 16 | Free Groups | Select Business Free. | Existing primary key `corporate_executive` persists. |
| 17 | Free Groups | Select Services Free. | Existing primary key `laundry_clean` persists. |
| 18 | Menu | Create menu category and item. | Item appears in dashboard and public template. |
| 19 | Menu | Edit price with IDR/USD as appropriate. | Price formats correctly. |
| 20 | Menu Images | Upload menu item image. | Image appears and loads from Supabase URL. |
| 21 | Hero | Upload hero image. | Hero preview and public site render image. |
| 22 | Gallery | Upload multiple gallery images. | Images appear; invalid types are rejected. |
| 23 | Gallery | Delete one image and bulk delete selected images. | Deleted records disappear without broken images. |
| 24 | Publish Readiness | Open editor publish panel. | Required/recommended checks render. |
| 25 | Publish | Publish website when required checks pass. | Public URL becomes available. |
| 26 | Public Route | Open public slug URL. | Published site renders. |
| 27 | Public Route | Unpublish site. | Public route hides or returns unpublished state as expected. |
| 28 | Storage | Inspect public site images. | No broken Supabase image URLs. |
| 29 | CORS | Browser requests from Vercel to Railway. | No CORS errors in console/network. |
| 30 | Logs | Check Railway logs after test. | No repeated 500s, migration loops, storage failures, or auth errors. |

## Production Smoke Test Commands

Run only after production access is approved:

```powershell
Invoke-WebRequest https://<railway-backend-domain>/health/ready -UseBasicParsing
Invoke-WebRequest https://<railway-backend-domain>/health/storage -UseBasicParsing
```

For automated Playwright smoke tests, use a production-safe test plan and disposable approved tenant data. Do not run destructive tests against real customer data.

## Stop Conditions

Stop testing and roll back or pause relaunch if:

- `/health/ready` fails.
- CORS blocks Vercel frontend.
- Login fails for known credentials.
- Uploads write to local filesystem instead of Supabase.
- Public published route fails for a valid site.
- Migration status is unknown or migration has failed.
- Railway logs show repeated crash/restart loops.
