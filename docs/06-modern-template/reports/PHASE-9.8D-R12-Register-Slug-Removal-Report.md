# Stage 9.8D-R12 - Register Slug Removal Report

Date: 2026-07-03

## 1. Executive Summary

Stage 9.8D-R12 is implemented and locally validated.

The public Register form no longer asks for a slug and no longer submits a slug from the normal registration flow. Backend registration now safely creates tenants without a user-provided slug by generating a temporary unique slug from the business name plus a short suffix.

Slug remains editable after login from Business Information / Business slug. Existing explicit slug API flows remain compatible, duplicate slug validation remains active, and public site routing by slug still works after slug update and publish.

## 2. Scope

In scope:

- Remove slug input from the normal Register page.
- Remove slug from normal frontend register form state and payload.
- Allow backend register/google-register DTOs to omit slug.
- Generate a temporary unique tenant slug when backend registration receives no slug.
- Preserve explicit slug compatibility for internal/API flows.
- Preserve dashboard Business Information slug editing and duplicate validation.
- Capture evidence for register, slug editor, slug save, and public site route.

Out of scope:

- Restaurant Premium design.
- Full Menu Modal.
- Hero Slideshow.
- Gallery upload.
- Menu management.
- Payment.
- Subscription.
- Marketplace.
- Hosting renewal.
- Template registry.
- Cafe Premium redesign.
- Publish gate implementation.
- Advanced onboarding.
- New templates.
- Video hero.
- Media library.

## 3. Current Registration UX Problem

Before this stage, Register asked for:

- Business name.
- Slug.
- Business type.
- Admin name.
- Email.
- Password.

This forced a new user to choose a public website address before they understood the dashboard and duplicated the Business Information slug editor that already exists later in the owner flow.

## 4. Register UI Changes

The Register page now renders only:

- Business name.
- Business type.
- Admin name.
- Email.
- Password.
- Create tenant.
- Google sign-in button when available.

Removed from Register:

- Slug field.
- `warteg-moncer` slug placeholder.
- Register error copy that tells the user to check slug.

## 5. Frontend Payload Changes

The normal Register form state no longer contains `slug`.

The normal Register page now submits:

```json
{
  "businessName": "...",
  "businessType": "...",
  "adminName": "...",
  "email": "...",
  "password": "..."
}
```

The shared frontend `RegisterPayload` and `GoogleRegisterPayload` types keep `slug` optional so older internal/API flows remain compatible without forcing the public form to send an empty slug.

## 6. Backend Slug Generation Decision

Backend `RegisterDto` and `GoogleRegisterDto` now accept missing slug.

When slug is missing:

1. Backend normalizes the business name into a slug-safe base.
2. Backend appends a short random suffix.
3. Backend checks tenant slug uniqueness.
4. Backend retries if a collision is found.
5. Backend creates tenant, domain, theme, website, subscription, and admin user as before.

Example generated slug:

```text
izakaya-ramen-a8f3
```

When slug is explicitly supplied through an internal/API flow:

- Backend preserves the explicit slug.
- Existing duplicate slug validation still applies.
- Existing public route compatibility remains unchanged.

## 7. Business Information Slug Ownership

Business Information remains the user-facing place to own website slug.

Confirmed behavior:

- `Business slug` panel still renders.
- `Public URL slug` input still renders.
- Invalid format validation remains in the dashboard.
- Duplicate slug validation remains active through backend tenant update/register checks.
- Save success feedback still appears.
- Public URL preview still updates.

## 8. Preview / Publish Slug Behavior

Preview can use the generated temporary slug if needed because the tenant still has a valid slug immediately after registration.

Publish behavior was not changed in this stage.

Future requirement:

- Publish readiness should require a valid user-confirmed website address / slug before launch.
- This should be implemented in a dedicated publish-readiness stage, not inside R12.

## 9. Google Registration Compatibility

Google registration DTO now also allows missing slug.

The Google flow should follow the same ownership model:

```text
Create/login account
-> Complete Business Information
-> Set website slug later
```

No slug prompt was added to Google onboarding or Google sign-in.

## 10. Files Modified

- `frontend/src/features/auth/RegisterPage.tsx`
- `frontend/src/features/auth/auth.api.ts`
- `frontend/src/features/templates/registry/__tests__/premiumTemplateSource.test.ts`
- `backend/src/modules/auth/dto/register.dto.ts`
- `backend/src/modules/auth/dto/google-register.dto.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/auth.service.spec.ts`
- `scripts/generate-register-slug-removal-r12-evidence.mjs`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/06-modern-template/reports/PHASE-9.8D-R12-Register-Slug-Removal-Report.md`
- `docs/evidence/register-slug-removal-r12/*`

## 11. Testing Results

Passed:

- `npm --prefix frontend run test`
- `npm --prefix frontend run lint`
- `npm --prefix frontend run build`
- `npm --prefix backend run test`
- `npm --prefix backend run lint`
- `npm --prefix backend run build`
- `$env:DATABASE_URL='postgresql://postgres:postgres@localhost:15432/umkm_builder?schema=public'; $env:DIRECT_URL=$env:DATABASE_URL; npx --prefix backend prisma validate --schema backend/prisma/schema.prisma`
- `docker compose up -d --build`
- `Invoke-WebRequest http://127.0.0.1/health/ready -UseBasicParsing`
- `node scripts/generate-register-slug-removal-r12-evidence.mjs`
- `npm run smoke-test`

Notes:

- `prisma validate` without `DIRECT_URL` failed because the local shell did not provide `DIRECT_URL`. It passed after setting local temporary `DATABASE_URL` and `DIRECT_URL`.
- Frontend production build still reports the existing Vite chunk-size warning. This is unchanged by Stage 9.8D-R12.
- Backend tests include expected warning logs from existing upload/email failure simulation tests.

## 12. Evidence Locations

Evidence folder:

- `docs/evidence/register-slug-removal-r12/`

Screenshots:

- `docs/evidence/register-slug-removal-r12/register-form-without-slug.png`
- `docs/evidence/register-slug-removal-r12/business-information-slug-editor.png`
- `docs/evidence/register-slug-removal-r12/slug-update-success.png`
- `docs/evidence/register-slug-removal-r12/public-site-after-slug-update.png`

Validation JSON:

- `docs/evidence/register-slug-removal-r12/visual-validation-results.json`

Evidence confirms:

- Register page does not render slug.
- Register payload does not include slug.
- Backend created tenant and website without slug in frontend payload.
- Business Information slug editor remains available.
- Slug save succeeds.
- Duplicate explicit slug validation remains active.
- Public site route works after slug update and publish.

## 13. Remaining Risks

- Publish currently accepts the existing generated slug. A future publish-readiness gate should require user-confirmed slug before launch.
- Existing API/internal flows that explicitly send slug remain supported by design, so tests/scripts can still use deterministic slugs.
- Generated slug is technical compatibility, not intended as final brand/public address.

## 14. Go / No-Go Decision

Go.

Stage 9.8D-R12 is ready for approval.
