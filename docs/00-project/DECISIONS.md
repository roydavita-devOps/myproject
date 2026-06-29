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

## Template Metadata Standard

Status: Approved.

Decision:

- All future templates must provide catalog-ready metadata.
- Required metadata includes template identity, display name, description, industry, category, renderer key, lifecycle status, preview image, tier, and recommended business types.
- Template metadata supports recommendations and future catalog display, not subscription enforcement.

Reason:

- Template Catalog readiness depends on consistent metadata before UI implementation.
- Premium and luxury template strategy requires clear tier metadata.
- Preview and description fields must be standardized before additional template expansion continues.

## Template Consistency Standard

Status: Approved.

Decision:

- All future active templates must satisfy consistency requirements before activation.
- Required consistency areas include architecture compliance, metadata completeness, section parity, CTA visibility, evidence coverage, preview asset readiness, and documentation placement.
- Premium and Luxury expansion must not inherit known consistency gaps without explicit approval.

Reason:

- Active templates are the baseline for future marketplace-quality templates.
- Consistency gaps in standard templates can compound during premium expansion.
- Evidence and documentation must remain auditable before commercial launch.

## Basic Template Quality Baseline Approved

Status: Approved.

Decision:

- Restaurant Classic and Laundry Clean must follow the same fallback, preview, and section-quality baseline as newer active templates.
- Standard templates must include value propositions, fallback testimonials, fallback gallery content, business hours fallback, and a credibility section or team equivalent.
- Missing preview assets for active templates are not acceptable before Premium Expansion.

Reason:

- Premium and Luxury templates should inherit from a stable quality baseline.
- Catalog readiness depends on every active template having complete preview support.
- Older templates must not remain below the active portfolio standard.

## Premium Template Line Approved

Status: Approved for Stage 9.7 implementation.

Decision:

- Restaurant Premium and Cafe Premium are implemented as active premium templates.
- Premium tier remains metadata only at this stage.
- Premium renderer identity is explicit through `restaurant_premium` and `cafe_premium`.
- No Template Catalog UI, marketplace, template switching, entitlement, subscription enforcement, billing, database schema change, or Prisma migration is introduced by Stage 9.7.

Reason:

- Premium templates create a commercial-quality portfolio layer without changing access control.
- Explicit renderer keys keep premium template expansion aligned with the registry architecture.
- Premium differentiation can be validated before marketplace and subscription features are approved.

## Premium Template Visual Differentiation

Status: Approved for Stage 9.7C implementation.

Decision:

- Premium templates must be visibly different from Standard templates within the first few seconds of viewing.
- Restaurant Premium should communicate an elegant dining experience through a darker editorial layout, champagne accent, reservation-led CTA language, signature dishes, chef story, and ambience framing.
- Cafe Premium should communicate a modern lifestyle cafe experience through a warm cream, coffee, and espresso palette, layered hero composition, signature menu cards, brand story, lifestyle gallery, and visit-led CTA language.
- Corporate Executive can receive safe visual enhancement through its existing dedicated corporate renderer.
- Premium tier remains metadata only; Stage 9.7C does not introduce marketplace, billing, entitlement, subscription enforcement, database schema changes, or Prisma migrations.

Reason:

- Stage 9.7B made Premium templates selectable, but selectable Premium templates must also look commercially distinct.
- Visual differentiation can improve perceived value without changing template assignment architecture.
- Keeping the work renderer-only preserves the approved `template_key -> templateRegistry -> renderer` flow.

## Premium Brand Color Customization

Status: Approved for Stage 9.8C implementation.

Decision:

- Premium templates support user-controlled brand color customization.
- Restaurant Premium and Cafe Premium use approved preset palettes plus custom primary and accent colors.
- Theme tokens are resolved from existing Theme data and do not require a Prisma migration.
- Template identity remains unchanged: Template = layout and experience.
- Brand identity is composed from Brand = color, logo, content, and images.
- Business Type remains a recommendation signal.
- Template remains user choice.
- Brand Color is user customization.
- Stage 9.8C does not introduce new templates, marketplace, billing, subscription enforcement, entitlement logic, database schema changes, or Prisma migrations.

Reason:

- Premium templates must feel commercially personalized after selection.
- Brand color customization is a low-risk customization layer already supported by the Theme model.
- Keeping brand customization separate from template selection preserves the approved registry architecture.

## Premium Semantic Contrast Protection

Status: Approved for Stage 9.8D remediation.

Decision:

- Brand colors customize visual identity, but semantic color tokens protect readability.
- Brand primary and accent colors should influence CTA, badges, icons, borders, active states, and decorative highlights.
- Long body copy, card text, hero support text, and reservation/contact details must use readable semantic text tokens.
- Custom colors must be normalized and paired with readable foreground colors.
- Stage 9.8D does not introduce new templates, marketplace, billing, subscription enforcement, entitlement logic, database schema changes, or Prisma migrations.

Reason:

- Premium design must remain clear and readable across presets and custom colors.
- Directly applying pale accent colors to paragraphs can create low-contrast text on light surfaces.
- Semantic tokens keep user customization flexible without sacrificing usability.

## Restaurant Premium Editorial CTA Strategy

Status: Approved for Stage 9.8D editorial refinement.

Decision:

- Restaurant Premium must use reservation-first CTA language.
- Header and hero primary actions should read as restaurant booking actions, such as `Reserve a Table`.
- Generic `Chat WhatsApp` CTAs must not be repeated through Restaurant Premium Gallery or Footer.
- Signature Dishes is the primary commercial section and must focus on dish hierarchy, price, image, and full-menu access instead of per-card contact actions.
- Editorial restaurant typography is implemented inside the existing Restaurant Premium renderer using local CSS variables and system/fallback fonts.
- Stage 9.8D editorial refinement does not introduce Cafe Premium redesign, new templates, marketplace, billing, subscription enforcement, entitlement logic, backend changes, Prisma schema changes, or database migrations.

Reason:

- Premium Restaurant must feel commercially sellable within the first screen.
- Too many generic WhatsApp buttons weaken the premium restaurant flow.
- Restaurant visitors need a clear reservation path, menu confidence, and visit details without internal product copy.

## Restaurant Premium CTA Concentration And Opening Hours Editability

Status: Approved for Stage 9.8D-R1 remediation.

Decision:

- Restaurant Premium concentrates the global reservation CTA in the header.
- Hero must not repeat `Reserve a Table`; it should focus on `Explore Signature Dishes` and optional `Get Directions`.
- Visit & Reservation remains the final contact section with `Reserve via WhatsApp`, `Call Restaurant`, and `Get Directions`.
- Footer must not repeat a generic WhatsApp CTA.
- Opening hours must be tenant-editable and rendered from tenant/website data.
- Existing `Website.openingHours` JSON persistence is used with a simple `display` value for dashboard-edited hours.
- No database migration, backend schema change, new template, marketplace, billing, subscription enforcement, or entitlement logic is introduced by Stage 9.8D-R1.

Reason:

- Repeating reservation CTA in the hero competed with the header CTA and weakened the premium flow.
- Opening hours are business content and must not remain hardcoded template copy.
- The existing `openingHours` field already supports safe persistence, so a migration is unnecessary.

## Template Selection And Assignment Audit

Status: Completed for Stage 9.7A.

Decision:

- Current tenant registration and onboarding use business type auto-assignment, not true template selection.
- Current persisted assignment is `Website.templateId` pointing to a database `Template` row.
- Frontend template rendering is resolved through the approved registry, but premium templates require explicit template key or renderer key data in the API payload.
- Tenants cannot currently view, select, change, compare, or choose Premium templates through product UI.
- Admin users cannot assign, change, or override website templates through current admin UI/API.

Reason:

- The existing onboarding `templateName` value is not used by backend assignment logic.
- Premium templates are active in frontend metadata but not reachable through the current registration/onboarding flow.
- Commercial messaging must distinguish auto-assigned templates from user-selected templates until a future template selection stage is approved.

## Business Type Recommendation And Template User Choice

Status: Approved for Stage 9.7B foundation.

Decision:

- Business Type remains a recommendation signal.
- Template is now a user choice within the active template selection foundation.
- Users may apply templates outside their current business type recommendation.
- Premium template tier remains metadata only; no billing, entitlement, or subscription enforcement is implemented in Stage 9.7B.
- Template selection persists through the existing `Website.templateId -> Template` relationship.

Reason:

- Stage 9.7A found that Premium templates existed but were not reachable by users.
- Stage 9.7B closes the minimum usability gap without building a marketplace or changing database schema.
- This keeps the approved architecture direction: `template_key -> templateRegistry -> renderer`.

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
