# Template Catalog

## Purpose

This document tracks future template catalog planning. It is not an implementation report.

## Current Decision

Stage 9.3B completed a Template Catalog Readiness Audit.

Decision:

- Template Catalog is a future product capability.
- Current work remains metadata standardization and readiness validation only.
- Template Catalog UI, template switching, and template marketplace are not implemented yet.

## Current Template Status

| Template | Status |
| --- | --- |
| Base template system | Implemented. |
| Restaurant / Warteg template | Implemented through Stage 9 Sprint 2 and final CTA fix. |
| Laundry template | Implemented through Stage 9.3. |
| Clinic template | Implemented through Stage 9.4. |
| Corporate template | Planned. |
| Cafe template | Planned. |

## Metadata Standard

Every future template must follow the official metadata standard documented in:

- [../01-architecture/TEMPLATE_METADATA_STANDARD.md](../01-architecture/TEMPLATE_METADATA_STANDARD.md)

Required catalog fields:

```text
template_key
display_name
description
industry
category
renderer_key
status
preview_image
tier
recommended_business_types
```

Current implementation note:

- Operational registry metadata exists.
- Catalog display fields such as `description`, `industry`, `category`, and `preview_image` are now represented in the frontend registry metadata contract.
- `clinic_professional` includes preview placeholder support.
- Template Catalog UI must not start until those fields are added and validated.

## Current Template Keys

| Template Key | Status | Tier | Catalog Readiness |
| --- | --- | --- | --- |
| `restaurant_classic` | Active | Standard | Partial metadata. |
| `laundry_clean` | Active | Standard | Partial metadata. |
| `clinic_professional` | Active | Standard | Catalog-ready metadata with preview placeholder. |
| `minimal_business` | Active fallback | Standard | Partial metadata. |
| `restaurant_premium` | Planned | Premium | Partial metadata. |
| `restaurant_luxury` | Planned | Luxury | Partial metadata. |
| `cafe_minimal` | Planned | Standard | Partial metadata. |
| `cafe_modern` | Planned | Premium | Partial metadata. |
| `cafe_premium` | Planned | Premium | Partial metadata. |
| `corporate_executive` | Planned | Premium | Partial metadata. |

## Catalog Principle

Recommended categories are not restrictions.

Users should be able to choose a template even if their business type differs from the recommendation.

## Preview Strategy

Future preview assets should use a stable template-key-based path.

Recommended path:

```text
frontend/public/template-previews/<template_key>.jpg
```

Rules:

- Preview assets are catalog assets, not renderer dependencies.
- Missing preview assets should block Template Catalog readiness tests.
- Preview images should represent actual template appearance, not generic decorative imagery.

## Tier Strategy

Template tiers are metadata only at this stage.

Supported tier values:

```text
standard
premium
luxury
```

Future access model:

| Plan | Template Access |
| --- | --- |
| Basic | Standard templates. |
| Pro | Standard and Premium templates. |
| Premium | Standard, Premium, Luxury, and future exclusive templates. |

No billing, entitlement, or subscription enforcement is implemented by this document.

## Future Catalog Requirements

Before implementing Template Catalog UI:

1. Extend registry metadata with catalog fields.
2. Add preview images for every active template.
3. Add metadata completeness tests.
4. Add product copy for template descriptions.
5. Confirm subscription access rules in a separate approved stage.

## Readiness Reference

Architecture audit:

- [../01-architecture/PHASE-9.3B-Template-Catalog-Readiness-Audit-Report.md](../01-architecture/PHASE-9.3B-Template-Catalog-Readiness-Audit-Report.md)

## Clinic Professional Catalog Entry

| Field | Value |
| --- | --- |
| Template key | `clinic_professional` |
| Display name | Clinic Professional |
| Description | Professional healthcare landing page designed for clinics and medical practices. |
| Industry | Healthcare |
| Category | Clinic |
| Renderer key | `clinic` |
| Status | Active |
| Preview image | `clinic-professional.jpg` |
| Tier | Standard |
| Recommended business types | `CLINIC` |
