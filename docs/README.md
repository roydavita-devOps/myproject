# UMKM Builder Documentation

Use this page as the main navigation map for the repository documentation.

## Current Source Of Truth

Start here:

- [Project Status](./00-project/PROJECT_STATUS.md)
- [Roadmap](./00-project/ROADMAP.md)
- [Decisions](./00-project/DECISIONS.md)
- [Master Product Strategy](./00-project/MASTER_PRODUCT_STRATEGY.md)

Current stage:

- Stage 9.12A.1 - Docs & Project Structure Cleanup Before Railway Reactivation.
- Railway remains inactive/expired.
- Actual Railway reactivation, production redeploy, and production migrations are deferred to Stage 9.12B.

## Where To Find Things

| Need | Go to |
| --- | --- |
| Current status, roadmap, decisions | [00-project](./00-project/) |
| Architecture, deployment design, production relaunch runbooks | [01-architecture](./01-architecture/) |
| Development notes | [02-development](./02-development/) |
| Deployment history and historical deployment docs | [03-deployment](./03-deployment/) |
| Audits and QA/security evidence | [04-audits](./04-audits/) |
| Authentication docs | [05-authentication](./05-authentication/) |
| Modern template docs and Stage 9 reports | [06-modern-template](./06-modern-template/) |
| Product/template strategy | [08-product](./08-product/) |
| Screenshot and validation artifacts | [evidence](./evidence/) |
| Historical files no longer active | [archive](./archive/) |

## Production Relaunch Docs

Preparation-only docs for future Stage 9.12B:

- [Production Relaunch Preparation](./01-architecture/PRODUCTION_RELAUNCH_PREPARATION.md)
- [Deployment Environment Matrix](./01-architecture/DEPLOYMENT_ENVIRONMENT_MATRIX.md)
- [Production Env Manual Checklist](./01-architecture/PRODUCTION_ENV_MANUAL_CHECKLIST.md)
- [Production Smoke Test Plan](./01-architecture/PRODUCTION_SMOKE_TEST_PLAN.md)
- [Production Rollback Plan](./01-architecture/PRODUCTION_ROLLBACK_PLAN.md)

Warning:

- Do not deploy while Railway is inactive.
- Do not run production migrations until backup and migration status are verified.
- Do not document real production secret values.

## Template Reports And Evidence

- [Modern Template README](./06-modern-template/README.md)
- [Stage 9 report index](./06-modern-template/reports/README.md)
- [Evidence index](./evidence/README.md)

## Update Rules

After each approved stage, update:

- [Project Status](./00-project/PROJECT_STATUS.md)
- [Roadmap](./00-project/ROADMAP.md)
- [Decisions](./00-project/DECISIONS.md)
- Relevant folder README.
- Stage report index if a report is generated.
- Evidence index if screenshot/validation evidence is generated.

Do not delete historical documents or evidence. Prefer index files and links over moving large folders.
