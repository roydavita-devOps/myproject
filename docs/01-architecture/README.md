# Architecture

This folder contains architecture references, deployment/relaunch runbooks, and technical decision support docs.

## Current Warning

Railway is currently inactive/expired.

Stage 9.12A is preparation-only. Actual Railway reactivation, production redeploy, and production migrations are deferred to Stage 9.12B.

Do not run production migrations until backup and migration status are verified.

## Production Relaunch

- [PRODUCTION_RELAUNCH_PREPARATION.md](./PRODUCTION_RELAUNCH_PREPARATION.md)
- [DEPLOYMENT_ENVIRONMENT_MATRIX.md](./DEPLOYMENT_ENVIRONMENT_MATRIX.md)
- [PRODUCTION_ENV_MANUAL_CHECKLIST.md](./PRODUCTION_ENV_MANUAL_CHECKLIST.md)
- [PRODUCTION_SMOKE_TEST_PLAN.md](./PRODUCTION_SMOKE_TEST_PLAN.md)
- [PRODUCTION_ROLLBACK_PLAN.md](./PRODUCTION_ROLLBACK_PLAN.md)

## Template Architecture

- [TEMPLATE_ARCHITECTURE.md](./TEMPLATE_ARCHITECTURE.md)
- [TEMPLATE_REGISTRY_FOUNDATION.md](./TEMPLATE_REGISTRY_FOUNDATION.md)
- [TEMPLATE_REGISTRY_VALIDATION.md](./TEMPLATE_REGISTRY_VALIDATION.md)
- [TEMPLATE_METADATA_STANDARD.md](./TEMPLATE_METADATA_STANDARD.md)
- [PREMIUM_THEME_TOKEN_SYSTEM.md](./PREMIUM_THEME_TOKEN_SYSTEM.md)
- [PUBLISH_READINESS_GATE.md](./PUBLISH_READINESS_GATE.md)
- [ASSET_STORAGE_ARCHITECTURE.md](./ASSET_STORAGE_ARCHITECTURE.md)
- [OPENING_HOURS_DISPLAY_FORMATTER.md](./OPENING_HOURS_DISPLAY_FORMATTER.md)

## Historical Architecture

- [Phase-1-Architecture.md](./Phase-1-Architecture.md)
- [Phase-2-Database-Backend-Design.md](./Phase-2-Database-Backend-Design.md)
- [Phase-8-SaaS-Operations.md](./Phase-8-SaaS-Operations.md)

## Architecture Reports

- [PHASE-9.2-Template-Architecture-Validation-Report.md](./PHASE-9.2-Template-Architecture-Validation-Report.md)
- [PHASE-9.2A-Template-Registry-Foundation-Report.md](./PHASE-9.2A-Template-Registry-Foundation-Report.md)
- [PHASE-9.2B-Template-Registry-Validation-Report.md](./PHASE-9.2B-Template-Registry-Validation-Report.md)
- [PHASE-9.3B-Template-Catalog-Readiness-Audit-Report.md](./PHASE-9.3B-Template-Catalog-Readiness-Audit-Report.md)
- [PHASE-9.6A-Template-Consistency-Audit-Report.md](./PHASE-9.6A-Template-Consistency-Audit-Report.md)
- [PHASE-9.7A-Template-Selection-And-Assignment-Audit-Report.md](./PHASE-9.7A-Template-Selection-And-Assignment-Audit-Report.md)

## When To Update

Update this folder when:

- Deployment architecture changes.
- Production environment requirements change.
- Template registry architecture changes.
- Publish readiness architecture changes.
- Storage/upload architecture changes.

Product-level decisions are tracked in [../00-project/DECISIONS.md](../00-project/DECISIONS.md).
