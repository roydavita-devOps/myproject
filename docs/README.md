# UMKM Website Builder Documentation Index

This folder organizes planning, readiness, deployment, and audit artifacts by workflow.

## Folder Map

| Folder | Purpose | Status |
|---|---|---|
| `01-master-development` | Original product build phases, architecture, backend, frontend, DevOps, CI/CD, SaaS ops | Phase 1-8 completed as baseline implementation/docs |
| `02-production-readiness` | Production readiness, authentication enhancement, and go-live validation artifacts | Stage 1-8 completed; Stage 9-13 pending |
| `03-public-pilot-deployment` | Vendor-agnostic public pilot deployment planning for Supabase, Railway, Vercel | Phase 1-7 completed; public integrations confirmed externally |
| `04-database-deployment-audit` | Stage 5.9 database/deployment readiness audit | Audit complete; Supabase migration commands defined |
| `05-QA-signoff-Release-Candidate-Validation` | Stage 6 QA sign-off and release candidate validation | Completed with NO-GO decision |
| `06-Security Audit` | Stage 7 / Phase 9G security audit reports and future security remediation artifacts | Stage 7 completed with no Critical findings |

## Current Known Gaps

- Production Readiness Stage 6 - QA Sign-Off is completed; Stage 6.2 product scope decision descoped Tenant Switch from the current release candidate.
- Production Readiness Stage 7 - Security Audit is completed with no Critical findings.
- Stage 8 - Authentication Enhancement is completed locally; Google auth requires provider env configuration before production use.
- Stage 9 - Modern Template System is pending.
- Stage 10 - Pilot Customer Program is pending.
- Stage 11 - Monetization is pending.
- Stage 12 - Production Hardening is pending.
- Stage 13 - Production Customer Go-Live is pending.

## Notes

- Vercel, Supabase, and Railway integrations were confirmed externally by the project owner.
- `Password Akun.txt` is intentionally not organized here and should not be committed.
