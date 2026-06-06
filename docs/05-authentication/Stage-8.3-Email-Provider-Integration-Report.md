# Stage 8.3 - Email Provider Integration Report

Tanggal implementasi: 2026-06-05

## Summary

Stage 8.3 menambahkan integrasi email provider untuk authentication flow memakai Resend sebagai provider utama. Integrasi ini menghubungkan token forgot password dan resend email verification ke provider email tanpa membocorkan token di production.

## Architecture Changes

Backend:
- Menambahkan `EmailService` untuk pengiriman auth email melalui Resend API.
- `AuthService.forgotPassword()` sekarang membuat reset token dan mengirim email reset password jika provider aktif.
- `AuthService.resendVerification()` sekarang membuat verification token dan mengirim email verifikasi jika provider aktif.
- Jika provider belum dikonfigurasi, API tetap aman dan mengembalikan delivery status `unconfigured`.
- Jika Resend gagal, API mengembalikan delivery status `provider-error`.

Frontend:
- Tidak ada perubahan frontend pada Stage 8.3.

Database:
- Tidak ada migration baru.
- Token tetap disimpan dalam tabel existing:
  - `password_reset_tokens`
  - `email_verification_tokens`

## Environment Variables

New backend variables:

| Variable | Required For Email Delivery | Description |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | API key Resend. |
| `EMAIL_FROM` | Yes | Sender email, for example `UMKM Builder <noreply@domain.com>`. |
| `APP_PUBLIC_URL` | Yes | Public frontend URL used to generate reset/verify links. |

Existing safety variable:

| Variable | Production Value | Description |
| --- | --- | --- |
| `AUTH_TOKEN_RESPONSE_ENABLED` | `false` | Prevents reset/verification token from being returned in API response. |

## Email Templates

Added backend-generated templates for:
- Password reset email.
- Email verification email.

Both templates include:
- Subject.
- HTML body.
- Plain text fallback.
- Public action URL generated from `APP_PUBLIC_URL`.

## API Behavior

Forgot password:

`POST /api/v1/auth/forgot-password`

Possible delivery values:
- `email` when Resend sends successfully.
- `unconfigured` when Resend env is missing.
- `provider-error` when Resend rejects/fails.
- `console` only when `AUTH_TOKEN_RESPONSE_ENABLED=true`.
- `suppressed` when email does not match an account.

Resend verification:

`POST /api/v1/auth/resend-verification`

Possible delivery values:
- `email`
- `unconfigured`
- `provider-error`
- `console`
- `suppressed` when email is already verified.

## Security Impact

Positive:
- Production no longer needs to expose reset or verification tokens in API responses.
- Email links are generated server-side from stored hashed tokens.
- Missing email provider configuration fails closed without token leakage.

Constraints:
- Resend domain/sender must be verified before production email delivery can be fully validated.
- Email verification enforcement remains a later stage decision.

## Test Results

Passed:
- Backend build.
- Backend lint.
- Backend Jest test suite: 7 suites, 31 tests.
- EmailService unit tests:
  - unconfigured provider.
  - successful Resend request.
  - provider error.
- Docker Compose rebuild.
- Local auth endpoint smoke.
- Local forgot password smoke returned `delivery=unconfigured` without exposing token when Resend env is missing.
- Local missing-account forgot password smoke returned `delivery=suppressed`.
- Local resend verification smoke returned `delivery=unconfigured` for an authenticated, unverified delivery path.

Pending after GitHub push:
- Production Resend delivery test after Railway env variables are configured.

## Railway Production Setup

Set these variables in Railway backend service:

```text
RESEND_API_KEY=<resend-api-key>
EMAIL_FROM=UMKM Builder <noreply@your-verified-domain>
APP_PUBLIC_URL=https://myproject-beta-vert.vercel.app
AUTH_TOKEN_RESPONSE_ENABLED=false
```

Then redeploy Railway.

## Rollback Strategy

1. Revert the Stage 8.3 commit.
2. Redeploy backend.
3. Existing reset/verification token tables remain valid and do not require rollback.
4. Remove Resend env variables from Railway only if email delivery should be fully disabled.

## Decision

Stage 8.3 implementation is ready for Docker validation and production provider activation.
