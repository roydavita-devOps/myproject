# Phase 9.3B - Template Catalog Readiness Audit Report

Date: 2026-06-08

## Scope

This audit validates whether the current template registry is ready to support a future Template Catalog.

This stage does not implement:

- Template Catalog UI.
- Template picker.
- Template switching.
- Template preview UI.
- New Clinic, Corporate, or Cafe templates.
- Database schema changes.
- Subscription or billing logic.

## Source Files Audited

| File | Purpose |
| --- | --- |
| `frontend/src/features/templates/registry/templateTypes.ts` | Defines template keys, renderer keys, tiers, metadata type, and resolution result. |
| `frontend/src/features/templates/registry/templateMetadata.ts` | Defines registered template metadata and legacy aliases. |
| `frontend/src/features/templates/registry/templateRegistry.ts` | Maps template renderer keys to React template renderers. |

## Current Registry Architecture

Approved renderer flow remains:

```text
template_key
-> templateRegistry
-> renderer
```

The architecture is aligned with the product decision that business type is a recommendation signal, not the permanent renderer identity.

## Registered Templates

### Active Templates

| Template Key | Display Name | Renderer | Tier | Recommended Business Types | Notes |
| --- | --- | --- | --- | --- | --- |
| `restaurant_classic` | Restaurant Classic | `restaurant` | `standard` | `WARTEG`, `RESTAURANT` | Active commercial template. |
| `laundry_clean` | Laundry Clean | `laundry` | `standard` | `LAUNDRY` | Active commercial template. |
| `minimal_business` | Minimal Business | `generic_business` | `standard` | `LAUNDRY`, `WORKSHOP`, `SALON`, `RETAIL`, `LOCAL_SERVICE` | Active fallback template. |

### Planned Templates

| Template Key | Display Name | Renderer | Tier | Recommended Business Types | Notes |
| --- | --- | --- | --- | --- | --- |
| `restaurant_premium` | Restaurant Premium | `restaurant` | `premium` | `RESTAURANT`, `CAFE` | Planned premium restaurant variant. |
| `restaurant_luxury` | Restaurant Luxury | `restaurant` | `luxury` | `RESTAURANT`, `CAFE` | Planned luxury restaurant variant. |
| `cafe_minimal` | Cafe Minimal | `generic_business` | `standard` | `CAFE` | Planned cafe entry currently mapped to generic renderer. |
| `cafe_modern` | Cafe Modern | `generic_business` | `premium` | `CAFE` | Planned cafe entry currently mapped to generic renderer. |
| `cafe_premium` | Cafe Premium | `generic_business` | `premium` | `CAFE` | Planned cafe entry currently mapped to generic renderer. |
| `clinic_professional` | Clinic Professional | `generic_business` | `standard` | `CLINIC` | Planned clinic entry currently mapped to generic renderer. |
| `corporate_executive` | Corporate Executive | `generic_business` | `premium` | `CLINIC`, `LOCAL_SERVICE`, `RETAIL` | Planned corporate entry currently mapped to generic renderer. |

## Metadata Contract Definition

Future catalog metadata must support these fields:

| Field | Required | Current Equivalent | Purpose |
| --- | --- | --- | --- |
| `template_key` | Yes | `key` | Stable template identity used by database records and resolver logic. |
| `display_name` | Yes | `displayName` | Human-readable catalog label. |
| `description` | Yes | Not present | Short catalog description for users and internal reviewers. |
| `industry` | Yes | Not present | Broad market category such as Food & Beverage, Laundry, Healthcare, or Services. |
| `category` | Yes | Not present | Specific template category such as Restaurant, Warteg, Cafe, Laundry, Clinic, or Corporate. |
| `renderer_key` | Yes | `rendererKey` | Renderer implementation key used by `templateRegistry`. |
| `status` | Yes | `status` | Lifecycle state. Current valid values are `active` and `planned`. |
| `preview_image` | Yes | Not present | Catalog preview asset path or key. |
| `tier` | Yes | `tier` | Commercial tier. Current values are `standard`, `premium`, and `luxury`. |
| `recommended_business_types` | Yes | `recommendedBusinessTypes` | Recommendation targets. This must not restrict template selection. |

## Metadata Completeness Matrix

Current metadata is consistent for identity, renderer, status, tier, and recommendations, but not complete for future catalog display.

| Template Key | Identity | Display | Renderer | Status | Tier | Recommendations | Description | Industry | Category | Preview Image | Completeness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `restaurant_classic` | Yes | Yes | Yes | Yes | Yes | Yes | Missing | Missing | Missing | Missing | Partial |
| `restaurant_premium` | Yes | Yes | Yes | Yes | Yes | Yes | Missing | Missing | Missing | Missing | Partial |
| `restaurant_luxury` | Yes | Yes | Yes | Yes | Yes | Yes | Missing | Missing | Missing | Missing | Partial |
| `laundry_clean` | Yes | Yes | Yes | Yes | Yes | Yes | Missing | Missing | Missing | Missing | Partial |
| `cafe_minimal` | Yes | Yes | Yes | Yes | Yes | Yes | Missing | Missing | Missing | Missing | Partial |
| `cafe_modern` | Yes | Yes | Yes | Yes | Yes | Yes | Missing | Missing | Missing | Missing | Partial |
| `cafe_premium` | Yes | Yes | Yes | Yes | Yes | Yes | Missing | Missing | Missing | Missing | Partial |
| `clinic_professional` | Yes | Yes | Yes | Yes | Yes | Yes | Missing | Missing | Missing | Missing | Partial |
| `corporate_executive` | Yes | Yes | Yes | Yes | Yes | Yes | Missing | Missing | Missing | Missing | Partial |
| `minimal_business` | Yes | Yes | Yes | Yes | Yes | Yes | Missing | Missing | Missing | Missing | Partial |

## Completeness Summary

| Status | Count | Notes |
| --- | ---: | --- |
| Complete | 0 | No template currently includes the full future catalog contract. |
| Partial | 10 | All registered templates include operational registry metadata but lack catalog display fields. |
| Missing | 0 | Every registered template has a metadata entry. |

## Preview Asset Readiness

Status: Partial.

The architecture can support `preview_image` by extending `TemplateMetadata`, because metadata is centralized in `templateMetadata.ts` and exposed through `templateRegistry.metadata`.

Current gaps:

- `TemplateMetadata` does not define a preview image field.
- `templateMetadata.ts` does not include preview image values.
- No canonical preview asset directory or naming standard is defined in code.
- No tests currently validate preview image completeness.

Recommended future standard:

```text
frontend/public/template-previews/<template_key>.jpg
```

Example:

```text
frontend/public/template-previews/restaurant_classic.jpg
frontend/public/template-previews/laundry_clean.jpg
```

## Subscription Tier Readiness

Status: Ready for metadata-only planning.

The registry already supports:

```text
standard
premium
luxury
```

Current tier coverage:

| Tier | Registered Templates |
| --- | --- |
| `standard` | `restaurant_classic`, `laundry_clean`, `cafe_minimal`, `clinic_professional`, `minimal_business` |
| `premium` | `restaurant_premium`, `cafe_modern`, `cafe_premium`, `corporate_executive` |
| `luxury` | `restaurant_luxury` |

Important limitation:

- Current tier metadata is descriptive only.
- There is no access control, billing, entitlement, subscription enforcement, or upgrade flow.
- That is correct for this stage.

## Template Catalog Readiness Score

| Area | Score | Justification |
| --- | ---: | --- |
| Template Identity | 9/10 | Stable `TemplateKey` union and metadata records exist for every registered template. |
| Registry Architecture | 9/10 | Renderer selection is centralized and no longer relies on business type branching. |
| Metadata Structure | 6/10 | Operational metadata exists, but catalog fields are still missing. |
| Preview Support | 5/10 | Central metadata can support previews, but no field, assets, or validation exist yet. |
| Tier Support | 8/10 | `standard`, `premium`, and `luxury` exist as metadata values, but no entitlement logic exists. |
| Catalog Readiness | 7/10 | Architecture is ready for standardization work, but catalog display metadata must be added before UI implementation. |

## Findings

1. Registry coverage is complete for current operational rendering.
2. Active templates are registered cleanly.
3. Planned templates already have identity, display name, renderer, tier, recommendation, and lifecycle status.
4. The current metadata type is not yet catalog-complete.
5. Preview image strategy is not yet implemented.
6. Tier strategy is ready as metadata, but not as product access control.
7. Business type remains correctly modeled as recommendation metadata.

## Recommendations

Before implementing Template Catalog UI:

1. Extend `TemplateMetadata` to include catalog fields.
2. Add `description`, `industry`, `category`, and `previewImage` values for every registered template.
3. Add tests that fail when required catalog metadata is incomplete.
4. Define preview asset storage and naming.
5. Keep access control separate from metadata until subscription architecture is approved.

## Go / No-Go

Decision: Conditional Go for continued template expansion, No-Go for Template Catalog UI.

Rationale:

- New templates can continue if they follow the metadata standard in `TEMPLATE_METADATA_STANDARD.md`.
- Template Catalog UI should not begin until catalog metadata fields and preview assets are implemented and validated.

## Hard Stop Confirmation

This report completes Stage 9.3B audit output only.

Do not start:

- Stage 9.4 Clinic.
- Stage 9.5 Corporate.
- Stage 9.6 Cafe.
- Template Catalog UI.
- Template Switching.
- Template Marketplace.

Wait for approval before continuing.
