# PHASE 9.7B - Template Selection Foundation Report

## 1. Executive Summary

Stage 9.7B implemented the minimum viable template selection foundation so customers can view active templates, see the current template, apply another template, and persist the selected template through the existing `Website.templateId -> Template` relationship.

Implemented:

- Authenticated template listing API.
- Website template assignment API.
- Dashboard-accessible template management page.
- Premium template selection for Restaurant Premium and Cafe Premium.
- Smoke coverage for Restaurant Classic -> Restaurant Premium and Cafe Modern -> Cafe Premium.

Not implemented:

- Template marketplace.
- Template comparison page.
- Public catalog landing page.
- Billing, subscriptions, entitlement, or premium restrictions.
- Preview-before-apply.
- Template switch history.
- Database schema changes or Prisma migrations.

## 2. Backend API Changes

### Template Listing

Endpoint:

```text
GET /templates
```

Returns active selectable templates with:

```text
templateKey
displayName
description
industry
category
tier
previewImage
recommendedBusinessTypes
```

### Template Assignment

Endpoint:

```text
PATCH /websites/:id/template
```

Request:

```json
{
  "templateKey": "restaurant_premium"
}
```

Validation:

- Template key must be registered.
- Template must be active.
- Request must be made by a tenant admin for the tenant-owned website.

Persistence:

- Uses existing `templates` table.
- Creates or reuses a database `Template` row for the selected registry key.
- Updates `websites.template_id`.
- No migration was added.

## 3. Template Assignment Flow

Current supported flow:

```text
Dashboard
-> Website
-> Templates
-> Apply Template
-> PATCH /websites/:id/template
-> templates upsert by templateKey
-> websites.template_id updated
-> public site resolves template.schema.templateKey
-> templateRegistry renders selected renderer
```

This preserves the existing architecture:

```text
Website
-> templateId
-> Template
-> schema.templateKey
-> frontend registry
-> renderer
```

## 4. Dashboard Template Management

Added:

```text
/app/websites/:websiteId/templates
```

User capabilities:

- View active templates.
- See preview image.
- See display name, description, category, industry, and tier.
- See recommended templates based on current template business type.
- See current template indicator.
- Apply a template with one click.

Entry points:

- Dashboard next actions.
- Website list.
- Website editor.

## 5. Premium Template Validation

Validated:

| Template | Selectable | Persisted | Public Rendering |
| --- | --- | --- | --- |
| `restaurant_premium` | YES | YES | YES |
| `cafe_premium` | YES | YES | YES |

Smoke test validates:

- Restaurant tenant starts from Restaurant Classic.
- Restaurant tenant applies Restaurant Premium.
- Public site renders `data-template-key="restaurant_premium"`.
- Cafe tenant starts from Cafe Modern.
- Cafe tenant applies Cafe Premium.
- Public site renders `data-template-key="cafe_premium"`.

## 6. Testing Results

| Check | Result |
| --- | --- |
| Backend tests | Passed: 35/35. |
| Backend build | Passed. |
| Backend lint | Passed. |
| Frontend registry tests | Passed: 25/25. |
| Frontend build | Passed with non-blocking Vite chunk-size warning. |
| Frontend lint | Passed. |
| Docker rebuild | Passed. |
| Full smoke test | Passed: 10/10. |
| Template preview assets in Docker | Passed after Dockerfile copied `public` into Vite build context. |

## 7. Evidence Locations

Evidence files:

```text
docs/evidence/template-selection/template-selection-mobile.png
docs/evidence/template-selection/template-selection-tablet.png
docs/evidence/template-selection/template-selection-desktop.png
```

## 8. Risks

| Risk | Severity | Notes |
| --- | --- | --- |
| Backend and frontend metadata can drift | Medium | Stage uses a backend catalog source for API and frontend registry for rendering. A future shared package may reduce drift. |
| No entitlement enforcement | Low for this stage | Premium remains metadata only by explicit rule. |
| No preview-before-apply | Low for this stage | Users see preview images but cannot preview full site before applying. |
| No switch history | Low for this stage | Applying a template overwrites assignment directly. |

## 9. Recommendations

Immediate:

- Keep Stage 9.7B limited to selection foundation.
- Use the new template management page for pilot validation.
- Avoid commercial claims about billing-gated premium access until entitlement is implemented.

Recommended next:

- Add a shared metadata package or generated metadata artifact to reduce frontend/backend drift.
- Add admin override after tenant flow is approved.
- Add preview-before-apply in a later approved stage.

Future:

- Template Catalog.
- Marketplace.
- Template comparison.
- Subscription-based access.
- Luxury templates.
