# Stage 8.2 - Authentication & Onboarding UX Refinement Report

Tanggal implementasi: 2026-06-05

## Summary

Stage 8.2 memisahkan Google authentication dari tenant registration. User Google baru dapat login/register tanpa mengisi data tenant terlebih dahulu, lalu diarahkan ke onboarding wizard untuk membuat workspace bisnis.

Email registration lama tetap membuat tenant langsung dan tetap masuk ke dashboard setelah berhasil.

## Architecture Changes

Backend:
- Menambahkan `users.onboarding_completed`.
- Menambahkan endpoint authenticated `POST /api/v1/auth/onboarding/complete`.
- Google login sekarang melakukan auto-provision user jika akun Google belum pernah ada dan request tidak mengirim `tenantSlug`.
- JWT payload dan auth response sekarang membawa `onboardingCompleted`.
- Pembuatan tenant, subscription, theme, website, dan domain awal dipusatkan dalam helper workspace creation.

Frontend:
- Register page memisahkan `Continue with Google` dari form `Register with Email`.
- Google register tidak lagi membutuhkan `businessName`, `slug`, `businessType`, atau `adminName`.
- Menambahkan route `/onboarding`.
- Protected tenant routes mengarahkan user yang belum onboarding ke `/onboarding`.
- Progress onboarding disimpan di `localStorage` agar bertahan setelah refresh.

## UX Changes

Before:
- Google signup tertanam di form tenant registration.
- User harus mengisi data bisnis sebelum autentikasi Google.

After:
- User bisa lanjut dengan Google lebih dulu.
- User baru menyelesaikan business setup setelah autentikasi.
- Dashboard, website builder, menu, analytics, domains, dan settings tenant hanya bisa diakses setelah onboarding selesai.

## API Changes

New endpoint:

`POST /api/v1/auth/onboarding/complete`

Auth:
- Requires JWT access token.

Payload:
- `businessName`
- `slug`
- `businessType`
- `templateName` optional
- `themePreference` optional
- `colorPreset` optional

Response:
- `AuthResponse` baru dengan `tenantId` dan `onboardingCompleted=true`.

Updated auth response:
- `user.onboardingCompleted` added to login/register/refresh/google/onboarding responses.

## Database Changes

Migration:
- `backend/prisma/migrations/20260605082000_auth_onboarding/migration.sql`

Schema:
- `User.onboardingCompleted Boolean @default(false) @map("onboarding_completed")`

Backfill:
- Existing users with `tenant_id IS NOT NULL` are marked `onboarding_completed=true`.

Seed:
- Demo tenant admins are created/updated with `onboardingCompleted=true`.

## Test Results

Passed:
- Backend Prisma generate.
- Backend build.
- Backend lint.
- Backend Jest test suite: 6 suites, 28 tests.
- Frontend build.
- Frontend lint.
- Docker Compose rebuild.
- Local container smoke test.
- Local demo login confirms existing tenant user returns `onboardingCompleted=true`.
- Local onboarding test confirms a user without tenant starts with `onboardingCompleted=false`, completes onboarding, receives `tenantId`, and returns `onboardingCompleted=true`.

Pending after GitHub push:
- Production deployment validation after Vercel/Railway redeploy.

## Risks & Mitigations

Risk:
- Existing local sessions may not have `onboardingCompleted` in `localStorage`.

Mitigation:
- Frontend routing treats old sessions with `tenantId` as completed.

Risk:
- Google user with existing email can resolve to an existing tenant user.

Mitigation:
- Backend searches by Google subject or email before creating a new account to avoid duplicate accounts.

Risk:
- Email provider is still not active.

Mitigation:
- Stage 8.2 does not block onboarding on email verification. Email provider remains planned for Stage 8.3.

## Rollback Strategy

1. Revert the Stage 8.2 implementation commit.
2. Redeploy backend and frontend.
3. If database rollback is required, remove `users.onboarding_completed` only after confirming no deployed code depends on it.
4. Existing tenant/user data remains intact because onboarding completion only links new Google users to newly created tenant workspaces.

## Decision

Stage 8.2 implementation is ready for Docker and deployment validation.
