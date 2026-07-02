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

## Restaurant Premium Foundation Reference

Status: Approved for implementation pending product sign-off.

Decision:

- Restaurant Premium is the first Premium Experience Foundation reference.
- Premium templates should share foundation principles and reusable patterns, not inherit directly from `RestaurantPremiumTemplate`.
- Restaurant Premium Full Menu modal must follow the premium restaurant theme and must not repeat a generic WhatsApp CTA inside the browsing modal.
- Menu categories must be user-correctable with safe delete behavior that preserves menu items.
- Tenant slug belongs to Business Information, not the initial Login form, when backend tenant resolution safely supports login without slug.
- Opening hours should use structured picker controls, not free-text sentences.
- Safe additive database migration is allowed when it supports premium foundation data quality; no migration was needed for Stage 9.8D-R2 because `Website.openingHours` already supports JSON data.

Reason:

- Restaurant Premium is becoming the benchmark for future premium templates.
- The foundation must improve product quality without creating marketplace, subscription, entitlement, or new template scope.
- User-correctable business identity and structured hours reduce support friction and inconsistent public rendering.

## Upload Image Processing Baseline

Status: Approved for implementation pending product sign-off.

Decision:

- Owner uploads accept JPG, PNG, and WEBP only.
- Accepted raster uploads are validated, auto-rotated, stripped of metadata through re-encoding, resized without upscale, and emitted as WebP variants.
- Generated variants are thumbnail 320px, medium 800px, and large 1400px at WebP quality 82.
- The existing persisted `imageUrl` contract remains the primary processed WebP URL for compatibility.
- Upload responses may expose `originalUrl`, `thumbnailUrl`, `mediumUrl`, `largeUrl`, width, and height for future metadata use.
- Local filesystem upload storage remains a local/development adapter. Production user uploads require durable object storage before stateless deployment can be considered complete.

Reason:

- Public template performance and image reliability must not depend on unoptimized owner uploads.
- Existing logo, hero, gallery, and menu image fields must keep working without a schema migration.
- Durable storage is a deployment concern and should be made explicit instead of hidden behind local container behavior.

## Durable Upload Storage

Status: Approved for implementation pending product sign-off.

Decision:

- User-uploaded assets must use durable object storage before production launch.
- Local filesystem upload storage is allowed only for local development, local Docker validation, and tests.
- Production upload storage uses Supabase Storage through a backend storage adapter selected by `STORAGE_DRIVER=supabase`.
- The image processing pipeline remains independent from the storage adapter.
- Public website images use a public Supabase Storage bucket named `tenant-assets`.
- The Supabase service role key is backend-only and must never be exposed to frontend/Vercel.
- Existing `/api/v1/uploads/...` local URLs remain supported for backward compatibility.

Reason:

- Railway/container filesystem storage is not durable across redeploys, restarts, or instance replacement.
- Website builder customers expect uploaded menu, gallery, logo, and hero images to survive deployments.
- A storage adapter keeps local development simple while making production durable.

## Image Delete and Legacy Cleanup

Status: Approved for implementation pending product sign-off.

Decision:

- Image deletion must clear database references even if legacy local files no longer exist.
- Deleting an image must never delete the parent menu item, website, tenant, or other business data unless explicitly requested.
- Gallery image deletion archives only the gallery record and removes it from active/public rendering.
- Supabase Storage delete should remove known image variants when available.
- Supabase cleanup failures should be logged and should not block database reference cleanup when the user is removing the image.

Reason:

- Public sites must stop rendering deleted images immediately.
- Legacy local upload paths may point to files that disappeared during previous deployment changes.
- Storage cleanup is important, but stale storage cannot be allowed to keep broken image references in customer websites.

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

## Restaurant Premium Color System 2.0

Status: Approved for Stage 9.8D-R6 remediation.

Decision:

- Restaurant Premium uses semantic color tokens, not raw brand colors, for readable UI.
- Brand colors are identity accents; semantic tokens protect readability.
- Restaurant Premium default preset is `editorial_umber`.
- Hero sections must use image-safe overlays because tenants upload unpredictable images.
- Premium preset colors must be validated against bright, dark, and busy images.
- Custom brand colors may influence CTA, badges, icons, borders, active states, and small decorative elements.
- Custom brand colors must not directly control long paragraph text, important body copy, modal body copy, hero headline, or card body copy.
- Stage 9.8D-R6 does not introduce new templates, marketplace, billing, subscription enforcement, entitlement logic, backend changes, Prisma schema changes, or database migrations.

Reason:

- Restaurant Premium is a paid-template foundation and must remain elegant and readable across user-uploaded food/interior images.
- Tenant brand colors can be too light, too dark, or visually noisy when used directly as UI colors.
- Semantic token mapping keeps customization useful while protecting commercial readability and conversion.

## Restaurant Premium Public Content Formatting And Stable Anchors

Status: Approved for Stage 9.8D-R7 final polish.

Decision:

- Opening hours must be rendered as customer-facing text on public templates, never as raw structured data.
- Public opening hours display must not expose internal keys such as `mode`, `days`, `openTime`, or `closeTime`.
- Restaurant Premium section navigation must use stable anchors for Menu, Story, Gallery, and Visit.
- Restaurant Premium uses `#signature-dishes`, `#restaurant-story`, `#ambience-gallery`, and `#visit-reservation`.
- Placeholder visual states in premium templates must remain readable and intentional when tenant content is missing.
- Stage 9.8D-R7 does not introduce new templates, marketplace, billing, subscription enforcement, entitlement logic, backend changes, Prisma schema changes, or database migrations.

Reason:

- Public customer websites must never show implementation-shaped data.
- Stable anchors make header navigation and CTA scroll behavior predictable.
- Premium templates must look intentional even before every tenant has uploaded gallery content.

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
