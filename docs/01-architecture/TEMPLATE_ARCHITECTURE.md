# Template Architecture

## Current Purpose

This document is the living architecture reference for UMKM Builder's public website template system.

The current system supports:

- Tenant-scoped website content.
- Template-linked websites through `Website.templateId`.
- Theme isolation through tenant theme tokens.
- Reusable public website sections.
- Restaurant/Warteg renderer compatibility.
- Generic business fallback rendering.

## Product Principle

```text
Business Type = Recommendation
Template = User Choice
Template Registry = Foundation Layer
```

Business type should guide recommendation and onboarding defaults. It must not be the permanent renderer selector.

## Current Data Flow

```text
Tenant onboarding
-> Website created
-> Website references Template
-> Public site loads Website + Template + Theme
-> Template registry resolves renderer
-> Renderer outputs public website
```

## Renderer Flow

Current renderer selection uses the template registry:

```text
PublicSiteRenderer
-> resolveTemplate(website)
-> template key / schema / legacy name
-> templateRegistry
-> renderer
```

Legacy template names are mapped to stable template keys so existing tenants keep working while the database evolves toward explicit template keys.

## Registry Flow

```text
Website.template.schema.key
        |
        v
Website.template.schema.templateKey
        |
        v
Website.template.schema.rendererKey
        |
        v
Website.template.name
        |
        v
Legacy name aliases
        |
        v
Fallback minimal_business
```

## Current Renderers

| Renderer Key | Purpose | Status |
| --- | --- | --- |
| `restaurant` | Restaurant and Warteg compatible renderer. | Active. |
| `generic_business` | Existing generic public website composition. | Active fallback. |

## Stable Template Identity

Template identity should move toward stable keys such as:

```text
restaurant_classic
restaurant_premium
restaurant_luxury
cafe_minimal
cafe_modern
cafe_premium
clinic_professional
corporate_executive
minimal_business
```

These keys are architecture support only. Planned keys do not imply templates have been built.

## Future Marketplace Architecture

Future marketplace architecture should add:

- Template catalog API.
- Template preview.
- Template switching.
- Template access metadata.
- Subscription-based availability.

This stage does not implement those features. It only prepares renderer resolution to support them later.

## Compatibility Rules

- Existing Warteg tenants must resolve to `restaurant_classic`.
- Existing Restaurant tenants must resolve to `restaurant_classic`.
- Existing non-food tenants must resolve to `minimal_business`.
- Future cross-category selection can resolve by template key, independent of business type.

## Source Files

- `frontend/src/features/public-site/PublicSitePage.tsx`
- `frontend/src/features/templates/registry/templateRegistry.ts`
- `frontend/src/features/templates/registry/templateResolver.ts`
- `frontend/src/features/templates/registry/templateMetadata.ts`
- `frontend/src/features/templates/registry/templateTypes.ts`
- `frontend/src/features/templates/RestaurantTemplate.tsx`
- `frontend/src/features/templates/TemplateComponents.tsx`
