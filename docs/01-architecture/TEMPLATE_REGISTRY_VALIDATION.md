# Template Registry Validation

## Purpose

This document defines the long-term validation rules for UMKM Builder's template registry.

The registry exists to keep renderer selection stable as template options grow.

## Registry Rules

- Every template key must have metadata.
- Every metadata entry must define a renderer key.
- Every renderer key used by metadata must resolve to a renderer.
- Active template keys must be covered by tests.
- Planned template keys may exist as architecture support, but must not imply a template has been built.
- Future templates must register through the registry layer.
- Direct renderer branching in `PublicSiteRenderer` is prohibited.

## Resolver Rules

The resolver must check values in this order:

1. `template.schema.templateKey` or `template.schema.key`.
2. `template.schema.rendererKey`.
3. `template.name` when it already matches a stable template key.
4. Legacy template name aliases.
5. `minimal_business` fallback.

## Fallback Strategy

Fallback behavior must remain safe:

```text
unknown template
-> minimal_business
-> generic_business renderer
```

Null or missing metadata must also resolve to `minimal_business`.

## Legacy Compatibility

Legacy restaurant and warteg templates must resolve to `restaurant_classic`:

```text
restaurant-default -> restaurant_classic
warteg-default -> restaurant_classic
```

This preserves existing Restaurant and Warteg public sites while the platform evolves toward explicit template keys.

## Future Expansion Validation

The registry must support these future keys at the architecture level:

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

Architecture support is not template implementation.

## Testing Strategy

Dedicated resolver tests must cover:

- Legacy Restaurant mapping.
- Legacy Warteg mapping.
- Known stable key mapping.
- Planned premium key mapping.
- Unknown key fallback.
- Undefined, null, and empty schema fallback.
- Registry integrity for all supported keys.
- Active template metadata and renderer availability.

Current test file:

```text
frontend/src/features/templates/registry/__tests__/templateResolver.test.ts
```
