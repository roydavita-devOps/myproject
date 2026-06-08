# PHASE 9.2A - Template Registry Foundation Report

## 1. Executive Summary

Stage 9.2A introduces a template registry foundation before new template expansion.

The public renderer no longer selects the active renderer directly from `template.businessType`. It now resolves through a registry layer:

```text
template_key
-> templateRegistry
-> renderer
```

No template marketplace, switching UI, billing, subscription gating, or new business template was implemented.

## 2. Architecture Before

Before this stage:

```text
PublicSiteRenderer
-> template.businessType
-> if RESTAURANT or WARTEG
   -> RestaurantTemplate
-> else
   -> generic public website composition
```

Weakness:

- Business type acted as renderer selector.
- Template name was the closest identifier.
- Future cross-category selection was not cleanly represented.

## 3. Architecture After

After this stage:

```text
PublicSiteRenderer
-> resolveTemplate(website)
-> stable key or legacy alias
-> templateRegistry
-> renderer
```

Current tenant compatibility remains:

- Warteg legacy templates resolve to `restaurant_classic`.
- Restaurant legacy templates resolve to `restaurant_classic`.
- Other existing/default templates resolve to `minimal_business`.

## 4. Registry Design

Registry files:

```text
frontend/src/features/templates/registry/
|-- templateRegistry.ts
|-- templateResolver.ts
|-- templateMetadata.ts
`-- templateTypes.ts
```

Resolution order:

1. `template.schema.templateKey` or `template.schema.key`.
2. `template.schema.rendererKey`.
3. `template.name` if it matches a stable key.
4. Legacy template name aliases.
5. `minimal_business` fallback.

Supported future keys:

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

These keys are metadata only unless marked active.

## 5. Files Created

- `frontend/src/features/templates/registry/templateRegistry.ts`
- `frontend/src/features/templates/registry/templateResolver.ts`
- `frontend/src/features/templates/registry/templateMetadata.ts`
- `frontend/src/features/templates/registry/templateTypes.ts`
- `docs/01-architecture/TEMPLATE_ARCHITECTURE.md`
- `docs/01-architecture/TEMPLATE_REGISTRY_FOUNDATION.md`
- `docs/01-architecture/PHASE-9.2A-Template-Registry-Foundation-Report.md`

## 6. Files Modified

- `frontend/src/features/public-site/PublicSitePage.tsx`
- `docs/00-project/DECISIONS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/MASTER_PRODUCT_STRATEGY.md`
- `docs/01-architecture/README.md`

Moved:

- `docs/06-modern-template/reports/PHASE-9.2-Template-Architecture-Validation-Report.md`
- to `docs/01-architecture/PHASE-9.2-Template-Architecture-Validation-Report.md`

## 7. Compatibility Validation

Restaurant/Warteg compatibility:

```text
restaurant-default -> restaurant_classic -> restaurant renderer
restaurant-demo-template -> restaurant_classic -> restaurant renderer
warteg-default -> restaurant_classic -> restaurant renderer
warteg-demo-template -> restaurant_classic -> restaurant renderer
```

Generic compatibility:

```text
laundry-default -> minimal_business -> generic_business renderer
clinic-default -> minimal_business -> generic_business renderer
unknown template -> minimal_business -> generic_business renderer
```

Future cross-category proof:

```text
Business Type = Cafe
Template = Restaurant Luxury
template.schema.templateKey = restaurant_luxury
-> restaurant renderer
```

This proves architecture support without implementing marketplace UI.

## 8. Documentation Changes

Created architecture documents:

- `docs/01-architecture/TEMPLATE_ARCHITECTURE.md`
- `docs/01-architecture/TEMPLATE_REGISTRY_FOUNDATION.md`

Moved Stage 9.2 validation report into architecture:

- `docs/01-architecture/PHASE-9.2-Template-Architecture-Validation-Report.md`

Updated project knowledge base:

- `DECISIONS.md`
- `ROADMAP.md`
- `PROJECT_STATUS.md`
- `MASTER_PRODUCT_STRATEGY.md`

## 9. Risks

| Risk | Status |
| --- | --- |
| Existing database rows do not have `template_key`. | Mitigated by legacy aliases and schema fallback. |
| Planned keys could be mistaken as implemented templates. | Mitigated by `status: planned` metadata and documentation notes. |
| Subscription access could leak into renderer selection too early. | Avoided; no subscription gating was implemented. |
| Generic fallback may hide missing template configuration. | Acceptable for now; future marketplace stages should add stronger validation. |

## 10. Recommendations

- Add explicit `Template.key` in a future database migration.
- Add `Template.rendererKey` or equivalent metadata when backend marketplace work begins.
- Keep business type as recommendation metadata only.
- Add tests for resolver mapping before Stage 9.3 template expansion.
- Do not build more templates by adding direct `businessType` branches.

## Hard Stop

This stage does not implement:

- Stage 9.3 Laundry.
- Stage 9.4 Clinic.
- Stage 9.5 Corporate.
- Stage 9.6 Cafe.
- Template Marketplace.
- Subscription-Based Template Access.
