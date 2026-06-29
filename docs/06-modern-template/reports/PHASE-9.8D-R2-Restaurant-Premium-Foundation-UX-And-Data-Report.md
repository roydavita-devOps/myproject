# PHASE 9.8D-R2 - Restaurant Premium Foundation UX and Data Report

Date: 2026-06-29

## 1. Executive Summary

Stage 9.8D-R2 remediates the remaining Restaurant Premium foundation issues:

- Full Restaurant Menu modal now visually matches Restaurant Premium.
- Generic `Chat WhatsApp` CTA is removed from the Restaurant Premium menu modal.
- Menu category delete is exposed in the dashboard with safe item preservation.
- Tenant slug is removed from the Login form and moved into Business Information.
- Opening Hours is now a structured daily picker instead of a free-text sentence.

No marketplace, billing, subscription, entitlement, new template, or destructive database change was introduced.

## 2. Scope

Included:

- Existing `restaurant_premium` behavior.
- Shared premium full menu modal variant behavior.
- Dashboard menu category management.
- Dashboard Business Information slug and opening-hours UX.
- Backend tenant self-update endpoint.
- Backend opening-hours validation.
- Tests, smoke validation, and screenshot evidence.

Excluded:

- Cafe Premium redesign.
- New templates.
- Marketplace, catalog landing page, comparison, billing, subscription, entitlement, or plan restriction.
- Advanced page builder.

## 3. Leadership Design Decision

Restaurant Premium is now the first Premium Experience Foundation reference.

Future premium templates should share principles and reusable patterns, not inherit directly from `RestaurantPremiumTemplate.tsx`.

## 4. Safe Database Migration Decision

No Prisma migration was required.

Reason:

- `Website.openingHours` already exists as nullable JSON.
- `Tenant.slug` already exists and is unique.
- `Menu.categoryId` already supports `null`, enabling safe move to `No category`.

Structured opening hours now use:

```json
{
  "mode": "daily",
  "openTime": "12:00",
  "closeTime": "21:00"
}
```

## 5. Full Menu Modal Theme Fix

Restaurant Premium modal now uses:

- dark restaurant surface
- gold-accent category tabs
- restaurant typography
- premium menu item cards
- restaurant-facing copy: `Browse signature dishes, favorites, and menu selections.`

## 6. WhatsApp CTA Removal

Restaurant Premium modal no longer renders the generic `Chat WhatsApp` CTA.

Reservation/contact actions remain in:

- Header
- Visit & Reservation section

Cafe Premium modal behavior was not redesigned.

## 7. Category Delete Implementation

Dashboard category rows now show:

- category name
- `Delete` button
- browser confirmation prompt
- safe mutation and query invalidation

Confirmation copy:

`Delete this category? Menu items in this category will be moved to No category.`

## 8. Category Delete Safety Rules

Backend behavior:

- `menu.updateMany({ categoryId: null })`
- then delete category

Menu items are not deleted.

## 9. Tenant Slug Login Audit

Findings:

1. `tenantSlug` was optional in backend login DTO before this stage.
2. Backend could already resolve a normal one-tenant account by email/password.
3. One `User` record belongs to one tenant, but the same email can exist across tenants.
4. Google login resolves by Google subject or email, with optional tenant filter.
5. Slug was previously editable only through super-admin tenant endpoints.
6. Slug uniqueness is already enforced by `Tenant.slug @unique`.
7. Removing tenant slug from login is safe for one-tenant accounts. Multi-tenant same-email accounts now fail safely instead of being assigned to an arbitrary tenant.

## 10. Tenant Slug Business Information Implementation

Added tenant self endpoints:

- `GET /api/v1/tenants/me`
- `PUT /api/v1/tenants/me`

Dashboard Business Information now exposes:

- current public slug
- editable slug
- public URL preview
- warning that changing slug may change public website URL

Slug validation:

- lowercase
- numbers
- hyphen-separated URL-safe segments
- uniqueness checked by backend

## 11. Auth Flow Changes

Login UI now asks only:

- Email
- Password

Google Login no longer sends tenant slug from login.

Backend safety:

- If multiple matching tenants exist for the same credentials without slug, backend rejects with a tenant-selection-required error.
- Full tenant-selection screen remains future scope.

## 12. Opening Hours Picker Implementation

Opening Hours is no longer free-text-only.

Controls:

- Opening mode: `Every day`
- Open Time: native `time` input
- Close Time: native `time` input

Validation:

- open time required
- close time required
- close time must be after open time

## 13. Opening Hours Data Persistence

Stored in existing `Website.openingHours` JSON:

```json
{
  "mode": "daily",
  "openTime": "12:00",
  "closeTime": "21:00"
}
```

Public display:

`Daily, 12.00 - 21.00`

Legacy `{ "display": "Daily, 12.00 - 21.00" }` remains supported.

## 14. Files Modified

- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/menus/menus.service.spec.ts`
- `backend/src/modules/tenants/tenants.controller.ts`
- `backend/src/modules/tenants/tenants.service.ts`
- `backend/src/modules/websites/websites.service.ts`
- `frontend/src/features/auth/LoginPage.tsx`
- `frontend/src/features/menus/MenuManagementPage.tsx`
- `frontend/src/features/menus/menus.api.ts`
- `frontend/src/features/templates/PremiumFullMenuModal.tsx`
- `frontend/src/features/templates/openingHours.ts`
- template opening-hours consumers
- `frontend/src/features/tenants/tenants.api.ts`
- `frontend/src/features/websites/WebsiteEditorPage.tsx`
- `smoke/saas.smoke.spec.ts`
- `scripts/generate-restaurant-premium-r1-evidence.mjs`
- `scripts/generate-restaurant-premium-r2-evidence.mjs`
- project docs

## 15. Migration Details

No migration added.

Rollback:

- Revert this commit.
- Existing database data remains compatible because all changes use existing nullable/JSON fields.

## 16. Testing Results

Passed:

- Frontend lint
- Frontend tests: 41 passed
- Frontend production build
- Backend lint
- Backend tests: 36 passed
- Backend production build
- Prisma validate with backend Prisma 6 and local validation env
- Docker compose build and restart
- Local health endpoints
- Smoke tests: 10 passed
- R2 evidence generation

Note:

- `npx prisma validate` from repo root pulled Prisma 7 and failed against the existing Prisma 6 schema format. Validation was rerun using backend Prisma 6.19.3 and passed.

## 17. Evidence Locations

Folder:

`docs/evidence/restaurant-premium-editorial-redesign-r2/`

Screenshots:

- `restaurant-premium-full-menu-modal.png`
- `restaurant-premium-full-menu-modal-mobile.png`
- `menu-category-delete-ui.png`
- `business-info-slug-editor.png`
- `login-without-tenant-slug.png`
- `opening-hours-picker.png`
- `restaurant-premium-opening-hours-public.png`
- `visual-validation-results.json`

## 18. Risks

- Same-email users across multiple tenants require a future tenant selection flow.
- Changing slug changes the public URL. The UI now warns users.
- Structured hours are daily-only MVP; weekly/holiday schedules remain future scope.

## 19. Rollback Strategy

Rollback by reverting the Stage 9.8D-R2 commit.

No database rollback is required because no migration was added.

## 20. Go / No-Go Decision

Go.

Stage 9.8D-R2 is implemented, locally validated, evidence-backed, and ready for product approval.
