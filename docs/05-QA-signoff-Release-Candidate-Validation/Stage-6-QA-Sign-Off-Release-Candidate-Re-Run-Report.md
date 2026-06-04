# Stage 6 - QA Sign-Off & Release Candidate Validation Re-Run Report

Date: 2026-06-04
Environment:

- Local Docker stack: `http://localhost`
- Railway backend: `https://umkm-backend.up.railway.app`
- Vercel frontend: `https://myproject-beta-vert.vercel.app`

Scope:

- Re-run Stage 6 QA validation after Stage 6.1 Sprint 1, Sprint 2, and Sprint 3 remediation.
- Verify old Stage 6 findings.
- Verify regression coverage.
- Verify Sprint 1 website persistence fix.
- Verify Sprint 2 media deletion fix.
- Verify Sprint 3 lint and code quality fix.
- No feature work, architecture redesign, or unrelated refactor was performed during this re-run.

## Test Execution Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Backend unit tests | PASS | `npm --prefix backend run test`: 6 suites passed, 28 tests passed |
| Backend lint | PASS | `npm --prefix backend run lint` completed |
| Frontend lint | PASS | `npm --prefix frontend run lint` completed |
| Backend production build | PASS | `npm --prefix backend run build` completed |
| Frontend production build | PASS | `npm --prefix frontend run build` completed |
| Local smoke test | PASS | `npm run smoke-test`: 1 Playwright smoke test passed |
| Docker stack status | PASS | `docker compose ps`: backend, frontend, nginx, postgres running |
| Local readiness | PASS | `http://localhost/health/ready`: database check OK |
| GitHub Actions | PASS | Latest `main`, `staging`, and `pilot` build/test/smoke/docker jobs completed successfully |
| Railway readiness | PASS | `https://umkm-backend.up.railway.app/health/ready`: database check OK |
| Vercel production smoke | PASS | No console errors, no failed images, demo login OK, website fetch OK, gallery decode OK |

## Old Finding Verification

| Original Finding | Previous Severity | Re-Run Result | Status |
| --- | --- | --- | --- |
| Website edit/save did not persist submitted content | Critical | Website update persisted `businessName`, `tagline`, `description`, settings, long text, and special characters | FIXED |
| Image deletion was missing/unverified | High | Logo delete cleared DB and file returned 404; gallery delete archived DB record and file returned 404 | FIXED |
| Backend lint was not release-ready | Medium | Backend lint completed successfully | FIXED |
| Frontend lint was not release-ready | Medium | Frontend lint completed successfully | FIXED |
| Website update validation returned misleading no-op success | Medium | Empty website update now returns 400 | FIXED |
| Tenant switch flow was not implemented as a verified user journey | High | No explicit switch tenant route/UI found; login with `tenantSlug` creates a new session instead | REMAINS |
| Duplicate email behavior was ambiguous | Low | Same email across different tenants is allowed by tenant-scoped user uniqueness | ACCEPTABLE / DOCUMENTED |
| Full public-site broken-link crawl was not executed | Low | Production smoke found 0 failed images and 0 console errors; full crawler still not implemented | PARTIAL |

## Sprint Regression Validation

### Sprint 1 - Website Persistence Fix

| Validation | Result | Evidence |
| --- | --- | --- |
| Business name update persists | PASS | API update returned 200; refetch returned updated value |
| Tagline update persists | PASS | API update returned 200; refetch returned updated value |
| Description update persists | PASS | API update returned 200; refetch returned updated value |
| Website settings persist | PASS | Address, phone, WhatsApp, email, social media, maps URL, and opening hours accepted |
| Long text persists | PASS | Long description persisted |
| Special characters persist | PASS | Special characters persisted |
| Empty update rejected | PASS | Empty payload returned 400 |

### Sprint 2 - Media Deletion Remediation

| Validation | Result | Evidence |
| --- | --- | --- |
| Upload logo | PASS | PNG upload returned 201 and public file returned 200 |
| Delete logo | PASS | Delete returned 200, DB field cleared, public file returned 404 |
| Upload gallery image | PASS | WEBP upload returned 201 and gallery attach returned 201 |
| Delete gallery image | PASS | Delete returned 200, active gallery item removed, public file returned 404 |
| JPG compatibility | PASS | JPG upload returned 201 |
| PNG compatibility | PASS | PNG upload returned 201 |
| WEBP compatibility | PASS | WEBP upload returned 201 |
| Invalid file upload | PASS | Text file upload returned 400 |
| Cross-tenant media operation blocked | PASS | Tenant B could not read Tenant A website and could not delete Tenant A media |

### Sprint 3 - Lint & Code Quality Remediation

| Validation | Result | Evidence |
| --- | --- | --- |
| Backend lint | PASS | `npm --prefix backend run lint` |
| Frontend lint | PASS | `npm --prefix frontend run lint` |
| Backend build after lint remediation | PASS | `npm --prefix backend run build` |
| Frontend build after lint remediation | PASS | `npm --prefix frontend run build` |

## 1. Functional Test Matrix

### Authentication

| Journey | Status | Notes |
| --- | --- | --- |
| Login | PASS | API login returned 201; UI login reached dashboard |
| Logout | PASS | Authenticated API logout returned 201; smoke test validates UI logout |
| Invalid credentials | PASS | Wrong password returned 401 |
| Session persistence | PASS | UI login persisted into authenticated app route |
| Token refresh | PASS | Refresh endpoint returned a new session |

### Tenant Management

| Journey | Status | Notes |
| --- | --- | --- |
| Create tenant | PASS | Registration created tenant and initial website |
| Edit tenant | NOT TESTED | Endpoint requires `SUPER_ADMIN`; no super admin test account is available in current QA context |
| View tenant | NOT TESTED | Endpoint requires `SUPER_ADMIN`; tenant admin receives 403 |
| Switch tenant | FAIL | No explicit tenant switch route/UI found; current behavior requires login with another `tenantSlug` |

### Website Builder

| Journey | Status | Notes |
| --- | --- | --- |
| Edit website | PASS | Submitted fields persisted after refetch |
| Save website | PASS | API save returned 200 and refetch matched submitted values |
| Publish website | PASS | Published site returned 200 |
| Unpublish website | PASS | Unpublished site returned 404 |

### Media

| Journey | Status | Notes |
| --- | --- | --- |
| Upload logo | PASS | PNG logo upload and attach verified |
| Upload gallery image | PASS | WEBP gallery upload and attach verified |
| Delete image | PASS | Logo and gallery delete verified across DB and storage cleanup |
| Invalid file upload | PASS | Text file upload rejected with 400 |

### Public Website

| Journey | Status | Notes |
| --- | --- | --- |
| Open published website | PASS | Public endpoint returned 200 after publish |
| Open unpublished website | PASS | Public endpoint returned 404 after unpublish |
| Mobile responsiveness | PASS | Dashboard and editor controls visible at 390x844 |
| Broken links/images | PASS / PARTIAL | Vercel smoke found no failed images or console errors; exhaustive link crawler was not run |

## 2. Edge Case Report

| Edge Case | Status | Notes |
| --- | --- | --- |
| Empty forms | PASS | Missing registration fields returned 400; empty website update returned 400 |
| Duplicate email | PASS / DOCUMENTED | Same email across different tenants is allowed by tenant-scoped uniqueness; behavior should remain documented |
| Duplicate tenant slug | PASS | Duplicate slug returned 400 |
| Invalid image upload | PASS | Text file upload returned 400 |
| Invalid login | PASS | Wrong password returned 401 |
| Missing required fields | PASS | Empty registration payload returned 400 |
| Long text fields | PASS | Long description persisted |
| Special characters | PASS | Special characters persisted |
| Browser refresh during edit | PASS | Unsaved draft was discarded after refresh without corrupting persisted data |

## 3. Data Integrity Report

| Area | Status | Notes |
| --- | --- | --- |
| Tenant isolation | PASS | Tenant B token could not read Tenant A website |
| Data ownership | PASS | Website and media operations were scoped by tenant |
| Cross-tenant access prevention | PASS | Cross-tenant website read and media delete were blocked |
| Publish state consistency | PASS | Published site visible; unpublished site hidden |
| Image ownership consistency | PASS | Owned upload deletion removed storage object and active DB reference |

## 4. UX Findings

| Severity | Finding | Status | Evidence / Impact |
| --- | --- | --- | --- |
| High | Tenant switch flow is still not implemented as a verified user journey | OPEN | Requirement exists in Stage 6 matrix, but current UX requires logging in with a tenant slug rather than switching active session |
| Low | Tenant admin cannot validate tenant management edit/view flows | OPEN / TEST GAP | Tenant management endpoints are restricted to `SUPER_ADMIN`; no super admin test account exists |
| Low | Duplicate email behavior needs product documentation | ACCEPTED / DOCUMENTED | Same email across tenants is allowed; this is consistent with tenant-scoped uniqueness but should be explicit in product/auth docs |
| Low | Full public-site broken-link crawl is not implemented | OPEN / TEST GAP | Production smoke found no broken images or console errors, but exhaustive crawling was not run |

## 5. Release Candidate Decision

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 1 |
| Medium | 0 |
| Low | 3 |

Decision: NO-GO for full Stage 6 sign-off.

Justification:

Stage 6.1 remediation objectives are validated: Sprint 1, Sprint 2, and Sprint 3 all pass, and the previous critical/medium remediation findings are fixed. However, the original Stage 6 matrix still includes tenant switching as a critical user journey, and no explicit tenant switch route or UI exists. Because that High finding remains open, the full Stage 6 release candidate should not be signed off unless tenant switching is formally descoped or accepted as a login-with-tenant-slug workflow.

Recommendation:

- Ready to close Stage 6.1 remediation for Sprint 1, Sprint 2, and Sprint 3.
- Additional product decision required before Stage 7:
  - Implement tenant switch flow, or
  - Formally accept/descope tenant switching from the release candidate scope.

