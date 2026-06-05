# UMKM Website Builder Documentation Index

This folder organizes planning, readiness, deployment, and audit artifacts by workflow.

## Folder Map

| Folder | Purpose | Status |
|---|---|---|
| `01-master-development` | Original product build phases, architecture, backend, frontend, DevOps, CI/CD, SaaS ops | Phase 1-8 completed as baseline implementation/docs |
| `02-production-readiness` | Phase 9 production readiness and UX/pilot readiness reports | Stage 1-7 completed; Stage 8-10 pending |
| `03-public-pilot-deployment` | Vendor-agnostic public pilot deployment planning for Supabase, Railway, Vercel | Phase 1-7 completed; public integrations confirmed externally |
| `04-database-deployment-audit` | Stage 5.9 database/deployment readiness audit | Audit complete; Supabase migration commands defined |
| `05-QA-signoff-Release-Candidate-Validation` | Stage 6 QA sign-off and release candidate validation | Completed with NO-GO decision |

## Current Known Gaps

- Production Readiness Stage 6 - QA Sign-Off is completed; Stage 6.2 product scope decision descoped Tenant Switch from the current release candidate.
- Production Readiness Stage 7 - Security Audit is completed with no Critical findings.
- Production Readiness Stage 8 - Observability is pending.
- Production Readiness Stage 9 - Backup & Disaster Recovery implementation is pending.
- Production Readiness Stage 10 - Final Go Live Validation is pending.

## Notes

- Vercel, Supabase, and Railway integrations were confirmed externally by the project owner.
- `Password Akun.txt` is intentionally not organized here and should not be committed.
