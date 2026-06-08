# Template Metadata Standard

Date: 2026-06-08

Status: Approved for future template expansion.

## Purpose

This document defines the official metadata contract for UMKM Builder templates.

All future templates must provide catalog-ready metadata before they are considered implementation-ready.

## Design Principle

Template identity is separate from business type.

```text
business_type = recommendation
template_key = selected template identity
renderer_key = implementation renderer
```

Business type may recommend templates, but it must not permanently lock a tenant to one template.

## Required Metadata Contract

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `template_key` | string | Yes | Stable unique template identity. |
| `display_name` | string | Yes | User-facing template name. |
| `description` | string | Yes | Short template description for catalog and internal review. |
| `industry` | string | Yes | Broad market category. |
| `category` | string | Yes | Specific template category. |
| `renderer_key` | string | Yes | Renderer key used by the template registry. |
| `status` | `active` or `planned` | Yes | Template lifecycle state. |
| `preview_image` | string | Yes | Preview asset filename or path. |
| `tier` | `standard`, `premium`, or `luxury` | Yes | Commercial tier metadata. |
| `recommended_business_types` | string[] | Yes | Business types where the template should be recommended. |

## Example

```text
template_key: restaurant_classic
display_name: Restaurant Classic
description: Clean restaurant landing page optimized for food businesses.
industry: Food & Beverage
category: Restaurant
renderer_key: restaurant
status: active
preview_image: restaurant_classic.jpg
tier: standard
recommended_business_types: WARTEG, RESTAURANT, CAFE
```

## Clinic Professional Example

```text
template_key: clinic_professional
display_name: Clinic Professional
description: Professional healthcare landing page designed for clinics and medical practices.
industry: Healthcare
category: Clinic
renderer_key: clinic
status: active
preview_image: clinic-professional.jpg
tier: standard
recommended_business_types: CLINIC
```

## Corporate Executive Example

```text
template_key: corporate_executive
display_name: Corporate Executive
description: Executive business template for corporate, professional service, and consulting websites.
industry: Business Services
category: Corporate
renderer_key: corporate
status: active
preview_image: corporate-executive.jpg
tier: premium
recommended_business_types: CLINIC, LOCAL_SERVICE, RETAIL
```

## Cafe Modern Example

```text
template_key: cafe_modern
display_name: Cafe Modern
description: Modern cafe template for lifestyle-focused cafes and coffee shops.
industry: Food & Beverage
category: Cafe
renderer_key: cafe
status: active
preview_image: cafe-modern.jpg
tier: premium
recommended_business_types: CAFE
```

## Current Code Mapping

The current registry uses TypeScript-friendly camelCase names.

| Standard Field | Current Code Field |
| --- | --- |
| `template_key` | `key` |
| `display_name` | `displayName` |
| `renderer_key` | `rendererKey` |
| `recommended_business_types` | `recommendedBusinessTypes` |
| `status` | `status` |
| `tier` | `tier` |
| `description` | `description` |
| `industry` | `industry` |
| `category` | `category` |
| `preview_image` | `previewImage` |

## Status Rules

| Status | Meaning |
| --- | --- |
| `active` | Template is available for rendering. |
| `planned` | Template is reserved in metadata but not yet fully implemented. |

Future statuses such as `deprecated`, `hidden`, or `retired` require explicit approval before use.

## Tier Rules

| Tier | Meaning |
| --- | --- |
| `standard` | Baseline templates available to entry plans. |
| `premium` | Higher-value templates intended for paid upgrades. |
| `luxury` | High-end templates intended for top-tier access. |

Tier metadata does not enforce access control by itself.

Do not add billing, entitlement, subscription checks, or access restrictions in template metadata without a separate approved stage.

## Preview Image Rules

Recommended future preview path:

```text
frontend/public/template-previews/<template_key>.jpg
```

Current Stage 9.4 preview placeholder:

```text
frontend/public/template-previews/clinic-professional.jpg
frontend/public/template-previews/corporate-executive.jpg
frontend/public/template-previews/cafe-modern.jpg
```

Rules:

- One preview image per registered template.
- Filename should match `template_key`.
- Prefer JPG or WEBP for full-page previews.
- Preview image must not be required by renderer code.
- Missing preview image should block Template Catalog readiness tests once the catalog implementation stage begins.

## Validation Rules

Future registry tests should enforce:

- Every `TemplateKey` has a metadata record.
- Every metadata record has `template_key`, `display_name`, `description`, `industry`, `category`, `renderer_key`, `status`, `preview_image`, `tier`, and `recommended_business_types`.
- Every `renderer_key` resolves to a renderer.
- Every `tier` is one of `standard`, `premium`, or `luxury`.
- Every active template has a preview image.
- Planned templates may remain non-renderable only if their renderer fallback behavior is explicit and tested.

## Implementation Boundary

Stage 9.4 implements the metadata contract in the frontend registry for current template entries and adds Clinic Professional preview placeholder support.

It does not create:

- Template Catalog UI.
- Template switching.
- Template previews.
- Subscription access control.
- New template implementations.
- Database schema changes.
