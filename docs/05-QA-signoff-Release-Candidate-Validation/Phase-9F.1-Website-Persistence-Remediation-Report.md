# PHASE 9F.1 - Website Persistence Remediation Report

Date: 2026-06-04
Sprint: Stage 6.1 Sprint 1 - Website Persistence Fix
Priority: P1 Critical
Status: PASS

## Root Cause

The Stage 6 finding was reproduced when update requests reached the backend with an empty parsed body, for example when the request did not include `Content-Type: application/json`.

Flow traced:

Frontend -> `websitesApi.update()` -> `PUT /api/v1/websites/:id` -> `UpdateWebsiteDto` -> `WebsitesController.update()` -> `WebsitesService.update()` -> Prisma `website.update()` -> PostgreSQL.

Failure point:

`WebsitesService.update()` accepted an empty/no-op DTO and still called Prisma with all update fields set to `undefined`. Prisma treated this as a no-op update and returned HTTP 200, so the response looked successful while submitted changes were not persisted.

The same no-op behavior existed for `updateThemeAssets()` when no parsed theme asset fields were present.

## Files Modified

- `backend/src/modules/websites/dto/update-website.dto.ts`
- `backend/src/modules/websites/websites.service.ts`
- `backend/src/modules/websites/websites.service.spec.ts`

## Fix Applied

- Added `@IsNotEmpty()` validation for `businessName` when it is included in a website update payload.
- Changed `WebsitesService.update()` to build Prisma update data from only fields that are actually present.
- Added a `BadRequestException` when a website update payload contains no updateable fields.
- Changed `WebsitesService.updateThemeAssets()` to reject empty/no-op theme asset updates.
- Added regression tests for:
  - Website field persistence.
  - Empty website update rejection.
  - Theme asset persistence.
  - Empty theme asset update rejection.

## Test Evidence

| Command / Check | Result |
| --- | --- |
| `npm --prefix backend run test` | PASS: 6 suites passed, 21 tests passed |
| `npm --prefix backend run build` | PASS |
| `docker compose up -d --build backend` | PASS |
| Manual API validation: website update returned 200 | PASS |
| Manual API validation: `businessName` persisted | PASS |
| Manual API validation: `tagline` persisted | PASS |
| Manual API validation: `description` persisted | PASS |
| Manual API validation: website settings persisted | PASS |
| Manual API validation: theme assets persisted | PASS |
| Manual API validation: missing content-type no-op rejected | PASS: 400 `At least one website field is required` |
| `npm run smoke-test` | PASS: 1 Playwright smoke test passed |

## PASS / FAIL

PASS

Sprint 1 is completed and validated. Sprint 2 has not been started yet.
