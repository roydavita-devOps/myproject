# Stage 9.1 - Documentation Refactor Plan

Date: 2026-06-06

## Scope

This is a planning document only. No files have been moved, renamed, deleted, or archived during Stage 9.1.

## Refactor Goals

- Preserve complete project history.
- Improve discoverability for new developers.
- Improve auditability for production, security, deployment, and QA records.
- Make executive status readable within 5 minutes.
- Separate active knowledge-base documents from historical execution artifacts.
- Keep all evidence files accessible.

## Proposed Structure

Recommended target structure:

```text
docs/
├── README.md
├── DOCUMENTATION_AUDIT_REPORT.md
├── DOCUMENTATION_REFACTOR_PLAN.md
│
├── 00-project/
│   ├── PROJECT_STATUS.md
│   ├── ROADMAP.md
│   ├── CHANGELOG.md
│   ├── PRODUCT_VISION.md
│   └── DECISIONS.md
│
├── 01-architecture/
│   ├── README.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATABASE_BACKEND_DESIGN.md
│   └── SAAS_OPERATIONS.md
│
├── 02-development/
│   ├── README.md
│   └── DEVELOPMENT_HISTORY.md
│
├── 03-deployment/
│   ├── README.md
│   ├── PRODUCTION_READINESS.md
│   ├── PUBLIC_PILOT_DEPLOYMENT.md
│   ├── SUPABASE.md
│   ├── RAILWAY.md
│   ├── VERCEL.md
│   └── CICD.md
│
├── 04-audits/
│   ├── README.md
│   ├── QA/
│   ├── production-readiness/
│   ├── database-deployment/
│   └── deployment/
│
├── 05-authentication/
│   ├── README.md
│   ├── AUTHENTICATION_OVERVIEW.md
│   ├── GOOGLE_LOGIN.md
│   ├── GOOGLE_LOGOUT_SECURITY.md
│   └── EMAIL_PROVIDER.md
│
├── 06-modern-template/
│   ├── README.md
│   ├── MODERN_TEMPLATE_SYSTEM.md
│   ├── TEMPLATE_MARKETPLACE_STRATEGY.md
│   └── reports/
│
├── 07-business/
│   └── README.md
│
├── 08-product/
│   ├── TEMPLATE_MARKETPLACE.md
│   ├── MONETIZATION.md
│   ├── SUBSCRIPTION_TIERS.md
│   ├── TEMPLATE_CATALOG.md
│   └── FUTURE_FEATURES.md
│
├── evidence/
│   └── modern-template/
│       ├── sprint1/
│       └── sprint2/
│
└── archive/
    ├── master-development/
    ├── production-readiness/
    ├── public-pilot-deployment/
    ├── qa/
    ├── security/
    ├── authentication/
    └── modern-template/
```

## New Files To Create

These files should be created during Phase 2. They should summarize and link to historical source documents, not replace them.

### `docs/00-project/PROJECT_STATUS.md`

Must include:

- Current stage: Stage 9.1 Documentation Refactoring planning complete; execution pending approval.
- Completed stages:
  - Master Development Phase 1-8 baseline.
  - Production Readiness through Stage 8.
  - Authentication and Google Login.
  - Stage 8.2.1 Google logout security enhancement.
  - Stage 8.3 Resend email provider integration at code level.
  - Stage 9 Sprint 1 Design System Foundation.
  - Stage 9 Sprint 1 Stabilization.
  - Stage 9 Sprint 2 Restaurant Template.
  - Stage 9 Sprint 2 Final Fix.
- Current blockers:
  - Email production activation pending final domain/sender configuration.
  - Documentation refactor execution pending approval.
  - Later templates not started by explicit hard stop.
- Next actions:
  - Approve Phase 2 documentation refactor execution.
  - Execute file moves without deletion.
  - Update links and root index.
  - Resume Stage 9 future sprints only after approval.

### `docs/00-project/ROADMAP.md`

Must include:

- Completed:
  - Authentication.
  - Google Login.
  - Production readiness remediation.
  - Public pilot deployment setup.
  - Security audit.
  - Restaurant template Sprint 2.
- In Progress:
  - Documentation refactor.
  - Modern template system.
- Planned:
  - Sprint 3 Laundry.
  - Sprint 4 Clinic.
  - Sprint 5 Corporate.
  - Sprint 6 Cafe.
  - Template Marketplace Strategy.
  - Business Type = Recommendation.
  - Template = User Selectable.
  - Premium Template Strategy.
  - Subscription Based Template Access.
- Future Vision:
  - Marketplace, premium packs, industry-specific templates, paid template tiers.

### `docs/00-project/PRODUCT_VISION.md`

Must include:

- SaaS vision.
- Template marketplace vision.
- Monetization strategy.
- Premium template roadmap.
- Owner-facing simplicity: business type recommends templates; users can select templates.

### `docs/00-project/DECISIONS.md`

Must capture:

- Google Login Strategy.
- Google logout auto-select disable behavior.
- Email provider activation deferred until final domain.
- Template Architecture.
- Business Type Recommendation Model.
- Future Template Marketplace.
- Tenant Switch deferred as future feature.
- Stage-gate execution with hard stops.

### `docs/00-project/CHANGELOG.md`

Must include high-level milestones only:

- Phase 1-8 baseline implementation.
- Production readiness stages.
- Public pilot deployment.
- QA remediation.
- Security audit.
- Authentication and Google login.
- Email provider integration.
- Modern template Sprint 1 and Sprint 2.
- Documentation refactor planning.

### `docs/README.md`

Should be replaced during Phase 2 with a new 5-minute onboarding index linking to:

- Project status.
- Roadmap.
- Product vision.
- Decisions.
- Architecture.
- Deployment.
- Audits.
- Authentication.
- Modern templates.
- Evidence.
- Archive.

## Files To Keep

No existing file should be kept in its current path without review. The content is valuable, but the current structure is not aligned with the desired knowledge-base model.

## Files To Move

Move these active references into the new topic folders during Phase 2.

### Project Strategy

| Current file | Target |
| --- | --- |
| `docs/01-master-development/Master&Development.md` | `docs/00-project/MASTER_PRODUCT_STRATEGY.md` |

### Architecture

| Current file | Target |
| --- | --- |
| `docs/01-master-development/Phase-1-Architecture.md` | `docs/01-architecture/Phase-1-Architecture.md` |
| `docs/01-master-development/Phase-2-Database-Backend-Design.md` | `docs/01-architecture/Phase-2-Database-Backend-Design.md` |
| `docs/01-master-development/Phase-8-SaaS-Operations.md` | `docs/01-architecture/Phase-8-SaaS-Operations.md` |

### Development

| Current file | Target |
| --- | --- |
| `docs/01-master-development/Phase-6-DevOps-Infrastructure.md` | `docs/03-deployment/Phase-6-DevOps-Infrastructure.md` |
| `docs/01-master-development/Phase-7-CICD.md` | `docs/03-deployment/Phase-7-CICD.md` |

### Deployment

| Current file | Target |
| --- | --- |
| `docs/02-production-readiness/Production Readiness.md` | `docs/03-deployment/Production Readiness.md` |
| `docs/03-public-pilot-deployment/Public Pilot Deployment.md` | `docs/03-deployment/Public Pilot Deployment.md` |
| `docs/03-public-pilot-deployment/Stage-5.8-Phase-2-GitHub-Preparation-Report.md` | `docs/03-deployment/reports/Stage-5.8-Phase-2-GitHub-Preparation-Report.md` |
| `docs/03-public-pilot-deployment/Stage-5.8-Phase-3-Supabase-Database-Report.md` | `docs/03-deployment/reports/Stage-5.8-Phase-3-Supabase-Database-Report.md` |
| `docs/03-public-pilot-deployment/Stage-5.8-Phase-4-Railway-Deployment-Report.md` | `docs/03-deployment/reports/Stage-5.8-Phase-4-Railway-Deployment-Report.md` |
| `docs/03-public-pilot-deployment/Stage-5.8-Phase-5-Vercel-Deployment-Report.md` | `docs/03-deployment/reports/Stage-5.8-Phase-5-Vercel-Deployment-Report.md` |
| `docs/03-public-pilot-deployment/Stage-5.8-Phase-6-Storage-Validation-Report.md` | `docs/03-deployment/reports/Stage-5.8-Phase-6-Storage-Validation-Report.md` |
| `docs/03-public-pilot-deployment/Stage-5.8-Phase-7-Pilot-Go-Live-Report.md` | `docs/03-deployment/reports/Stage-5.8-Phase-7-Pilot-Go-Live-Report.md` |

### Audits

| Current file | Target |
| --- | --- |
| `docs/02-production-readiness/Phase-9B-Demo-Environment-Report.md` | `docs/04-audits/production-readiness/Phase-9B-Demo-Environment-Report.md` |
| `docs/02-production-readiness/Phase-9C-Health-Environment-Report.md` | `docs/04-audits/production-readiness/Phase-9C-Health-Environment-Report.md` |
| `docs/02-production-readiness/Phase-9D-Upload-Hardening-Report.md` | `docs/04-audits/production-readiness/Phase-9D-Upload-Hardening-Report.md` |
| `docs/02-production-readiness/Phase-9E-Smoke-Testing-Report.md` | `docs/04-audits/production-readiness/Phase-9E-Smoke-Testing-Report.md` |
| `docs/02-production-readiness/Phase-9E5-UX-Validation-Report.md` | `docs/04-audits/production-readiness/Phase-9E5-UX-Validation-Report.md` |
| `docs/02-production-readiness/Stage-5.6-UX-Remediation-Completion-Report.md` | `docs/04-audits/production-readiness/Stage-5.6-UX-Remediation-Completion-Report.md` |
| `docs/02-production-readiness/Stage-5.7-Pilot-User-Validation-Final-Report.md` | `docs/04-audits/production-readiness/Stage-5.7-Pilot-User-Validation-Final-Report.md` |
| `docs/03-public-pilot-deployment/Stage-5.8-Phase-1-Architecture-Review-Report.md` | `docs/04-audits/deployment/Stage-5.8-Phase-1-Architecture-Review-Report.md` |
| `docs/04-database-deployment-audit/Database & Deployment Readiness Audit.md` | `docs/04-audits/database-deployment/Database & Deployment Readiness Audit.md` |
| `docs/05-QA-signoff-Release-Candidate-Validation/# Stage 6 - QA Sign-Off & Release Candidate Validation.md` | `docs/04-audits/QA/# Stage 6 - QA Sign-Off & Release Candidate Validation.md` |
| `docs/05-QA-signoff-Release-Candidate-Validation/Phase-9F.1-Website-Persistence-Remediation-Report.md` | `docs/04-audits/QA/Phase-9F.1-Website-Persistence-Remediation-Report.md` |
| `docs/05-QA-signoff-Release-Candidate-Validation/Phase-9F.2-Media-Deletion-Remediation-Report.md` | `docs/04-audits/QA/Phase-9F.2-Media-Deletion-Remediation-Report.md` |
| `docs/05-QA-signoff-Release-Candidate-Validation/Phase-9F.3-Lint-Code-Quality-Remediation-Report.md` | `docs/04-audits/QA/Phase-9F.3-Lint-Code-Quality-Remediation-Report.md` |
| `docs/05-QA-signoff-Release-Candidate-Validation/Stage-6-QA-Sign-Off-Release-Candidate-Validation-Report.md` | `docs/04-audits/QA/Stage-6-QA-Sign-Off-Release-Candidate-Validation-Report.md` |
| `docs/05-QA-signoff-Release-Candidate-Validation/Stage-6-QA-Sign-Off-Release-Candidate-Re-Run-Report.md` | `docs/04-audits/QA/Stage-6-QA-Sign-Off-Release-Candidate-Re-Run-Report.md` |
| `docs/06-Security Audit/Phase-9G-Security-Audit-Report.md` | `docs/04-audits/security/Phase-9G-Security-Audit-Report.md` |

### Authentication

| Current file | Target |
| --- | --- |
| `docs/02-production-readiness/Phase-10A-Authentication-Enhancement-Report.md` | `docs/05-authentication/Phase-10A-Authentication-Enhancement-Report.md` |
| `docs/07-Authentication Google/# STAGE 8.1 - AUTHENTICATION.md` | `docs/05-authentication/# STAGE 8.1 - AUTHENTICATION.md` |
| `docs/07-Authentication Google/Authentication-Readiness-Report.md` | `docs/05-authentication/Authentication-Readiness-Report.md` |
| `docs/07-Authentication Google/# STAGE 8.2 - Authentication & Onboarding UX Refinement.md` | `docs/05-authentication/# STAGE 8.2 - Authentication & Onboarding UX Refinement.md` |
| `docs/07-Authentication Google/Stage-8.2-Authentication-Onboarding-Report.md` | `docs/05-authentication/Stage-8.2-Authentication-Onboarding-Report.md` |
| `docs/07-Authentication Google/Stage-8.2.1-Google-Logout-Security-Enhancement-Report.md` | `docs/05-authentication/Stage-8.2.1-Google-Logout-Security-Enhancement-Report.md` |
| `docs/07-Authentication Google/Stage-8.3-Email-Provider-Integration-Report.md` | `docs/05-authentication/Stage-8.3-Email-Provider-Integration-Report.md` |

### Modern Template

| Current file | Target |
| --- | --- |
| `docs/08-Modern Template/# STAGE 9 - Modern Template System.md` | `docs/06-modern-template/# STAGE 9 - Modern Template System.md` |
| `docs/08-Modern Template/PHASE-10B-Sprint1-Design-System-Review.md` | `docs/06-modern-template/reports/PHASE-10B-Sprint1-Design-System-Review.md` |
| `docs/08-Modern Template/PHASE-10B-Sprint1-Stabilization-Report.md` | `docs/06-modern-template/reports/PHASE-10B-Sprint1-Stabilization-Report.md` |
| `docs/08-Modern Template/PHASE-10B-Sprint2-Restaurant-Template-Report.md` | `docs/06-modern-template/reports/PHASE-10B-Sprint2-Restaurant-Template-Report.md` |
| `docs/08-Modern Template/PHASE-10B-Sprint2-Restaurant-Remediation-Report.md` | `docs/06-modern-template/reports/PHASE-10B-Sprint2-Restaurant-Remediation-Report.md` |
| `docs/08-Modern Template/PHASE-10B-Sprint2-FinalFix-Report.md` | `docs/06-modern-template/reports/PHASE-10B-Sprint2-FinalFix-Report.md` |

### Evidence

| Current folder | Target folder |
| --- | --- |
| `docs/08-Modern Template/evidence/sprint1-*.png` | `docs/evidence/modern-template/sprint1/` |
| `docs/08-Modern Template/evidence/sprint2-restaurant-*.png` | `docs/evidence/modern-template/sprint2/restaurant/` |
| `docs/08-Modern Template/evidence/sprint2-remediation-*.png` | `docs/evidence/modern-template/sprint2/remediation/` |
| `docs/08-Modern Template/evidence/sprint2-finalfix-*.png` | `docs/evidence/modern-template/sprint2/finalfix/` |

## Files To Merge

Merge means copy the active decision/status content into new knowledge-base documents while preserving the original file.

| Source | Merge target | Reason |
| --- | --- | --- |
| `docs/README.md` | `docs/README.md`, `docs/00-project/PROJECT_STATUS.md`, `docs/00-project/ROADMAP.md` | Current index has useful folder summary but outdated status. |
| `docs/05-QA-signoff-Release-Candidate-Validation/# STAGE 6.2 - Product Scope Clarification.md` | Keep original Stage 6.2 record in QA sign-off folder; summarize decision in `docs/00-project/DECISIONS.md`, `docs/00-project/PROJECT_STATUS.md`, and `docs/00-project/ROADMAP.md`. | Tenant Switch deferral is a product decision and QA sign-off evidence. |
| Stage 8 reports | `docs/05-authentication/AUTHENTICATION_OVERVIEW.md` | Auth stage should have one readable overview. |
| Stage 9 reports | `docs/06-modern-template/MODERN_TEMPLATE_SYSTEM.md` and `docs/06-modern-template/TEMPLATE_MARKETPLACE_STRATEGY.md` | Template direction should be readable without opening every sprint report. |
| Deployment reports | `docs/03-deployment/README.md` | Deployment status needs a single operational index. |
| Audit reports | `docs/04-audits/README.md` | Audits need one audit matrix and link map. |

## Files To Archive

Move these historical-only files to `docs/archive/` during Phase 2. Do not delete.

| Current file | Archive target |
| --- | --- |
| `docs/01-master-development/Phase-3-Backend-Implementation.md` | `docs/archive/master-development/Phase-3-Backend-Implementation.md` |
| `docs/01-master-development/Phase-4-Frontend-Design.md` | `docs/archive/master-development/Phase-4-Frontend-Design.md` |
| `docs/01-master-development/Phase-5-Frontend-Implementation.md` | `docs/archive/master-development/Phase-5-Frontend-Implementation.md` |
| `docs/01-master-development/README.md` | `docs/archive/master-development/README.md` |
| `docs/02-production-readiness/README.md` | `docs/archive/production-readiness/README.md` |
| `docs/03-public-pilot-deployment/README.md` | `docs/archive/public-pilot-deployment/README.md` |
| `docs/04-database-deployment-audit/README.md` | `docs/archive/database-deployment-audit/README.md` |
| `docs/05-QA-signoff-Release-Candidate-Validation/# STAGE 6.1 - QA REMEDIATION PROGRAM.md` | `docs/archive/qa/# STAGE 6.1 - QA REMEDIATION PROGRAM.md` |
| `docs/06-Security Audit/README.md` | `docs/archive/security/README.md` |
| `docs/08-Modern Template/# STAGE 9 , Sprint 2 Remediation.md` | `docs/archive/modern-template/# STAGE 9 , Sprint 2 Remediation.md` |

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Broken links after moving files | New readers cannot follow references. | Use `rg` to find old paths and update links after each move batch. |
| Evidence becomes hard to map to reports | Auditability decreases. | Preserve filenames and create evidence index files. |
| Historical context is lost in summaries | Product decisions become ambiguous. | Keep original files in archive and link summaries back to sources. |
| Folder renaming causes confusion | Team may not know where old files went. | Add archive README and migration map. |
| Docs zip/untracked private files accidentally committed | Sensitive or unwanted files enter repo. | Do not add `docs.zip`, `Password Akun.txt`, or unrelated untracked files. |
| Stage status drift | Roadmap and README become inaccurate. | Update `PROJECT_STATUS.md` after every approved stage. |

## Migration Strategy

Phase 2 should proceed in this order:

1. Create new folders:
   - `00-project`
   - `01-architecture`
   - `02-development`
   - `03-deployment`
   - `04-audits`
   - `05-authentication`
   - `06-modern-template`
   - `07-business`
   - `08-product`
   - `evidence`
   - `archive`
2. Create knowledge-base documents:
   - `PROJECT_STATUS.md`
   - `ROADMAP.md`
   - `CHANGELOG.md`
   - `PRODUCT_VISION.md`
   - `DECISIONS.md`
   - `MASTER_PRODUCT_STRATEGY.md`
3. Move active architecture/deployment/auth/template docs into their target folders.
4. Move audit reports into `04-audits/`.
5. Move screenshots into `docs/evidence/modern-template/`.
6. Move historical-only files into `docs/archive/`.
7. Rewrite `docs/README.md` as a 5-minute onboarding index.
8. Add README files for major folders.
9. Run link/path validation:
   - `rg "01-master-development|02-production-readiness|03-public-pilot-deployment|04-database-deployment-audit|05-QA|06-Security|07-Authentication|08-Modern" docs`
10. Commit documentation-only changes.

## Validation Plan

After Phase 2 execution:

- Confirm no tracked documentation file was deleted without being moved.
- Confirm all evidence files still exist.
- Confirm `docs/README.md` links to major documents.
- Confirm `PROJECT_STATUS.md` reflects current approved status.
- Confirm `ROADMAP.md` includes:
  - Template Marketplace Strategy.
  - Business Type = Recommendation.
  - Template = User Selectable.
  - Premium Template Strategy.
  - Subscription Based Template Access.
- Confirm `DECISIONS.md` includes:
  - Google Login Strategy.
  - Template Architecture.
  - Business Type Recommendation Model.
  - Future Template Marketplace.
- Confirm no application code was modified.

## Recommendations

1. Approve Phase 2 only after reviewing this plan.
2. Do not start Sprint 3 Laundry until documentation refactor execution is approved or explicitly deferred.
3. Treat `docs/00-project/PROJECT_STATUS.md` as the canonical source of current stage and blockers.
4. Treat `docs/00-project/DECISIONS.md` as the canonical source of product and architecture decisions.
5. Keep all original reports, even if archived.

## Hard Stop

Stage 9.1 planning is complete after this file and `DOCUMENTATION_AUDIT_REPORT.md` are generated.

No refactor execution should occur until approval is given.
