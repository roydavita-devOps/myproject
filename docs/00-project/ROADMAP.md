# Roadmap

Last updated: 2026-06-29

## Completed

- Master Development Phase 1-8 baseline.
- Production readiness remediation.
- Public pilot deployment preparation.
- Supabase, Railway, and Vercel integration.
- Database and deployment readiness audit.
- QA sign-off remediation and re-run validation.
- Security audit.
- Authentication.
- Google Login.
- Google logout auto-selection security enhancement.
- Resend email provider integration at code level.
- Stage 9 Sprint 1 Design System Foundation.
- Stage 9 Sprint 1 Stabilization.
- Stage 9 Sprint 2 Restaurant Template.
- Stage 9 Sprint 2 Final CTA Visibility Fix.
- Stage 9.1A Documentation Refactor Planning.
- Stage 9.1B Documentation Refactor Execution.
- Stage 9.2 Template Architecture Validation.
- Stage 9.2A Template Registry Foundation.
- Stage 9.2B Template Registry Validation & Test Coverage.
- Stage 9.3 Laundry Template.
- Stage 9.3B Template Catalog Readiness Audit.
- Stage 9.4 Clinic Professional Template.
- Stage 9.5 Corporate Executive Template.
- Stage 9.6 Cafe Modern Template.
- Stage 9.6A Template Consistency Audit.
- Stage 9.6B Basic Template Standardization.
- Stage 9.7 Premium Template Expansion: Restaurant Premium and Cafe Premium.
- Stage 9.7A Template Selection & Assignment Audit.
- Stage 9.7B Template Selection Foundation.
- Stage 9.7C Premium Template Visual Differentiation.
- Stage 9.8A Menu Item Image Management.
- Stage 9.8A-R1 Public Premium Menu Item Count Fix.
- Stage 9.8B Featured Menu and Full Menu Modal.
- Stage 9.8C Premium Template Color Customization and Density Redesign.
- Stage 9.8D Premium Contrast and Readability Remediation.
- Stage 9.8D Restaurant Premium Editorial Redesign, CTA Strategy, Contrast & Typography Refinement.
- Stage 9.8D-R1 Restaurant Premium CTA, Readability & Opening Hours Remediation.
- Stage 9.8D-R2 Restaurant Premium Foundation UX and Data Remediation.

## In Progress

- Modern Template System as the active product quality track.
- Stage 9.8D-R2 Restaurant Premium foundation remediation approval checkpoint.

## Planned

### Stage 10

Production Readiness.

Focus:

- Final production hardening.
- Operational monitoring.
- Production email activation if final domain is ready.
- Release candidate validation.

### Stage 11

Commercial Launch.

Focus:

- Public launch readiness.
- Pricing.
- Pilot-to-paid conversion.
- Support and operational playbooks.

## Product Strategy Roadmap

### Template Marketplace Strategy

UMKM Builder should evolve from a simple website generator into a template-driven SaaS platform.

Core principle:

- Business Type = Recommendation.
- Template = User Selectable.
- Business Type must not permanently lock a tenant to one template.

### Business Type Recommendation Model

Business type should help the product recommend relevant starting templates.

Example:

- Business Type: Cafe
- Recommended templates: Restaurant Luxury, Cafe Modern, Local Food Landing

### Template User Choice

Users should be able to choose templates independently from their business type.

Valid examples:

- Business Type = Cafe, Template = Restaurant Luxury.
- Business Type = Clinic, Template = Corporate Executive.

### Premium Template Strategy

Premium templates should increase perceived value and support paid tiers.

Stage 9.7C clarified the current visual standard:

- Standard template = functional website.
- Premium template = branded business experience.
- Luxury template = high-end editorial experience.

Premium visual differentiation is implemented for Restaurant Premium and Cafe Premium, with safe enhancement to the existing Corporate Executive renderer. Premium tier remains metadata only until subscription enforcement is approved separately.

Stage 9.8C adds the next premium maturity layer:

- Template = layout and experience.
- Brand = color, logo, content, and images.
- Brand Color = user customization.
- Restaurant Premium and Cafe Premium can use approved presets plus user primary/accent colors without changing template identity.
- Section density adapts to available content so one, two, and many items do not create repetitive or sparse premium layouts.
- Semantic premium tokens protect readability, so brand colors influence identity, CTA, badges, and accents without being used directly for long body copy.

Stage 9.8D adds restaurant-specific commercial polish:

- Restaurant Premium uses reservation-first CTA language instead of generic WhatsApp-first copy.
- Signature Dishes is the strongest conversion section and links to the full menu without per-card WhatsApp buttons.
- Gallery and Footer no longer repeat generic contact CTAs.
- Editorial restaurant typography is applied inside the existing renderer without adding a dependency, schema change, or new template key.

Stage 9.8D-R1 resolves final Restaurant Premium review findings:

- Global reservation CTA is concentrated in the header.
- Hero focuses on content/navigation CTAs instead of repeating `Reserve a Table`.
- Visit & Reservation uses a dark readable final-action card.
- Opening Hours is tenant-editable from the dashboard and rendered from existing `Website.openingHours` data.

Stage 9.8D-R2 establishes Restaurant Premium as the first Premium Experience Foundation reference:

- Future premium templates should share foundation principles and reusable patterns, not inherit directly from `RestaurantPremiumTemplate`.
- Restaurant Premium Full Menu modal follows premium restaurant theme and does not repeat generic WhatsApp CTA.
- Menu categories are user-correctable through safe delete behavior that preserves menu items.
- Tenant slug belongs in Business Information and is removed from the initial login form for the current one-tenant-per-user model.
- Opening Hours uses structured picker controls and stores daily hours in existing JSON persistence.
- Safe additive migrations remain allowed when future premium data contracts require them, but no migration was required for this remediation.

Potential categories:

- Standard templates.
- Premium templates.
- Luxury templates.
- Exclusive industry templates.

### Subscription Based Template Access

Template access should be tied to subscription plan when monetization is activated.

Draft model:

| Plan | Template Access |
| --- | --- |
| Basic | Standard templates. |
| Pro | Standard and Premium templates. |
| Premium | Standard, Premium, Luxury, and Exclusive templates. |

## Future Vision

- Template catalog.
- Template preview.
- Change template.
- Recommended templates.
- Premium templates.
- Luxury templates.
- Template marketplace.
- Premium template packs.
- Subscription based template access.
