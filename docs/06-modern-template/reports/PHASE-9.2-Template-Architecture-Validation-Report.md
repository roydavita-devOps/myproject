# PHASE 9.2 - Template Architecture Validation Report

## 1. Executive Summary

Stage 9.2 validates whether the current template architecture can evolve into a future Template Marketplace without a major refactor.

Conclusion:

- The current architecture has a usable foundation: `Template`, `Website`, `Theme`, `Subscription`, reusable template components, CTA validation, public rendering, and tenant-scoped website data already exist.
- The architecture is partially config driven at the database level because `Website.templateId` points to `Template`, and `Template.schema` exists.
- The architecture is still partly hardcoded at the frontend rendering level because template selection currently branches on `website.template.businessType`, not a stable `template_key`.
- The approved product principle is not fully implemented yet:

```text
Business Type = Recommendation
Template = User Choice
```

Current implementation still effectively uses:

```text
Business Type -> Active Template -> Renderer by businessType
```

Readiness decision:

```text
GO WITH CONDITIONS
```

The system can support marketplace evolution with a medium-sized incremental refactor before marketplace rollout. It should not proceed into multiple new premium templates without first introducing a stable template registry and decoupling renderer selection from `businessType`.

## 2. Current Architecture

### Backend

Relevant files:

- `backend/prisma/schema.prisma`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/websites/websites.service.ts`
- `backend/src/modules/websites/websites.controller.ts`
- `backend/prisma/seed.ts`

Current backend flow:

```text
User register or complete onboarding
-> AuthService.createTenantWorkspace()
-> findOrCreateTemplate(businessType)
-> create Tenant
-> create Subscription
-> create Theme
-> create Website with templateId and themeId
-> create Domain
```

The backend already stores website-to-template selection through `Website.templateId`.

### Frontend

Relevant files:

- `frontend/src/features/public-site/PublicSitePage.tsx`
- `frontend/src/features/templates/RestaurantTemplate.tsx`
- `frontend/src/features/templates/TemplateComponents.tsx`
- `frontend/src/features/templates/templateActions.ts`
- `frontend/src/features/templates/templateTheme.ts`
- `frontend/src/features/auth/OnboardingPage.tsx`
- `frontend/src/types/api.ts`

Current frontend rendering flow:

```text
PublicSitePage
-> publicSiteApi.bySlug(slug)
-> PublicSiteRenderer(website)
-> if website.template.businessType is RESTAURANT or WARTEG
   -> RestaurantTemplate
-> else
   -> Generic template component composition
```

## 3. Tenant Model Review

### Current Tenant Structure

Current `Tenant` model fields:

```text
tenant
|-- id
|-- name
|-- slug
|-- status
|-- users
|-- subscriptions
|-- websites
|-- themes
|-- domains
|-- menuCategories
|-- menus
|-- galleries
|-- reviews
|-- contacts
|-- analytics
|-- createdAt
|-- updatedAt
`-- deletedAt
```

Current tenant model does not store `businessType` directly.

### Current Template Reference

Template selection is stored on `Website`:

```text
website
|-- tenantId
|-- templateId
|-- themeId
|-- businessName
`-- public website content
```

Template metadata is stored on `Template`:

```text
template
|-- id
|-- name
|-- businessType
|-- schema
`-- status
```

### Onboarding Fields

`CompleteOnboardingDto` includes:

```text
businessName
slug
businessType
templateName
themePreference
colorPreset
```

Important finding:

- `templateName` is accepted by the DTO and collected by the frontend onboarding page.
- `templateName` is not used by `AuthService.createTenantWorkspace()`.
- Backend template assignment currently uses only `businessType`.

### Is Template Selection Hardcoded or Config Driven?

Current state:

```text
Database assignment: partially config driven
Backend onboarding selection: businessType driven
Frontend renderer selection: hardcoded businessType branch
Marketplace readiness: incomplete
```

Evidence:

- Backend stores `templateId` on `Website`, which is the right foundation.
- Backend creates or finds templates by `businessType`, not by user-selected template key.
- Frontend chooses `RestaurantTemplate` by `template.businessType`, not by template name/key.
- No explicit template registry exists.

## 4. Template Architecture Review

### Current Template Registry

There is no explicit template registry module yet.

Current implicit registry:

```text
if businessType in [RESTAURANT, WARTEG]
  render RestaurantTemplate
else
  render Generic TemplateComponents composition
```

This works for current restaurant/warteg delivery but will not scale cleanly to:

- Restaurant Classic
- Restaurant Premium
- Restaurant Luxury
- Cafe Minimal
- Cafe Modern
- Cafe Premium
- Clinic Professional
- Clinic Executive
- Corporate Standard
- Corporate Executive

### Template Loading

Current public loading:

```text
GET /public/site/:slug
-> WebsitesService.publicSiteBySlug()
-> WebsitesService.publicSite()
-> include template, theme, categories, menus, galleries, reviews
-> frontend receives Website payload
-> PublicSiteRenderer renders component
```

This is acceptable for current public site rendering.

### Theme System

Current theme model:

```text
theme
|-- tenantId
|-- name
|-- primaryColor
|-- secondaryColor
|-- accentColor
|-- typography
|-- logoUrl
`-- heroImageUrl
```

Frontend maps theme values into CSS custom properties:

```text
--tpl-primary
--tpl-secondary
--tpl-accent
--tenant-primary
--tenant-secondary
--tenant-accent
--tenant-font-heading
--tenant-font-body
```

Assessment:

- Good foundation for theme isolation.
- Works for standard visual variation.
- Needs richer metadata later for premium templates if templates require layout variants, section visibility, animation level, or premium-only components.

### Template Rendering Flow

```text
Website payload
-> resolveTemplateTheme(website)
-> PublicSiteRenderer
-> businessType branch
-> selected template component
-> reusable template components
-> CTA validation through normalizeTemplateAction()
```

Strength:

- Reusable components already exist.
- CTA validation was improved in Sprint 2 final fix.
- Theme variables are centralized.

Weakness:

- Renderer selection is not driven by template identity.
- `Template.schema.sections` is stored but not actively used to compose sections.
- There is no template metadata layer for tier, preview image, category, required data, or subscription access.

## 5. Data Model Validation

### Current State

Current relevant model relationships:

```text
Tenant 1 -> many Websites
Tenant 1 -> many Subscriptions
Tenant 1 -> many Themes
Website many -> 1 Template
Website many -> 1 Theme
Template 1 -> many Websites
```

Current relevant enums:

```text
BusinessType
SubscriptionPlan
SubscriptionStatus
TemplateStatus
WebsiteStatus
```

Current `Template` model:

```text
Template
|-- id
|-- name
|-- businessType
|-- schema
|-- status
|-- websites
|-- createdAt
`-- updatedAt
```

Current `Website` model:

```text
Website
|-- id
|-- tenantId
|-- templateId
|-- themeId
|-- status
|-- businessName
`-- content fields
```

### Proposed State

Future marketplace-ready structure should support:

```text
tenant
|-- business_type
|-- subscription_plan
`-- active website(s)

website
|-- template_id
`-- selected template instance

template
|-- key
|-- display_name
|-- recommended_business_types
|-- category
|-- tier
|-- renderer_key
|-- preview_image_url
|-- schema
|-- status
`-- version
```

Minimum recommended incremental model:

```text
Tenant
`-- businessType

Template
|-- key
|-- name
|-- category
|-- tier
|-- rendererKey
|-- recommendedBusinessTypes
|-- schema
`-- status
```

### Migration Complexity

Complexity:

```text
Medium
```

Reasoning:

- Existing `Website.templateId` is a strong foundation and avoids a full rewrite.
- Existing `Template.schema` can be extended.
- Existing `Subscription` model supports future access control.
- Complexity rises because `businessType` is currently attached to `Template`, not `Tenant`, and frontend rendering currently uses `template.businessType`.
- Existing tenants can be backfilled from their current `website.template.businessType`.

Suggested future migration path:

```text
1. Add Tenant.businessType nullable.
2. Add Template.key unique.
3. Add Template.rendererKey.
4. Add Template.tier or accessLevel.
5. Backfill Tenant.businessType from current website.template.businessType.
6. Backfill Template.key from current template name.
7. Update renderer to select by rendererKey or key.
8. Keep businessType as recommendation metadata, not renderer selector.
```

## 6. Future Compatibility Analysis

### Scenario 1

```text
Business Type = Cafe
Template = Cafe Premium
```

Current support:

```text
Partially supported
```

Why:

- Database can store a website pointing to any template ID.
- Current onboarding cannot select a specific Cafe Premium template.
- Frontend has no Cafe Premium renderer.
- Renderer selection by `businessType` would need a Cafe branch or registry entry.

Required changes:

- Add template key/metadata.
- Add Cafe Premium renderer or compose it through registry.
- Make onboarding pass selected template key.

### Scenario 2

```text
Business Type = Cafe
Template = Restaurant Luxury
```

Current support:

```text
Not cleanly supported
```

Why:

- The database could technically assign a Cafe tenant website to a Restaurant template if a template ID is manually selected.
- The product flow does not support this user choice.
- Business type is not stored separately on tenant, so assigning Restaurant Luxury would lose the original Cafe recommendation signal unless stored elsewhere.

Required changes:

- Store tenant/business profile `businessType` separately.
- Store selected template separately through `Website.templateId`.
- Render by template key or renderer key, not business type.

### Scenario 3

```text
Business Type = Clinic
Template = Corporate Executive
```

Current support:

```text
Not cleanly supported
```

Why:

- Current frontend generic fallback may render a usable page, but it does not represent Corporate Executive quality.
- There is no Corporate Executive template metadata or renderer.
- Business Type vs Template independence is not represented in active data flow.

Required changes:

- Add marketplace metadata.
- Add Corporate Executive renderer or section composition.
- Add access control by subscription plan.

### Scenario 4

```text
Business Type = Laundry
Template = Minimal Business
```

Current support:

```text
Partially supported
```

Why:

- Generic fallback can render laundry-like menu/service data.
- A Minimal Business template could reuse generic components.
- However, there is no template key, catalog entry, or explicit renderer registry.

Required changes:

- Add Minimal Business template metadata.
- Add registry mapping.
- Store user-selected template.

## 7. Template Marketplace Readiness Assessment

| Area | Score | Assessment |
| --- | ---: | --- |
| Template Registry | 2/5 | No explicit registry. Current selection is a businessType branch in `PublicSiteRenderer`. |
| Theme System | 4/5 | Strong base with CSS variables, tenant colors, typography, and assets. Needs richer premium metadata later. |
| Component Reuse | 4/5 | Strong base components and CTA validation exist. More templates can reuse these safely. |
| Marketplace Readiness | 2/5 | Product docs are ready, but code lacks template keys, catalog metadata, preview flow, switching, and access control. |
| Scalability | 3/5 | Foundation can scale after registry/data model improvements. Current branching will become brittle if more templates are added directly. |

Overall readiness:

```text
3/5 - Foundation ready, marketplace abstraction not ready.
```

## 8. Gap Analysis

### Current Strengths

- `Website.templateId` already decouples websites from templates at the database relationship level.
- `Template.schema` exists and can become a future configuration contract.
- `Subscription` model already exists.
- Theme isolation is centralized through `resolveTemplateTheme()`.
- Reusable template sections exist.
- CTA validation prevents blank action buttons.
- Public and preview rendering use the same `PublicSiteRenderer`, reducing divergence.

### Current Weaknesses

- No explicit `template_key`.
- No explicit template registry.
- Renderer selection uses `template.businessType`.
- `Tenant` does not store `businessType`.
- `templateName` from onboarding is not used by backend.
- `Template.schema.sections` is not used to drive rendering.
- No template tier/access metadata.
- No template preview/catalog API.
- No template switching workflow.

### Future Risks

- Adding Laundry, Clinic, Corporate, and Cafe by repeatedly adding `if businessType === ...` branches will create a brittle renderer.
- Premium templates may become mixed with business type logic instead of subscription access logic.
- Cross-category template selection will be hard to support if `businessType` remains the renderer selector.
- Marketplace monetization will require retrofitting template access if tier metadata is not introduced early.

### Technical Debt

- `templateName` is a UI/DTO field but currently has no backend effect.
- `Template.name` acts as an identifier but is not stable enough for marketplace logic.
- `Template.businessType` currently carries both recommendation and classification responsibilities.
- `Template.schema` is underused.

### Must Fix Before Sprint 3

- Create a documented template registry plan before adding more template-specific branches.
- Decide stable template identifiers: `template_key` and/or `renderer_key`.
- Ensure Sprint 3 Laundry does not increase renderer branching debt without a minimal registry.

### Can Wait Until Stage 9.5

- Database migration for `Tenant.businessType`.
- Template catalog metadata table/fields.
- Template switching endpoint.
- Template preview with tenant data.
- Template access control by subscription tier.

### Can Wait Until Commercial Launch

- Billing provider integration.
- Premium template purchase flow.
- Marketplace browsing UI.
- Template analytics and conversion comparison.
- Template versioning and rollback controls.

## 9. Risk Assessment

| Risk | Severity | Likelihood | Notes |
| --- | --- | --- | --- |
| Business type and template remain coupled | High | High | Blocks approved marketplace strategy if not fixed. |
| Renderer branching grows per template | Medium | High | Becomes harder to maintain after 4-6 templates. |
| Premium access implemented late | Medium | Medium | Can be deferred, but metadata should be planned now. |
| Existing tenants need migration | Medium | Medium | Backfill is manageable because `Website.template.businessType` exists. |
| Template switching breaks existing content | Medium | Medium | Requires compatibility rules for sections/data requirements. |
| Theme assumptions do not fit luxury templates | Low | Medium | Current CSS variables are strong but may need richer tokens. |

## 10. Recommendations

### Recommendation 1 - Introduce `template_key`

Reason:

- Stable key is required for catalog, switching, analytics, and subscription access.
- `Template.name` is not enough because display names can change.

Example future keys:

```text
restaurant_classic
restaurant_premium
restaurant_luxury
cafe_minimal
cafe_modern
cafe_premium
clinic_professional
clinic_executive
corporate_standard
corporate_executive
minimal_business
```

### Recommendation 2 - Keep `businessType` Separate From Template Selection

Reason:

- Business type should remain the recommendation signal.
- Selected template should be stored independently through website/template relation.

Future direction:

```text
Tenant.businessType = CAFE
Website.templateId -> restaurant_luxury
```

### Recommendation 3 - Create a Frontend Template Registry

Reason:

- Prevents `PublicSiteRenderer` from becoming a large conditional tree.
- Allows multiple template keys to share one renderer when appropriate.

Example future registry:

```text
templateRegistry
|-- restaurant_classic -> RestaurantTemplate
|-- restaurant_luxury -> RestaurantTemplate
|-- cafe_minimal -> GenericBusinessTemplate
|-- corporate_executive -> CorporateTemplate
`-- fallback -> GenericBusinessTemplate
```

### Recommendation 4 - Add Template Metadata Layer

Reason:

- Marketplace requires catalog display, preview, tier, category, and recommendation rules.

Minimum metadata:

```text
key
displayName
category
tier
rendererKey
recommendedBusinessTypes
previewImageUrl
schema
status
```

### Recommendation 5 - Add Future Subscription Access Layer

Reason:

- Premium and luxury templates should be controlled by subscription plan, not business type.

Future access rule:

```text
if tenant.subscription.plan allows template.tier
  allow selection
else
  show upgrade path
```

### Recommendation 6 - Use `Template.schema` More Deliberately

Reason:

- Existing schema can become the section contract for templates.
- This avoids hardcoding every section in every renderer.

Potential schema structure:

```json
{
  "sections": ["hero", "about", "menu", "gallery", "reviews", "location", "contact"],
  "requiredData": ["businessName", "whatsapp"],
  "optionalData": ["heroImageUrl", "menus", "reviews"],
  "layout": "restaurant"
}
```

## 11. Architecture Diagrams

### Current Onboarding and Template Assignment

```text
Register / Google Register / Complete Onboarding
        |
        v
AuthService.createTenantWorkspace(dto)
        |
        v
findOrCreateTemplate(dto.businessType)
        |
        v
Tenant created
Subscription created
Theme created
Website created with templateId
Domain created
```

### Current Public Rendering

```text
Browser opens /site/:slug
        |
        v
GET /public/site/:slug
        |
        v
Website payload includes template + theme + content
        |
        v
PublicSiteRenderer
        |
        +-- template.businessType = RESTAURANT or WARTEG
        |       |
        |       v
        |   RestaurantTemplate
        |
        +-- other businessType
                |
                v
            Generic TemplateComponents composition
```

### Recommended Future Marketplace Flow

```text
Business Type selected
        |
        v
Recommendation engine suggests templates
        |
        v
User selects template_key
        |
        v
Access check by subscription plan
        |
        v
Website.templateId assigned
        |
        v
Frontend registry selects renderer_key
        |
        v
Template renders with tenant content + theme tokens
```

### Recommended Future Data Shape

```text
Tenant
|-- businessType
`-- subscriptions

Website
|-- tenantId
|-- templateId
`-- themeId

Template
|-- key
|-- rendererKey
|-- category
|-- tier
|-- recommendedBusinessTypes
`-- schema
```

## 12. Readiness Scorecard

| Requirement | Status | Notes |
| --- | --- | --- |
| Current template architecture documented | Complete | Backend and frontend flow reviewed. |
| Business Type vs Template relationship analyzed | Complete | Current flow is still businessType-driven. |
| Future marketplace compatibility validated | Complete | Compatible with medium incremental refactor. |
| Data model impact analyzed | Complete | Existing foundation reduces migration risk. |
| Risks identified | Complete | Main risk is businessType/template coupling. |
| Refactor requirements identified | Complete | Registry, template_key, metadata, tenant businessType. |
| Readiness score produced | Complete | Overall 3/5. |
| Recommendations documented | Complete | Six recommendations provided. |

## Final Decision

```text
GO WITH CONDITIONS
```

Stage 9.2 validation passes for architecture awareness, but the current system is not yet marketplace-ready.

Before starting broad template expansion, the project should introduce at least a minimal frontend template registry and a stable template identity strategy. Full marketplace, subscription gating, and template switching can wait until later stages.

## Hard Stop

This report does not implement:

- Template Marketplace
- Template switching
- Billing
- Subscription features
- Laundry Template
- Clinic Template
- Corporate Template
- Cafe Template

Wait for approval before proceeding to the next stage.
