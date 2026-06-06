# PHASE 9G REPORT - Security Audit

Date: 2026-06-05
Stage: Production Readiness Stage 7 - Security Audit
Status: PASS WITH NON-CRITICAL FINDINGS

## Scope

Reviewed:

- JWT
- RBAC
- Tenant Isolation
- Secrets
- Docker
- API Security
- OWASP Top 10

Requirement:

- Implement all Critical findings.

Result:

- Critical findings: 0
- No code remediation was required during this stage.

## Audit Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Backend dependency critical audit | PASS | `npm --prefix backend audit --audit-level=critical`: 0 vulnerabilities |
| Frontend dependency critical audit | PASS | `npm --prefix frontend audit --audit-level=critical`: 0 vulnerabilities |
| Docker Compose config review | PASS | `docker compose config` completed; services/network/volumes resolved |
| Protected API without JWT | PASS | `GET /api/v1/websites` returned 401 |
| Invalid JWT | PASS | Invalid bearer token returned 401 |
| RBAC | PASS | `TENANT_ADMIN` access to `/api/v1/tenants` returned 403 |
| Tenant isolation read | PASS | Tenant B could not read Tenant A website; returned 404 |
| Tenant isolation write | PASS | Tenant B could not update Tenant A website; returned 404 |
| SQL-like slug probe | PASS | SQL-like public slug returned 404 |
| DTO whitelist | PASS | Non-whitelisted body field returned 400 |
| DTO validation | PASS | Invalid email field returned 400 |
| Upload spoofing | PASS | Spoofed PNG content returned 400 |
| Upload path traversal | PASS | Traversal-like upload URL returned 404 |
| Local CORS allowed origin | PASS | `http://localhost` reflected as allowed origin |
| Local CORS disallowed origin | PASS | `https://evil.example` not reflected |
| Backend Helmet headers | PASS | `x-content-type-options=nosniff`, `x-frame-options=SAMEORIGIN` |
| Railway readiness and security headers | PASS | Railway backend returned readiness OK, HSTS, CSP, XCTO, XFO, CORP |
| Railway CORS disallowed origin | PASS | `https://evil.example` not reflected |
| Vercel static frontend availability | PASS | Vercel frontend returned 200 |

## Security Control Review

### JWT

Status: PASS

Implemented controls:

- Access token required for protected routes.
- Invalid/missing access token returns 401.
- Access token secret is read from environment.
- Production env validation rejects missing, short, and placeholder JWT secrets.
- Refresh tokens are random 48-byte values.
- Refresh tokens are stored hashed with SHA-256.
- Refresh flow rotates refresh tokens by revoking the used token.
- Logout revokes the submitted refresh token.
- Password reset revokes active refresh tokens after password change.

Residual risk:

- Access tokens are stateless; token revocation before expiry is not implemented.
- Current access token lifetime is short (`15m`), so this is acceptable for pilot.

### RBAC

Status: PASS

Implemented controls:

- `JwtAuthGuard` enforces authenticated access.
- `RolesGuard` enforces role requirements.
- `TENANT_ADMIN` and `EDITOR` scopes are separated on website/upload/menu operations.
- Tenant admin cannot access super admin tenant management endpoints.

Residual risk:

- No super admin QA account is available, so super admin positive-path tenant management was not tested.

### Tenant Isolation

Status: PASS

Implemented controls:

- Tenant context is derived from JWT tenant id for tenant users.
- Website, menu, and media service operations scope reads/writes by `tenantId`.
- Cross-tenant website read/update returned 404.
- Cross-tenant media delete returned 404.
- Public website reads require published status.

Residual risk:

- PostgreSQL Row Level Security is not enabled. Current isolation is enforced at service/query layer.
- This is acceptable for the current architecture but should be reconsidered for high-risk tables as the platform scales.

### Secrets

Status: PASS WITH LOW RISK

Implemented controls:

- `.env` and `.env.local` are gitignored.
- `Password Akun.txt` remains untracked.
- Tracked environment files contain placeholders/local values, not real production secrets.
- Docker Compose requires JWT secrets through environment variables.
- Production validation blocks placeholder JWT secrets.

Residual risk:

- Template environment files include local placeholder credentials. This is acceptable as documentation, but values must not be reused in real environments.
- `docker compose config` prints resolved local secret values in terminal output; avoid sharing this output externally.

### Docker

Status: PASS WITH LOW/MEDIUM RISK

Implemented controls:

- Backend runtime image uses a non-root `app` user.
- Backend production image installs production dependencies only.
- PostgreSQL is bound to `127.0.0.1` locally.
- Backend is exposed only to the internal Docker network.
- Nginx is the public entry point for local compose.
- Nginx disables `server_tokens`.

Residual risk:

- Frontend image is based on nginx default runtime behavior; hardening is acceptable for pilot but should be reviewed before final go-live.
- Docker base images should be refreshed periodically.

### API Security

Status: PASS

Implemented controls:

- Global validation pipe uses whitelist and rejects non-whitelisted fields.
- Helmet is enabled on backend.
- CORS uses an explicit origin allowlist.
- Request rate limiting is configured globally.
- Prisma parameterized queries protect against SQL injection patterns.
- Uploads use MIME allowlist, magic-byte validation, size limits, randomized server-side filenames, and path traversal checks.
- Backend public upload read endpoint does not expose raw host directories.

Residual risk:

- Malware scanning is currently a signature hook. It catches the EICAR test signature when enabled, but it is not a full antivirus provider.
- Before high-volume public uploads, integrate a production malware scanning provider or object-storage scanning workflow.

## OWASP Top 10 Review

| OWASP Category | Status | Evidence / Notes |
| --- | --- | --- |
| A01 Broken Access Control | PASS | JWT/RBAC/TenantGuard enforced; cross-tenant read/write probes blocked |
| A02 Cryptographic Failures | PASS | Passwords hashed with bcrypt; refresh tokens hashed at rest; JWT secrets env-driven |
| A03 Injection | PASS | Prisma query layer; SQL-like slug probe returned 404; validation rejects malformed fields |
| A04 Insecure Design | PASS WITH LOW RISK | Product accepted `1 User = 1 Tenant`; tenant switch descoped by Stage 6.2 decision |
| A05 Security Misconfiguration | PASS WITH MEDIUM FINDING | Backend Helmet/CORS OK; Vercel static frontend lacks explicit security headers |
| A06 Vulnerable and Outdated Components | PASS | Backend/frontend critical npm audit returned 0 vulnerabilities |
| A07 Identification and Authentication Failures | PASS | Login/refresh/logout validated; invalid credentials rejected; short access token lifetime |
| A08 Software and Data Integrity Failures | PASS WITH LOW RISK | CI build/test/docker image jobs pass; no signed image/provenance policy yet |
| A09 Security Logging and Monitoring Failures | NOT IN STAGE 7 SCOPE | Observability is planned for Stage 8 |
| A10 Server-Side Request Forgery | PASS | No server-side arbitrary URL fetch flow was found in current implementation |

## Findings

| ID | Severity | Finding | Impact | Remediation |
| --- | --- | --- | --- | --- |
| SEC-001 | Medium | Vercel static frontend does not currently return explicit CSP, X-Frame-Options, or X-Content-Type-Options headers | Static frontend hardening is weaker than backend; browser-side protections rely on defaults and platform behavior | Add Vercel headers or frontend nginx headers for CSP, XCTO, XFO/frame-ancestors, Referrer-Policy, Permissions-Policy |
| SEC-002 | Medium | Malware scanning is a signature hook, not a production antivirus/object-storage scanning workflow | Malicious uploads beyond simple signatures may not be detected | Integrate a production malware scanning provider before high-volume public uploads |
| SEC-003 | Low | PostgreSQL RLS is not enabled | A service-layer bug could bypass tenant isolation if introduced later | Consider RLS for high-risk tables after pilot stabilization |
| SEC-004 | Low | Super admin positive-path RBAC was not tested | Super admin tenant management behavior is not fully validated | Create a controlled super admin QA account and add positive-path tests |
| SEC-005 | Low | Seed script logs demo credentials when run | Demo credentials can appear in local/CI logs | Avoid running seed in public logs or mask known demo password output |
| SEC-006 | Low | Static Docker/nginx frontend runtime could be further hardened | Container hardening is acceptable for pilot but not exhaustive | Review nginx runtime user, read-only filesystem, and security headers before final go-live |

## Critical Finding Remediation

Critical findings found: 0

Implemented during Stage 7: none required.

## Final Decision

Decision: PASS WITH NON-CRITICAL FINDINGS

Stage 7 Security Audit can be closed for the current pilot/release-candidate path because no Critical findings were identified.

Before final go-live, address Medium findings:

1. Add explicit frontend security headers.
2. Replace malware signature hook with a production scanning provider or object-storage scanning workflow.

STOP. Wait for approval before Stage 8 - Observability.
