# Template Registry Foundation

## Overview

The Template Registry Foundation decouples public website rendering from `businessType`.

Before:

```text
businessType
-> renderer
```

After:

```text
template_key
-> templateRegistry
-> renderer
```

## Registry Files

```text
frontend/src/features/templates/registry/
|-- templateRegistry.ts
|-- templateResolver.ts
|-- templateMetadata.ts
`-- templateTypes.ts
```

## Template Identity Strategy

Stable template identity uses `template_key`.

Supported architecture keys:

```text
restaurant_classic
restaurant_premium
restaurant_luxury
laundry_clean
cafe_minimal
cafe_modern
cafe_premium
clinic_professional
corporate_executive
minimal_business
```

Only active renderers are currently enabled. Planned keys exist to prove compatibility without building new templates.

## Resolution Strategy

The resolver checks values in this order:

1. `template.schema.templateKey` or `template.schema.key`.
2. `template.schema.rendererKey`.
3. `template.name` when it already matches a stable template key.
4. Legacy template name aliases.
5. `minimal_business` fallback.

This allows the current database to keep working while future migrations add explicit keys.

## Renderer Mapping

| Template Key | Renderer Key | Status |
| --- | --- | --- |
| `restaurant_classic` | `restaurant` | Active. |
| `restaurant_premium` | `restaurant` | Planned. |
| `restaurant_luxury` | `restaurant` | Planned. |
| `laundry_clean` | `laundry` | Active. |
| `clinic_professional` | `clinic` | Active. |
| `minimal_business` | `generic_business` | Active fallback. |
| `cafe_minimal` | `generic_business` | Planned. |
| `cafe_modern` | `generic_business` | Planned. |
| `cafe_premium` | `generic_business` | Planned. |
| `corporate_executive` | `generic_business` | Planned. |

## Future Cross-Category Proof

Scenario:

```text
Business Type = Cafe
Template = Restaurant Luxury
```

Architecture support:

```text
template.schema.templateKey = restaurant_luxury
-> resolver finds restaurant_luxury
-> registry maps restaurant_luxury to restaurant renderer
-> renderer works independent of businessType
```

No marketplace UI, switching UI, billing, or subscription gating is implemented in this stage.

## Expansion Strategy

When future templates are approved:

1. Add or activate the template key metadata.
2. Add renderer only if the existing renderer cannot support the template.
3. Keep template access separate from business type.
4. Keep subscription gating outside this registry until marketplace stage.
5. Preserve fallback behavior for existing tenants.

## Validation Status

Stage 9.2B added dedicated resolver test coverage for the registry.

Validated:

- Legacy Restaurant mapping.
- Legacy Warteg mapping.
- Stable template key mapping.
- Laundry legacy mapping.
- Clinic legacy mapping.
- Clinic schema key mapping.
- Clinic renderer key mapping.
- Planned premium key mapping.
- Unknown key fallback.
- Undefined, null, and empty schema fallback.
- Active template metadata and renderer availability.
- Catalog metadata completeness for every registered template.

Test file:

```text
frontend/src/features/templates/registry/__tests__/templateResolver.test.ts
```

Current result:

```text
15 resolver and registry tests passing
```
