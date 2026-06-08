# UMKM Builder Documentation

This documentation is organized as a knowledge base for project status, architecture, deployment, audits, authentication, templates, product strategy, evidence, and archive history.

Use this page as the 5-minute onboarding map.

## Current Status

Start here:

- [Project Status](./00-project/PROJECT_STATUS.md)
- [Roadmap](./00-project/ROADMAP.md)
- [Decisions](./00-project/DECISIONS.md)
- [Changelog](./00-project/CHANGELOG.md)
- [Product Vision](./00-project/PRODUCT_VISION.md)
- [Master Product Strategy](./00-project/MASTER_PRODUCT_STRATEGY.md)

Current summary:

- Authentication completed.
- Google Login completed.
- Google logout privacy enhancement completed.
- Email provider integration completed at code level.
- Production deployment integrations confirmed for Vercel, Railway, and Supabase.
- Stage 9 Sprint 2 Restaurant Template completed and final CTA defect fixed.
- Stage 9.1B documentation refactor completed.
- Stage 9.2 Template Architecture Validation completed.
- Stage 9.2A Template Registry Foundation completed.
- Stage 9.2B Template Registry Validation & Test Coverage implemented and awaiting approval.

## Architecture

Architecture references:

- [Architecture folder](./01-architecture/)
- [Phase 1 Architecture](./01-architecture/Phase-1-Architecture.md)
- [Database and Backend Design](./01-architecture/Phase-2-Database-Backend-Design.md)
- [SaaS Operations](./01-architecture/Phase-8-SaaS-Operations.md)
- [Template Architecture](./01-architecture/TEMPLATE_ARCHITECTURE.md)
- [Template Registry Foundation](./01-architecture/TEMPLATE_REGISTRY_FOUNDATION.md)
- [Template Registry Validation](./01-architecture/TEMPLATE_REGISTRY_VALIDATION.md)

Decision log:

- [Decisions](./00-project/DECISIONS.md)

## Development

Development workflow docs:

- [Development folder](./02-development/)

Historical implementation phase records:

- [Archive - Master Development](./archive/master-development/)

## Deployment

Deployment and operations references:

- [Deployment folder](./03-deployment/)
- [Production Readiness](<./03-deployment/Production Readiness.md>)
- [Public Pilot Deployment](<./03-deployment/Public Pilot Deployment.md>)
- [DevOps Infrastructure](./03-deployment/Phase-6-DevOps-Infrastructure.md)
- [CI/CD](./03-deployment/Phase-7-CICD.md)

Deployment reports:

- [Deployment reports](./03-deployment/reports/)

Current production services:

- Frontend: Vercel.
- Backend: Railway.
- Database: Supabase PostgreSQL.
- Repository: GitHub.

## Audits

Audit records:

- [Audits folder](./04-audits/)
- [Production readiness audits](./04-audits/production-readiness/)
- [Deployment audits](./04-audits/deployment/)
- [Database deployment audit](./04-audits/database-deployment/)
- [QA audits](./04-audits/QA/)
- [Security audits](./04-audits/security/)

## Authentication

Authentication references:

- [Authentication folder](./05-authentication/)
- Google Login.
- Google logout security.
- Onboarding UX.
- Email provider integration.

Current status:

- Google Login is complete.
- App logout disables Google auto-select without logging the user out from Google globally.
- Email provider integration is complete at code level.
- Email production activation is pending final sender/domain configuration.

## Modern Templates

Template implementation references:

- [Modern Template folder](./06-modern-template/)
- [Stage 9 Modern Template System](<./06-modern-template/# STAGE 9 — Modern Template System.md>)
- [Template reports](./06-modern-template/reports/)
- [Template evidence](./evidence/modern-template/)

Current status:

- Sprint 1 Design System Foundation completed.
- Sprint 1 Stabilization completed.
- Sprint 2 Restaurant Template completed.
- Sprint 2 Final CTA Visibility Fix completed.
- Stage 9.2A Template Registry Foundation completed.
- Stage 9.2B Template Registry Validation & Test Coverage implemented.

## Product Vision And Monetization

Product strategy:

- [Product Vision](./00-project/PRODUCT_VISION.md)
- [Master Product Strategy](./00-project/MASTER_PRODUCT_STRATEGY.md)
- [Product strategy folder](./08-product/)
- [Template Marketplace](./08-product/TEMPLATE_MARKETPLACE.md)
- [Monetization](./08-product/MONETIZATION.md)
- [Subscription Tiers](./08-product/SUBSCRIPTION_TIERS.md)
- [Template Catalog](./08-product/TEMPLATE_CATALOG.md)
- [Future Features](./08-product/FUTURE_FEATURES.md)

Core product principle:

```text
Business Type = Recommendation
Template = User Choice
```

## Evidence

Evidence files:

- [Evidence folder](./evidence/)
- [Modern template evidence](./evidence/modern-template/)

Evidence rules:

- Do not delete evidence files.
- Preserve screenshot filenames unless a future migration records a rename.

## Archive

Historical documents:

- [Archive folder](./archive/)

Archive rules:

- Archived files are preserved historical records.
- Do not delete archived files.
- `MASTER_PRODUCT_STRATEGY.md` is active and is not archived.

## Documentation Refactor Records

- [Documentation Audit Report](./DOCUMENTATION_AUDIT_REPORT.md)
- [Documentation Refactor Plan](./DOCUMENTATION_REFACTOR_PLAN.md)
- [Stage 9.1B Execution Report](./PHASE-9.1B-Documentation-Refactor-Execution-Report.md)
