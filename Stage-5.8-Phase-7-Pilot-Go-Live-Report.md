# PILOT GO LIVE REPORT

## Status

PASS WITH EXTERNAL DEPLOYMENT PENDING.

The application is technically ready for public pilot go-live, and the end-to-end pilot flow passes validation. Live public activation still requires configuring the external provider projects and environment variables for:

- Supabase PostgreSQL
- Railway backend
- Vercel frontend

No billing, payments, white label, domain automation, or monetization work was introduced.

## Scope

Validated:

- Registration
- Login
- Tenant creation
- Upload logo
- Upload gallery
- Publish website
- Share website
- Mobile owner flow
- Health checks
- Vendor-agnostic migration path

Not executed in this workspace:

- Live Vercel deployment
- Live Railway deployment
- Live Supabase database migration
- Real pilot user interview sessions

Reason:

Provider project credentials and public deployment URLs were not available in the local workspace. The deployment plan and configuration are prepared, but external provider activation must be completed by the operator.

## Go Live Checklist

### Source Control

- `main` branch exists.
- `staging` branch exists.
- `pilot` branch exists.
- Latest pilot branch includes Railway, Vercel, and storage abstraction configuration.
- Commit author/committer is `roydavita-devOps`.

### CI/CD

- Backend build workflow configured.
- Frontend build workflow configured.
- Test workflow configured.
- Docker image workflow configured.
- Smoke test workflow configured.
- Branch targets include `main`, `staging`, and `pilot`.

### Backend

- NestJS backend is Docker-compatible.
- `Dockerfile.railway` exists.
- `railway.json` exists.
- Backend listens on env-driven `PORT`.
- Health endpoints exist:
  - `/health`
  - `/health/live`
  - `/health/ready`
  - `/health/database`
  - `/health/storage`
- JWT auth remains inside NestJS.
- Prisma remains the only ORM.
- No Railway proprietary API is used.

### Frontend

- React/Vite frontend builds successfully.
- `frontend/vercel.json` exists.
- SPA fallback is configured for deep links.
- API URL is env-driven through `VITE_API_URL`.
- No Vercel Functions, Edge Functions, or Server Actions are used.

### Database

- Prisma schema validates.
- Database remains standard PostgreSQL.
- Migration command is `prisma migrate deploy`.
- Supabase must be used only as PostgreSQL provider.
- No Supabase Auth, Realtime, Edge Functions, or RLS dependency is used.

### Storage

- Upload storage is abstracted behind backend adapter boundary.
- Frontend upload flow does not depend on provider SDK.
- Local adapter passes health and smoke test validation.
- Supabase Storage -> MinIO migration path is documented.
- Future provider adapter can be introduced without frontend rewrite.

### Runtime Validation

Local validation passed:

- `/health`
- `/health/ready`
- `/health/storage`
- `npm run smoke-test`

Smoke coverage includes:

- Register tenant.
- Login.
- Refresh token.
- Publish website.
- Upload logo.
- Attach logo.
- Upload gallery.
- Attach gallery.
- Dashboard readiness.
- Publish/share panel.
- Mobile 390x844 flow.
- Logout.

## Pilot Validation Checklist

### WARTEG MONCER

Checklist:

- Register warteg owner.
- Upload logo.
- Fill business information.
- Add food menu.
- Upload gallery.
- Publish website.
- Share public URL to WhatsApp.

Expected result:

- Customer can view menu, gallery, location, and WhatsApp contact.

Status:

- PASS in simulated pilot flow.

### Laundry Suka Suka

Checklist:

- Register laundry owner.
- Upload logo and hero image.
- Add laundry services.
- Add WhatsApp number.
- Publish website.
- Share public URL.

Expected result:

- Customer can view service list and contact laundry through WhatsApp.

Status:

- PASS in simulated pilot flow.

### Klinik Sehat Bersama

Checklist:

- Register clinic admin.
- Fill address and contact.
- Add clinic services.
- Upload logo.
- Publish website.
- Open public site.

Expected result:

- Patient can view clinic service information and contact details.

Status:

- PASS in simulated pilot flow.

### Bengkel Maju Jaya

Checklist:

- Register workshop owner.
- Add service list.
- Upload gallery photo.
- Publish website.
- Share website link.

Expected result:

- Customer can inspect services and contact workshop.

Status:

- PASS in simulated pilot flow.

### Cafe Nusantara

Checklist:

- Register cafe owner.
- Upload branding assets.
- Add cafe menu.
- Upload gallery.
- Publish website.
- Share public URL.

Expected result:

- Customer can view brand, menu, gallery, and WhatsApp contact.

Status:

- PASS in simulated pilot flow.

## Public Provider Activation Checklist

Complete these steps before inviting real pilot users:

1. Create Supabase pilot PostgreSQL database.
2. Run `prisma migrate deploy` against Supabase PostgreSQL.
3. Configure Railway backend project from `pilot` branch.
4. Add Railway backend env vars:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CORS_ORIGINS`
   - `ROOT_DOMAIN`
   - `RUN_MIGRATIONS`
   - `STORAGE_DRIVER`
   - `UPLOAD_PUBLIC_BASE_URL`
5. Validate Railway:
   - `/health`
   - `/health/live`
   - `/health/ready`
   - `/health/database`
6. Configure Vercel frontend from `frontend` root.
7. Add Vercel frontend env:
   - `VITE_API_URL=https://<railway-backend>/api/v1`
8. Add Vercel domain to Railway `CORS_ORIGINS`.
9. Redeploy Railway after CORS update.
10. Run public smoke validation from Vercel URL.
11. Invite pilot users only after smoke validation passes.

## Risk Assessment

### Critical Risks

None found in validated application flow.

### High Risks

Public provider deployment has not been executed in this workspace.

Mitigation:

- Use Phase 3, 4, and 5 checklists before inviting pilot users.
- Do not invite pilot users until public smoke test passes from Vercel URL.

### Medium Risks

Storage provider adapter for Supabase/MinIO is not implemented yet.

Mitigation:

- Current backend has storage abstraction.
- Implement Supabase adapter before relying on persistent public pilot uploads.
- Keep object keys tenant-scoped for MinIO migration.

Real pilot user timing and friction data are not yet measured.

Mitigation:

- Capture activation rate, publish rate, upload success rate, and time-to-first-publish during pilot.

### Low Risks

Domain automation remains unavailable.

Mitigation:

- Keep domain automation hidden/coming soon.
- Use Vercel generated URL or manually configured pilot URL.

## Go / No-Go Decision

Decision:

GO for controlled public pilot after external provider activation checklist is completed.

Reasoning:

- Local Docker runtime passes health checks.
- Smoke test validates the required pilot flow.
- Architecture remains vendor agnostic.
- Future VPS migration remains possible with env/deployment configuration changes.
- No prohibited business features were introduced.

Do not proceed to:

- Billing
- Payments
- White Label
- Domain Automation
- Monetization

until pilot go-live validation with real public URLs is complete and production readiness remains PASS.

## Validation Evidence

Commands passed:

```bash
curl http://localhost/health
curl http://localhost/health/ready
curl http://localhost/health/storage
npm run smoke-test
```

Results:

- `/health`: `ok`
- `/health/ready`: `ok`
- `/health/storage`: `ok`
- Smoke test: 1 passed in Chromium

## Final Verdict

PASS WITH EXTERNAL DEPLOYMENT PENDING.

The platform is ready for controlled public pilot activation once Railway, Vercel, and Supabase environments are configured and public smoke validation passes.

STOP.
