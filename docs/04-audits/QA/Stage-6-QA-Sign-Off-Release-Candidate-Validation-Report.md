# Stage 6 - QA Sign-Off & Release Candidate Validation Report

Date: 2026-06-04
Environment: Local Docker stack via `http://localhost`
Scope: QA validation only. No feature work, architecture redesign, unrelated refactor, or code fixes were performed.

## Test Execution Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Backend unit tests | PASS | `npm --prefix backend run test`: 5 suites passed, 17 tests passed |
| Backend production build | PASS | `npm --prefix backend run build` completed |
| Frontend production build | PASS | `npm --prefix frontend run build` completed |
| Docker stack rebuild | PASS | `docker compose up -d --build` completed; backend, frontend, nginx, postgres running |
| Smoke test | PASS | `npm run smoke-test`: 1 Playwright smoke test passed |
| Backend lint | FAIL | `npm --prefix backend run lint` fails because ESLint v9 cannot find `eslint.config.*` |
| Frontend lint | FAIL | `npm --prefix frontend run lint` fails with TypeScript/TSX parsing errors and unused imports |

## 1. Functional Test Matrix

### Authentication

| Journey | Status | Notes |
| --- | --- | --- |
| Login | PASS | Verified through Playwright smoke test and API login |
| Logout | PASS | Verified through Playwright smoke test |
| Invalid credentials | PASS | API returned 401 `Invalid credentials` |
| Session persistence | PASS | Smoke test reused authenticated browser state across dashboard/editor navigation |
| Token refresh | PASS | Smoke test verified `/api/v1/auth/refresh` |

### Tenant Management

| Journey | Status | Notes |
| --- | --- | --- |
| Create tenant | PASS | Verified through registration flow |
| Edit tenant | NOT TESTED | Tenant edit endpoints require `SUPER_ADMIN`; no super admin test account was available in the QA context |
| View tenant | NOT TESTED | Tenant list/detail endpoints require `SUPER_ADMIN`; no super admin test account was available |
| Switch tenant | FAIL | No explicit tenant switch flow found; login accepts tenant slug, but there is no tested switch-session workflow |

### Website Builder

| Journey | Status | Notes |
| --- | --- | --- |
| Edit website | FAIL | Manual API test returned 200 but submitted `businessName`/`tagline` values were not persisted |
| Save website | FAIL | Same behavior as edit website: save request succeeds without persisting submitted fields |
| Publish website | PASS | Verified through smoke test and manual API test |
| Unpublish website | PASS | Manual API test changed published site to hidden state |

### Media

| Journey | Status | Notes |
| --- | --- | --- |
| Upload logo | PASS | Verified through smoke test |
| Upload gallery image | PASS | Verified through smoke test |
| Delete image | FAIL | No delete image endpoint or validated delete image UI flow found |
| Invalid file upload | PASS | Text file upload to logo endpoint returned 400 `Unsupported file type` |

### Public Website

| Journey | Status | Notes |
| --- | --- | --- |
| Open published website | PASS | `/api/v1/public/site/:slug` returned 200 after publish |
| Open unpublished website | PASS | `/api/v1/public/site/:slug` returned 404 after unpublish |
| Mobile responsiveness | PASS | Smoke test validated owner flow at 390x844 viewport |
| Broken links | NOT TESTED | Smoke test checks WhatsApp share link, but no full public-site link crawler was run |

## 2. Edge Case Report

| Edge Case | Status | Notes |
| --- | --- | --- |
| Empty forms | PARTIAL FAIL | Empty registration is rejected, but empty website `businessName` update returns 200 and is silently ignored |
| Duplicate email | FAIL | Same email can register under a different tenant; schema uses `@@unique([tenantId, email])`, while login DTO allows `tenantSlug` to be optional |
| Duplicate tenant slug | PASS | Duplicate slug returns 400 `Tenant slug is already used` |
| Invalid image upload | PASS | Unsupported MIME/content is rejected |
| Invalid login | PASS | Wrong password returns 401 |
| Missing required fields | PASS | Registration required fields are rejected with validation errors |
| Long text fields | FAIL | Long/special website update request returned 200 but data was not persisted |
| Special characters | FAIL | Special-character website update request returned 200 but data was not persisted |
| Browser refresh during edit | NOT TESTED | No automated or manual browser refresh-during-edit test was completed |

## 3. Data Integrity Report

| Area | Status | Notes |
| --- | --- | --- |
| Tenant isolation | PASS | Tenant A token could not read Tenant B website; API returned 404 |
| Data ownership | PASS | Website queries are scoped by `tenantId` in backend service methods |
| Cross-tenant access prevention | PASS | Manual cross-tenant website access test was blocked |
| Publish state consistency | PASS | Published site became public; unpublished site returned 404 |
| Image ownership consistency | PARTIAL | Upload URLs include tenant id and public read path is tenant-scoped, but there is no validated delete/cleanup path for uploaded assets |

## 4. UX Findings

| Severity | Finding | Evidence / Impact |
| --- | --- | --- |
| Critical | Website edit/save flow does not persist submitted content | Core builder workflow returns success-like 200 responses while keeping old content, so pilot users may believe changes were saved when they were not |
| High | Image deletion is not implemented or not exposed as a verified user flow | Media management requirement includes delete image, but no delete endpoint/UI flow was found |
| High | Tenant switch flow is not implemented as a verified user journey | Requirement includes switch tenant, but current UX appears to require login with tenant slug instead of switching an active session |
| Medium | Backend lint script is not release-ready | `npm --prefix backend run lint` fails due missing ESLint v9 flat config |
| Medium | Frontend lint script is not release-ready | `npm --prefix frontend run lint` fails to parse TypeScript/TSX with current ESLint config |
| Medium | Website update validation gives misleading success | Empty/invalid website or theme asset update returns 200 and silently ignores submitted data |
| Low | Duplicate email behavior is ambiguous | Duplicate email across tenants is allowed; this may be acceptable for multi-tenant identity, but login DTO keeps `tenantSlug` optional |
| Low | Full public-site broken-link crawl was not executed | Existing smoke test only validates selected dashboard/share UI links |

## 5. Release Candidate Decision

| Severity | Count |
| --- | ---: |
| Critical | 1 |
| High | 2 |
| Medium | 3 |
| Low | 2 |

Decision: NO-GO

Justification:
The release candidate should not be signed off while the core website builder edit/save journey returns successful responses without persisting submitted changes. This is a critical product workflow for the SaaS. In addition, media deletion and tenant switching remain unverified or missing against the Stage 6 matrix, and both lint scripts are currently failing, which weakens release confidence.

Required before GO:
- Fix and retest website update persistence and validation.
- Add or verify image deletion behavior.
- Clarify and implement or document tenant switch behavior.
- Repair backend and frontend lint configuration.
- Rerun Stage 6 smoke, edge case, data integrity, and UX validation.
