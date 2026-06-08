# Decisions

This file records major product and architecture decisions. It is the canonical decision log for active strategy.

## Stage-Gate Execution

Decision:

- Work proceeds in explicit stages, phases, and sprints.
- Hard stops must be respected.
- Future stages require approval before execution.

Reason:

- Reduces scope creep.
- Preserves auditability.
- Keeps the product owner in control of sequencing.

## Google Login Strategy

Decision:

- Google Login is supported as an authentication path.
- Application sessions are managed by UMKM Builder JWT/session logic.
- Google account sessions are not globally revoked by application logout.

Reason:

- Keeps app authentication independent from global Google account state.
- Avoids surprising users by signing them out of Gmail, Drive, or YouTube.

## Google Logout Auto-Selection

Decision:

- Application logout calls Google Identity Services `disableAutoSelect()`.
- The app session is cleared.
- Google global account login remains active.

Reason:

- Prevents the login page from displaying the previous Google account as an automatic one-click selection on shared devices.
- Improves privacy without revoking Google permissions.

## Email Provider Strategy

Decision:

- Resend is integrated as the email provider for authentication flows.
- Production activation is deferred until final domain and sender configuration are ready.
- `AUTH_TOKEN_RESPONSE_ENABLED` must stay disabled in production.

Reason:

- Enables forgot password and email verification.
- Avoids leaking tokens in production responses.
- Keeps launch flexible while domain setup is pending.

## Template Architecture Decision

Decision:

- Business Type is a recommendation system.
- Business Type must never permanently lock a tenant to a template.
- Template selection must remain independent.

Future architecture should support:

```text
tenant
├── business_type
├── template_key
└── subscription_plan
```

Reason:

- Users may want a template from another business category.
- Monetization requires template access to be controlled by subscription plan, not only business type.
- Marketplace flexibility depends on decoupling recommendation from selection.

## Business Type Recommendation Model

Decision:

- Business Type guides onboarding and default recommendations.
- It should be used to suggest templates, not enforce templates.

Examples:

- Business Type = Cafe, Template = Restaurant Luxury.
- Business Type = Clinic, Template = Corporate Executive.

## Template Registry Architecture

Status: Approved.

Decision:

- Renderer selection must use template identity through the template registry.
- Renderer selection must not rely on business type.

Approved flow:

```text
template_key
-> templateRegistry
-> renderer
```

Rejected flow:

```text
businessType
-> renderer
```

Reason:

- Business type is a recommendation signal, not a renderer identity.
- Future marketplace templates must support cross-category selection.
- Existing tenants need legacy compatibility while the database evolves toward explicit template keys.

## Template Registry Validation

Status: Approved.

Decision:

- All template renderer selection must be validated through registry tests.
- Future templates must register through the registry layer.
- Direct renderer branching is prohibited.

Reason:

- Registry growth must remain controlled and testable.
- Legacy mappings must not regress.
- Unknown template records must resolve safely through fallback behavior.

## Future Template Marketplace

Decision:

- UMKM Builder should support a future template catalog and marketplace.
- Templates can be standard, premium, luxury, or exclusive.
- Template access can be subscription based.

Reason:

- Template quality is a core commercial differentiator.
- Premium templates create a natural upgrade path.

## Tenant Switch Scope

Decision:

- Tenant Switch is deferred as a future feature.
- It should not block current website launch readiness.

Reason:

- Current priority is stable public website generation and commercial template quality.
- Tenant Switch can be added after the core product is running normally.

## Documentation Knowledge Base

Decision:

- Documentation is reorganized from execution-history folders into a knowledge-base structure.
- Historical documents are preserved in active folders or archive.
- `MASTER_PRODUCT_STRATEGY.md` remains active and must not be archived.

Reason:

- The project has enough documentation volume to require better onboarding, auditability, and executive readability.
