# PHASE-10B Sprint 1 - Design System Review

Tanggal implementasi: 2026-06-05

Status: Sprint 1 completed. Hard stop before Sprint 2.

## Scope

Sprint 1 berfokus pada fondasi desain untuk public website template dan preview experience.

Tidak dilakukan:
- Tidak mengubah authentication.
- Tidak mengubah onboarding.
- Tidak mengubah Google Login.
- Tidak mengubah email provider.
- Tidak mengubah database.
- Tidak membuat Restaurant/Laundry/Clinic/Corporate/Cafe template khusus.

## Design Tokens

### Typography

Implemented classes:
- `tpl-display`
- `tpl-h1`
- `tpl-h2`
- `tpl-h3`
- `tpl-body`
- `tpl-caption`
- `tpl-small`

Rules:
- Mobile-first with `clamp()` sizing.
- Letter spacing remains `0` for headings/body.
- Caption uses positive tracking only for uppercase labels.
- Tenant heading/body font variables remain supported through `--tenant-font-heading` and `--tenant-font-body`.

### Colors

Semantic light-theme tokens:
- `--tpl-primary`
- `--tpl-secondary`
- `--tpl-accent`
- `--tpl-success`
- `--tpl-warning`
- `--tpl-error`
- `--tpl-background`
- `--tpl-surface`
- `--tpl-border`
- `--tpl-text-primary`
- `--tpl-text-secondary`

Theme-aware mapping:
- Tenant theme colors map into `--tpl-primary`, `--tpl-secondary`, and `--tpl-accent`.
- The architecture can support future dark theme by remapping semantic tokens without rebuilding sections.

### Spacing

Reusable spacing scale:
- `--tpl-space-xs`
- `--tpl-space-sm`
- `--tpl-space-md`
- `--tpl-space-lg`
- `--tpl-space-xl`
- `--tpl-space-2xl`
- `--tpl-space-3xl`

## Theme Structure

Implemented file:
- `frontend/src/features/templates/templateTheme.ts`

Theme flow:

`Website.theme`

↓

`resolveTemplateTheme()`

↓

CSS variables

↓

Reusable section and component styles

This establishes the Stage 9 architecture direction:

`Theme -> Sections -> Components -> Templates`

## Component Inventory

Implemented file:
- `frontend/src/features/templates/TemplateComponents.tsx`

Created reusable components:
- `TemplateNavigation`
- `TemplateButton`
- `TemplateCard`
- `TemplateInput`
- `TemplateSection`
- `SectionHeading`
- `TemplateHero`
- `TemplateFeatureSection`
- `TemplateServiceList`
- `TemplateGallery`
- `TemplateTestimonials`
- `TemplatePricingBlock`
- `TemplateContactSection`
- `TemplateLocationSection`
- `TemplateCTASection`
- `TemplateFooter`

Applied to:
- `frontend/src/features/public-site/PublicSitePage.tsx`

## Responsive Validation

Validated route:
- `http://localhost/site/warteg-moncer`

Viewport results:

| Viewport | Size | Result |
| --- | --- | --- |
| Mobile | `390x844` | PASS |
| Tablet | `768x1024` | PASS |
| Desktop | `1440x1100` | PASS |

Validation checks:
- Business name visible.
- Services section visible.
- No browser page errors.
- Layout renders without broken main experience.

## Preview Evidence

Screenshots:
- `docs/evidence/modern-template/sprint1/sprint1-mobile.png`
- `docs/evidence/modern-template/sprint1/sprint1-tablet.png`
- `docs/evidence/modern-template/sprint1/sprint1-desktop.png`

## Design Philosophy

Visual direction:
- Clean commercial landing-page structure.
- Strong hero with real business imagery.
- Clear hierarchy for service, pricing, gallery, testimonials, location, contact, and CTA sections.
- Better separation between semantic theme tokens and section composition.

UX strategy:
- Mobile-first.
- Contact actions remain prominent.
- Sticky navigation keeps website sections discoverable.
- Smooth scrolling improves preview navigation without animation-heavy frameworks.

Accessibility considerations:
- Focus rings retained on template buttons.
- Semantic section structure.
- Image alt text uses uploaded alt text or business name fallback.
- Text contrast uses semantic foreground/background tokens.

## Commercial Evaluation

Sprint 1 does not build industry-specific templates yet, but the foundation supports them without redesign:

| Industry | Supported by Sprint 1 Foundation |
| --- | --- |
| Restaurant | Hero, service/menu list, pricing highlights, gallery, testimonials, contact CTA. |
| Laundry | Service list, pricing block, trust cards, contact CTA. |
| Clinic | Trust-oriented feature cards, contact/location sections, accessible typography. |
| Corporate | Hero, profile/features, testimonials, CTA, footer. |
| Cafe | Large imagery, gallery, signature pricing/service sections, testimonials. |

## Test Results

Passed:
- Frontend build.
- Frontend lint.
- Docker Compose rebuild.
- Local Playwright screenshot validation for mobile/tablet/desktop.

## Risks & Mitigations

Risk:
- Existing templates still share one generic composition.

Mitigation:
- Sprint 1 intentionally creates the reusable foundation only. Sprint 2-6 should add industry-specific section ordering and visual variants.

Risk:
- Future templates could duplicate section code.

Mitigation:
- Public renderer now consumes shared template components, establishing a reusable pattern before adding template-specific catalogs.

## Decision

Sprint 1 is complete.

Hard stop: Do not continue to Sprint 2 until approved.
