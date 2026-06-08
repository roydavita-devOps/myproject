# STAGE 6.2 - Product Scope Clarification

Date: 2026-06-05
Status: APPROVED
Decision Type: Product Scope Decision

## Product Decision

The current SaaS model is:

```text
1 User = 1 Tenant
```

Tenant switching is intentionally out of scope for the current release candidate.

Users access a tenant through tenant-scoped authentication by providing the tenant slug during login.

Current behavior is accepted by product design.

## Tenant Switch Scope

Tenant Switch will not be implemented before Stage 7.

Tenant Switch will be treated as a future additional feature after the web application is running normally and the current release candidate is stable.

## Impact on Stage 6 Re-Run

The remaining Stage 6 finding:

```text
No explicit tenant switch route/UI found.
```

is now accepted as a product scope decision, not a release blocker.

## Release Candidate Interpretation

Stage 6.1 remediation remains valid:

- Sprint 1 - Website Persistence Fix: PASS
- Sprint 2 - Media Deletion Remediation: PASS
- Sprint 3 - Lint & Code Quality Remediation: PASS

With Tenant Switch formally descoped from the current release candidate, Stage 6 QA Sign-Off may proceed without implementing tenant switching.

## Future Backlog

Future feature candidate:

```text
Tenant Switch / Multi-Tenant Session Switching
```

Suggested timing:

After the web application is running normally in production/pilot and core user workflows remain stable.
