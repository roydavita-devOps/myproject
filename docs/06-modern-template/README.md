# Modern Template

Stage 9 modern template system documentation.

Key documents:

- [# STAGE 9 - Modern Template System.md](<./# STAGE 9 — Modern Template System.md>)
- [reports/](./reports/)
- [../01-architecture/TEMPLATE_ARCHITECTURE.md](../01-architecture/TEMPLATE_ARCHITECTURE.md)
- [../01-architecture/TEMPLATE_REGISTRY_FOUNDATION.md](../01-architecture/TEMPLATE_REGISTRY_FOUNDATION.md)
- [../01-architecture/TEMPLATE_REGISTRY_VALIDATION.md](../01-architecture/TEMPLATE_REGISTRY_VALIDATION.md)
- [../08-product/TEMPLATE_MARKETPLACE.md](../08-product/TEMPLATE_MARKETPLACE.md)

Current status:

- Sprint 1 Design System Foundation completed.
- Sprint 1 Stabilization completed.
- Sprint 2 Restaurant Template completed.
- Sprint 2 Final CTA Visibility Fix completed.
- Stage 9.2 Template Architecture Validation completed.
- Stage 9.2A Template Registry Foundation completed.
- Stage 9.2B Template Registry Validation & Test Coverage completed.
- Sprint 3 Laundry Template completed.
- Stage 9.3B Template Catalog Readiness Audit completed and tracked in architecture/product documentation.
- Sprint 4 Clinic Professional Template completed.
- Sprint 5 Corporate Executive Template completed.
- Sprint 6 Cafe Modern Template completed.
- Stage 9.6A Template Consistency Audit completed and tracked in architecture documentation.
- Stage 9.6B Basic Template Standardization completed and awaiting approval.
- Stage 9.8D-R1 through Stage 9.8D-R13 Restaurant Premium Foundation refinement track completed and approved.
- Stage 9.8E Restaurant Premium Foundation Reference Lock completed locally.
- Stage 9.9 Cafe Premium Redesign Using Restaurant Premium Foundation implemented and locally validated.
- Stage 9.9A Cafe Premium Warm Accent & Placeholder Polish implemented and locally validated.
- Stage 9.9B Cafe Premium Hero Display Controls implemented and locally validated.
- Stage 9.9C Cafe Premium Template Lock implemented as a documentation lock.
- Stage 9.10 Premium Template Catalog & Template Selection Readiness implemented and locally validated.
- Stage 9.11 Publish Readiness Gate & Website Launch Flow implemented and locally validated.
- Stage 9.11A Template Catalog Simplification & Free/Premium Focus implemented and locally validated.
- Stage 9.11B Free Template Naming Cleanup & Baseline Quality Pass implemented and locally validated.
- Stage 9.11C Free Template Catalog Consolidation & Simplified Card UX implemented and locally validated.

Restaurant Premium foundation status:

- `restaurant_premium` is the first approved Premium Foundation Reference.
- `cafe_premium` is the second approved Premium Template.
- Future premium templates should reuse principles, semantic tokens, utilities, and patterns where appropriate.
- Future premium templates must not hardcode, inherit, or blindly copy Restaurant Premium layout, restaurant-specific copy, or reservation-first assumptions.
- Future premium templates must also not blindly copy Cafe Premium coffee/pastry/corner language, cafe section names, cafe preset names, or cafe-specific visit/contact wording.
- Cafe Premium is locked as a premium template that uses the foundation standards with cafe-specific language, sections, modal copy, visual mood, warm placeholders, cafe-specific modal accents, and Premium Hero Display controls.
- Template selection now uses one primary Restaurant Premium recommendation and a View More Templates modal with only Free and Premium user-facing sections.
- Free template names now consolidate into Food & Beverage Free, Business Free, and Services Free while preserving stable internal template keys and related legacy rendering.
- Publish readiness now gates launch from the website editor with required/recommended checks, preview-before-publish, confirmation dialog, public URL state, and existing unpublish behavior.
- Railway trial is currently inactive/expired, so Stage 9.10 is validated locally and production redeploy is deferred until Railway billing/reactivation.

Evidence:

- [../evidence/modern-template/](../evidence/modern-template/)
- [../evidence/cafe-premium-warm-accent-9.9a/](../evidence/cafe-premium-warm-accent-9.9a/)
- [../evidence/cafe-premium-hero-display-9.9b/](../evidence/cafe-premium-hero-display-9.9b/)
- [../evidence/template-catalog-readiness-9.10/](../evidence/template-catalog-readiness-9.10/)
- [../evidence/publish-readiness-9.11/](../evidence/publish-readiness-9.11/)
- [../evidence/template-catalog-simplification-9.11a/](../evidence/template-catalog-simplification-9.11a/)
- [../evidence/free-template-baseline-9.11b/](../evidence/free-template-baseline-9.11b/)
- [../evidence/free-template-consolidation-9.11c/](../evidence/free-template-consolidation-9.11c/)
