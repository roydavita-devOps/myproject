# PHASE 9.7A - Template Selection And Assignment Audit Report

## 1. Executive Summary

Stage 9.7A audited the current template assignment and selection architecture without changing application code, database schema, business logic, or UI.

Main finding:

- Tenants do not currently choose a real template from the implemented template registry.
- New tenant websites receive a database `templateId` automatically based on `businessType`.
- The frontend resolver can render premium templates if the API payload contains `template.schema.templateKey` or `template.schema.rendererKey`.
- Current registration, onboarding, dashboard, and admin UI do not expose a way to select, change, compare, or assign active templates.
- Premium templates are active in frontend registry metadata, but not reachable through the current user flow or current seeded local database rows.

Go / No-Go:

- Go for continuing architecture planning.
- No-Go for claiming commercial template choice is production-ready.
- No-Go for paid users choosing Premium templates until template selection, persistence, and admin/user assignment flows are implemented in a separately approved stage.

## 2. Template Assignment Flow

### Email Registration Flow

Actual implementation:

```text
RegisterPage
-> POST /auth/register
-> RegisterDto.businessType
-> AuthService.createTenantWorkspace()
-> findOrCreateTemplate(businessType)
-> Website.templateId = selected template.id
```

The frontend register form asks for:

- business name
- slug
- admin name
- email
- password
- business type

It does not ask for a template key or template ID.

### Google Onboarding Flow

Actual implementation:

```text
Google login without existing tenant
-> user is created with onboardingCompleted = false
-> OnboardingPage
-> POST /auth/onboarding/complete
-> CompleteOnboardingDto.businessType
-> AuthService.createTenantWorkspace()
-> findOrCreateTemplate(businessType)
-> Website.templateId = selected template.id
```

The onboarding UI contains a `Template` dropdown with:

- Default template
- Menu focused
- Service focused

However, backend assignment ignores `templateName`. `createTenantWorkspace()` accepts the DTO but only uses `businessType`, `businessName`, `slug`, `themePreference`, and `colorPreset`.

### Auto Assignment Logic

Actual backend logic:

```text
findOrCreateTemplate(businessType)
-> find first ACTIVE template where Template.businessType = selected business type
-> if found, use it
-> if not found, create `${businessType.toLowerCase()}-default`
-> schema = { sections: [...] }
```

Assignment is therefore:

```text
Business Type
-> First active database Template for that BusinessType
-> Website.templateId
```

There is no manual selection in the active registration or onboarding assignment path.

## 3. Template Storage Analysis

### Database Storage

Templates are stored in:

```text
templates
```

Relevant model:

```text
Template
├── id
├── name
├── businessType
├── schema
├── status
└── websites
```

Website assignment is stored in:

```text
websites.template_id
```

Relevant model:

```text
Website
├── tenantId
├── templateId
├── themeId
├── status
└── template relation
```

There is no `tenant.template_key`, `website.template_key`, `settings.template_key`, or dedicated persisted catalog selection field.

### Local Database Observation

Read-only local query found active template rows such as:

```text
warteg-default
warteg-demo-template
cafe-demo-template
laundry-default
laundry-demo-template
workshop-demo-template
clinic-demo-template
local_service-default
```

No local rows were found for:

```text
restaurant_premium
cafe_premium
restaurant-premium
cafe-premium
```

This confirms that premium renderer metadata exists in frontend registry, but the local database does not currently seed premium template rows.

## 4. Resolver Flow Analysis

Complete current chain:

```text
Database
-> Website.templateId
-> Template relation included by WebsitesService
-> API returns Website with template object
-> PublicSitePage calls resolveTemplate(website)
-> templateRegistry returns renderer
-> PublicSiteRenderer renders selected template
```

### API Includes Template

`WebsitesService.findAll()`, `findOne()`, `publicSite()`, and preview flow include:

```text
template: true
```

Public route:

```text
GET /public/site/:slug
-> publicSiteBySlug()
-> publicSite(tenant.id)
-> first PUBLISHED website
-> includes template, theme, menus, galleries, reviews
```

### Frontend Resolver Priority

Resolver order:

```text
1. template.schema.templateKey or template.schema.key
2. template.schema.rendererKey
3. template.name if it matches a known TemplateKey
4. legacyTemplateNameAliases[template.name]
5. minimal_business fallback
```

### Fallback Behavior

If template data is missing or unknown:

```text
defaultTemplateKey = minimal_business
```

If `template.schema.rendererKey` is known but no metadata match is found, the resolver uses fallback metadata while rendering the requested renderer. For current registered renderer keys, metadata exists.

### Legacy Name Behavior

Legacy aliases map database template names to frontend template keys:

```text
restaurant_default -> restaurant_classic
warteg_default -> restaurant_classic
laundry_default -> laundry_clean
clinic_default -> clinic_professional
cafe_default -> cafe_modern
local_service_default -> corporate_executive
```

Demo seed names also map:

```text
warteg_demo_template -> restaurant_classic
laundry_demo_template -> laundry_clean
clinic_demo_template -> clinic_professional
cafe_demo_template -> cafe_modern
```

There are no legacy aliases for premium template assignment from default names.

## 5. Premium Template Reachability

### Restaurant Premium

| Question | Answer | Notes |
| --- | --- | --- |
| Registered | YES | Renderer key `restaurant_premium` is registered in frontend template registry. |
| Metadata active | YES | `restaurant_premium` status is active and tier is premium. |
| Reachable by user | NO | No UI allows selecting it. |
| Reachable by existing flow | NO | Registration/onboarding assigns by business type and active DB template, not frontend template key. |
| Requires manual database update | YES | API payload must contain `template.schema.templateKey = restaurant_premium`, `rendererKey = restaurant_premium`, or a matching template name. |
| Requires developer action | YES | A developer/admin with database or API-level knowledge must create/update template rows or website assignment. |

### Cafe Premium

| Question | Answer | Notes |
| --- | --- | --- |
| Registered | YES | Renderer key `cafe_premium` is registered in frontend template registry. |
| Metadata active | YES | `cafe_premium` status is active and tier is premium. |
| Reachable by user | NO | No UI allows selecting it. |
| Reachable by existing flow | NO | `CAFE` defaults resolve to `cafe_modern` through default/demo aliases. |
| Requires manual database update | YES | API payload must contain `template.schema.templateKey = cafe_premium`, `rendererKey = cafe_premium`, or a matching template name. |
| Requires developer action | YES | A developer/admin with database or API-level knowledge must create/update template rows or website assignment. |

## 6. User Template Selection Analysis

| Capability | Current Answer | Evidence |
| --- | --- | --- |
| View available templates | NO | No template catalog/list route or UI exists. |
| Select template | NO | Register only sends `businessType`; onboarding sends `templateName` but backend ignores it for assignment. |
| Change template | NO | Website update DTO does not accept `templateId`, `templateKey`, or `templateName`. |
| Preview template | PARTIAL | Users can preview their existing assigned website only. They cannot preview unassigned templates. |
| Compare templates | NO | No comparison data, page, or UI exists. |

Important nuance:

- `POST /websites` accepts a raw `templateId`, but the tenant UI does not expose website creation or template listing. This is not a real user selection workflow.
- There is no client API method for listing available templates.

## 7. Admin Template Management Analysis

| Admin Capability | Current Answer | Evidence |
| --- | --- | --- |
| Assign Template | NO | Admin tenant endpoints manage tenants only, not website template assignment. |
| Change Template | NO | No admin endpoint updates `Website.templateId`. |
| Override Template | NO | No override endpoint or UI exists. |
| List Templates | NO | No `templates` controller/service route exists. |

Super admin can manage tenant lifecycle:

- list tenants
- create tenant
- update tenant name/slug
- suspend
- activate
- soft delete

Super admin cannot assign or override a website template through current application APIs.

## 8. Catalog Readiness Analysis

### Already Available

The frontend registry now contains:

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

Active frontend registry templates include:

```text
restaurant_classic
restaurant_premium
laundry_clean
clinic_professional
corporate_executive
cafe_modern
cafe_premium
minimal_business
```

Preview assets exist for the latest active template work, including:

```text
restaurant-premium.jpg
cafe-premium.jpg
```

### Missing Before Future Catalog

Required gaps before Template Catalog:

- Backend template listing endpoint.
- Backend/public contract for template catalog metadata.
- Persistent user-selected `templateKey` or reliable template row strategy.
- Template assignment API.
- Template change/switch API.
- Template preview route for unassigned templates.
- Template comparison model.
- Template selection UI.
- Admin override UI/API.
- Migration plan from legacy template names to explicit template keys.
- Rule for premium access once subscription enforcement is approved.

## 9. Commercial Readiness Assessment

Question:

```text
Can a paying customer currently:
Register
-> Choose Template
-> Launch Website
```

Answer:

```text
NO
```

Justification:

- A paying customer can register.
- A paying customer can launch the auto-assigned website.
- A paying customer cannot choose from available templates.
- A paying customer cannot choose Premium templates.
- A paying customer cannot change templates after launch.
- Premium templates are implemented but effectively hidden from the normal product workflow.

Current commercially accurate statement:

```text
Register
-> Business type auto-assigns a default template
-> Launch Website
```

Not currently accurate:

```text
Register
-> Choose Template
-> Launch Website
```

## 10. Risks

| Risk | Severity | Notes |
| --- | --- | --- |
| Premium templates are active but not user-reachable | High | Creates mismatch between product capability and commercial promise. |
| Onboarding template dropdown is misleading | High | `templateName` appears selectable but does not affect backend assignment. |
| Assignment depends on first active DB row for business type | Medium | `findFirst()` has no explicit order, so behavior can drift when multiple active templates exist for the same business type. |
| Frontend registry and database template rows are not fully aligned | Medium | Frontend knows active premium templates; database does not seed/store them by default. |
| No admin override path | Medium | Support cannot fix a tenant's template selection through application UI/API. |
| Fallback hides bad template data | Low | Unknown template records render `minimal_business`, which protects users but can mask misconfiguration. |

## 11. Recommendations

### Immediate

Must be completed before claiming production/commercial template choice:

1. Decide whether Stage 10 Production Readiness can proceed with auto-assignment only, or whether template choice is a launch requirement.
2. Remove or clearly re-scope the onboarding `Template` dropdown until it is connected to real template assignment.
3. Document current commercial wording as auto-assigned templates, not user-selected templates.
4. Add deterministic ordering or explicit default marker for `findOrCreateTemplate()` if multiple active templates per business type can exist.

### Recommended

Should be completed before Template Catalog:

1. Add backend template catalog read endpoint.
2. Persist explicit template identity through a stable `templateKey` strategy.
3. Add assignment/update endpoint that changes a website template safely.
4. Add admin template override capability.
5. Seed database template rows for active registry templates.
6. Add tests for registration assignment and premium reachability.

### Future

Can wait until marketplace phase:

1. Template comparison UI.
2. Template marketplace merchandising.
3. Premium template entitlement enforcement.
4. Subscription-based access rules.
5. Marketplace analytics and conversion tracking.

## 12. Go / No-Go Decision

| Area | Decision |
| --- | --- |
| Registry architecture | GO |
| Metadata architecture | GO |
| Premium renderer readiness | GO |
| Auto-assigned website launch | GO with clear positioning |
| User template selection | NO-GO |
| Premium template commercial access | NO-GO |
| Template Catalog | NO-GO until separately approved |
| Production Readiness | CONDITIONAL GO if launch promise is auto-assigned templates only |

Final decision:

```text
Stage 9.7A audit complete.
Do not implement Template Catalog, Template Picker, Template Switching, Production Readiness, or Luxury Templates until explicitly approved.
```
