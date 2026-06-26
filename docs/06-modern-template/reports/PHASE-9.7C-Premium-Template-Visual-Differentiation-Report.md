# PHASE 9.7C - Premium Template Visual Differentiation Report

## Scope

Stage 9.7C improves the visual quality of active Premium templates without changing template architecture.

Implemented:

- `restaurant_premium` visual differentiation.
- `cafe_premium` visual differentiation.
- Safe `corporate_executive` visual enhancement through the existing corporate renderer.
- Documentation updates for product status, roadmap, decisions, and catalog notes.

Primary objective:

```text
Standard template = functional website
Premium template = branded business experience
Luxury template = high-end editorial experience
```

## Out Of Scope

Not implemented:

- Marketplace.
- Billing.
- Subscription.
- Entitlement enforcement.
- Template Catalog UI.
- Template comparison.
- Preview-before-apply.
- Template switch history.
- Backend template assignment changes.
- Prisma schema changes.
- Database migrations.
- Authentication or tenant logic changes.

Premium tier remains metadata only.

## Files Modified

Frontend renderer files:

- `frontend/src/features/templates/RestaurantPremiumTemplate.tsx`
- `frontend/src/features/templates/CafePremiumTemplate.tsx`
- `frontend/src/features/templates/CorporateTemplate.tsx`

Documentation:

- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/08-product/TEMPLATE_CATALOG.md`
- `docs/06-modern-template/reports/PHASE-9.7C-Premium-Template-Visual-Differentiation-Report.md`

## Visual Differentiation Summary

### Restaurant Premium

Visual direction:

- Elegant dining / premium restaurant website.
- Dark editorial visual style.
- Champagne and gold accent palette.
- Larger near full-screen hero.
- Stronger reservation-led conversion path.

Changes:

- Hero increased to a stronger first viewport experience.
- Added layered overlay, champagne accent badge, reservation card, and premium cues.
- CTA language changed to `Reserve a Table`, `Explore Signature Dishes`, and `Get Directions`.
- Signature Dishes cards now use richer spacing, badge hierarchy, and premium pricing emphasis.
- Chef Story section now includes a darker editorial feature panel.
- Ambience Gallery fallback now uses premium visual panels instead of plain placeholder cards.
- Reservation CTA section now has stronger copy and layout.

### Cafe Premium

Visual direction:

- Modern lifestyle cafe website.
- Warm cream, coffee, and espresso color palette.
- Lifestyle-focused hero.
- Layered product and visit-planning cards.

Changes:

- Hero now uses warm layered background treatment.
- Added `Today's Favorite` and `Open Today` floating cards.
- Added warm lifestyle tags under the hero copy.
- Brand Story cards now include a stronger lead story panel.
- Signature Menu cards now use cafe-pick badges and richer product hierarchy.
- Lifestyle Gallery fallback now uses coffee-space visual panels.
- Visit CTA section now has stronger cafe conversion copy.

### Corporate Executive

Visual direction:

- High-trust executive company profile.

Changes:

- Existing corporate renderer now has a dark navy executive hero.
- Added stats row for trust and scanability.
- Added consultation-ready floating panel.
- Added explicit CTA icons for consultation and phone actions.

This was kept intentionally small because `corporate_executive` already maps to an existing dedicated `corporate` renderer.

## Architecture Notes

Preserved:

- Existing template registry.
- Existing template resolver.
- Existing template keys:
  - `restaurant_premium`
  - `cafe_premium`
  - `corporate_executive`
- Existing renderer keys.
- Existing `data-template-key` smoke-test behavior.
- Existing API contract.

No template rendering was coupled to `businessType`.

## Testing Results

Validation run during implementation:

| Check | Result |
| --- | --- |
| Frontend registry tests | Passed: 25/25. |
| Frontend lint | Passed after removing unused imports. |
| Frontend production build | Passed with non-blocking Vite chunk-size warning. |
| Docker rebuild | Passed. |
| Existing smoke tests | Passed: 10/10. |
| Restaurant Premium public rendering | Passed through smoke validation. |
| Cafe Premium public rendering | Passed through smoke validation. |

## Risks

| Risk | Severity | Notes |
| --- | --- | --- |
| Premium visual taste may need product-owner tuning | Medium | Stage 9.7C intentionally improves visual differentiation, but final creative direction can still be adjusted. |
| Remote fallback images depend on external availability | Low | Uploaded tenant images still take priority; fallback panels exist for gallery sections. |
| Bundle size warning remains | Low | Vite reports a non-blocking chunk-size warning already present in the app build profile. |

## R1 Polish - Corporate Executive Mobile Hero

### Issue Found

Stage 9.7C visual validation found that `corporate_executive-mobile.png` showed a large diagonal white area in the hero background.

The issue did not cause:

- Horizontal scroll.
- Broken image.
- Blank section.
- CTA failure.
- Test failure.

However, it weakened the premium executive feel on mobile.

### Root Cause

The Corporate Executive hero background used a single diagonal desktop-oriented gradient:

```text
linear-gradient(135deg, #07111f, #0f2338 55%, #f8fafc 55%)
```

On narrow mobile viewports, the `#f8fafc` portion occupied too much of the hero and appeared as a distracting white diagonal band.

### Fix Summary

The hero background is now responsive:

- Mobile uses a full dark navy executive gradient with subtle radial highlights.
- Tablet and desktop keep the diagonal editorial treatment.
- The hero container now uses `isolate` with `overflow-hidden` to keep decorative layers contained.

### Files Modified

- `frontend/src/features/templates/CorporateTemplate.tsx`
- `docs/06-modern-template/reports/PHASE-9.7C-Premium-Template-Visual-Differentiation-Report.md`

Restaurant Premium and Cafe Premium were not modified in R1.

### Screenshot Evidence Path

Regenerated R1 evidence:

```text
docs/evidence/premium-template-visual-validation/corporate_executive/corporate_executive-desktop.png
docs/evidence/premium-template-visual-validation/corporate_executive/corporate_executive-tablet.png
docs/evidence/premium-template-visual-validation/corporate_executive/corporate_executive-mobile.png
docs/evidence/premium-template-visual-validation/corporate-executive-r1-validation-results.json
```

### R1 Test Results

| Check | Result |
| --- | --- |
| Frontend lint | Passed. |
| Frontend production build | Passed with non-blocking Vite chunk-size warning. |
| Frontend registry tests | Passed: 25/25. |
| Docker rebuild for frontend/nginx | Passed. |
| Existing smoke tests | Passed: 10/10. |
| Corporate Executive screenshot regeneration | Passed for desktop, tablet, and mobile. |
| Corporate Executive automated visual checks | Passed: no horizontal overflow, no broken image, no blank section, CTA visible/clickable, correct `data-template-key`. |

### R1 Scope Confirmation

R1 did not introduce:

- New product features.
- Backend changes.
- Prisma schema changes.
- Database migrations.
- Billing.
- Subscription.
- Entitlement enforcement.
- Marketplace.
- Catalog UI.
- Template registry changes.
- Template resolver changes.

## R2 Polish - Premium Hero Motion and Menu Photo Enhancement

### Scope

Stage 9.7C-R2 adds small visual enhancements to Premium templates only:

- `restaurant_premium`
- `cafe_premium`

Corporate Executive was not modified in R2.

### Files Modified

- `frontend/src/features/templates/RestaurantPremiumTemplate.tsx`
- `frontend/src/features/templates/CafePremiumTemplate.tsx`
- `frontend/src/styles.css`
- `smoke/saas.smoke.spec.ts`
- `docs/06-modern-template/reports/PHASE-9.7C-Premium-Template-Visual-Differentiation-Report.md`

### Hero Motion Summary

R2 adds a subtle `premium-hero-motion` treatment:

- Slow Ken Burns style zoom.
- Scale from `1` to `1.06`.
- Subtle translate movement.
- `18s` duration.
- Infinite alternate easing.
- No layout shift because the image remains inside an overflow-hidden hero/media container.

### Menu Photo Enhancement Summary

Premium menu cards now include a media area:

- If `menu.imageUrl` exists, the card uses the uploaded menu image.
- If `menu.imageUrl` is missing, the card renders a safe gradient visual fallback.
- No remote fallback image is required for menu cards.
- Media areas use object-fit cover for real images.
- Images include meaningful alt text and lazy loading.

Restaurant Premium:

- Signature Dishes now display a top media panel.
- Fallback cards use dark editorial dining visuals and badges such as `Chef Pick`, `House Favorite`, and `Popular`.

Cafe Premium:

- Signature Menu now displays a top media panel.
- Fallback menu copy was made more premium-neutral for generic tenant data.
- Fallback cards use warm premium visual panels and badges such as `House Favorite`, `Popular`, `Signature`, and `Seasonal`.

### Accessibility Notes

- Motion respects `prefers-reduced-motion: reduce`.
- Reduced-motion users receive no hero animation.
- CTA visibility and clickability remain unchanged.
- Menu media images use descriptive alt text when real `imageUrl` values exist.

### Test Results

| Check | Result |
| --- | --- |
| Frontend lint | Passed. |
| Frontend production build | Passed with non-blocking Vite chunk-size warning. |
| Frontend registry tests | Passed: 25/25. |
| Docker rebuild for frontend/nginx | Passed. |
| Existing smoke tests | Passed: 10/10. |
| Restaurant Premium screenshot regeneration | Passed for desktop, tablet, and mobile. |
| Cafe Premium screenshot regeneration | Passed for desktop, tablet, and mobile. |
| Automated visual checks | Passed: no horizontal overflow, no broken image, no blank section, CTA visible/clickable, correct `data-template-key`, hero motion present, menu media present. |

### Screenshot Evidence Paths

```text
docs/evidence/premium-template-visual-validation/restaurant_premium/restaurant_premium-desktop.png
docs/evidence/premium-template-visual-validation/restaurant_premium/restaurant_premium-tablet.png
docs/evidence/premium-template-visual-validation/restaurant_premium/restaurant_premium-mobile.png
docs/evidence/premium-template-visual-validation/cafe_premium/cafe_premium-desktop.png
docs/evidence/premium-template-visual-validation/cafe_premium/cafe_premium-tablet.png
docs/evidence/premium-template-visual-validation/cafe_premium/cafe_premium-mobile.png
docs/evidence/premium-template-visual-validation/premium-r2-validation-results.json
```

### R2 Scope Confirmation

R2 did not introduce:

- New product features outside visual enhancement.
- Backend changes.
- Prisma schema changes.
- Database migrations.
- Billing.
- Subscription.
- Entitlement enforcement.
- Marketplace.
- Catalog UI.
- Preview-before-apply.
- Template switch history.
- Template registry changes.
- Template resolver changes.

## Rollback Strategy

1. Revert visual changes in Premium renderer files.
2. Revert safe Corporate renderer visual enhancement if needed.
3. Revert any shared premium UI components if added in a future iteration.
4. Keep registry keys unchanged.
5. Keep documentation history available.

No database rollback is required because no schema, migration, or persistence change was introduced.
