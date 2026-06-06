# PHASE-10B Sprint 2 Final Fix - Restaurant CTA Visibility Report

## 1. Root Cause

The middle hero CTA was not missing data. Playwright DOM inspection confirmed:

- `action`: `menu`
- `label`: `View Menu`
- `href`: `#services`
- `icon`: one rendered SVG

The actual defect was visual: the secondary CTA rendered white text on a white background.

Before the final fix, computed style for the `View Menu` CTA was:

| Property | Value |
| --- | --- |
| Text | `View Menu` |
| Color | `rgb(255, 255, 255)` |
| Background | `rgb(255, 255, 255)` |

This made the CTA look like an empty white button even though the label and icon existed in the DOM.

During the audit, a second weakness was also found: `TemplateButton` normalized every incoming CTA as `action: external`, which discarded the original action type during final render validation. This did not remove the label, but it weakened action-level validation and made Playwright checks less precise.

## 2. Files Modified

- `frontend/src/features/templates/templateActions.ts`
- `frontend/src/features/templates/TemplateComponents.tsx`
- `frontend/src/features/templates/RestaurantTemplate.tsx`
- `smoke/saas.smoke.spec.ts`
- `docs/06-modern-template/reports/PHASE-10B-Sprint2-FinalFix-Report.md`
- `docs/evidence/modern-template/sprint2/finalfix/sprint2-finalfix-mobile.png`
- `docs/evidence/modern-template/sprint2/finalfix/sprint2-finalfix-tablet.png`
- `docs/evidence/modern-template/sprint2/finalfix/sprint2-finalfix-desktop.png`

## 3. CTA Fix Details

- Preserved the original CTA `action` when rendering `TemplateButton`.
- Added action-aware href validation:
  - WhatsApp must use `https://wa.me/`.
  - Phone must use `tel:+`.
  - Menu must use a non-empty anchor href.
  - Directions must use HTTP or HTTPS.
- Ensured normalized CTAs always have:
  - `action`
  - `label`
  - `href`
  - `icon`
- Prevented invalid CTA wrappers from rendering empty containers in gallery and featured menu CTA slots.
- Fixed secondary CTA visibility by applying a scoped dark text color to secondary buttons.

Final computed style for the middle hero CTA:

| Property | Value |
| --- | --- |
| Text | `View Menu` |
| Color | `rgb(15, 23, 42)` |
| Background | `rgb(255, 255, 255)` |

## 4. Playwright Test Improvements

Updated `smoke/saas.smoke.spec.ts` with a dedicated `warteg-moncer` restaurant CTA validation.

The test now verifies:

- `Chat WhatsApp` exists and is visible.
- `View Menu` exists and is visible.
- `Get Directions` exists and is visible.
- Every rendered template CTA has non-empty text.
- Every rendered template CTA has exactly one SVG icon.
- Every rendered template CTA has a non-empty href.
- Contact CTA group renders.
- Footer CTA group renders.
- Validation runs on mobile, tablet, and desktop viewports.
- CI smoke validation creates and publishes `warteg-moncer` through existing API endpoints when the ephemeral CI database does not already contain the demo tenant.

## 5. Mobile Screenshot

`docs/evidence/modern-template/sprint2/finalfix/sprint2-finalfix-mobile.png`

## 6. Tablet Screenshot

`docs/evidence/modern-template/sprint2/finalfix/sprint2-finalfix-tablet.png`

## 7. Desktop Screenshot

`docs/evidence/modern-template/sprint2/finalfix/sprint2-finalfix-desktop.png`

## 8. Validation Results

| Check | Result |
| --- | --- |
| Frontend build | Passed |
| Frontend lint | Passed |
| Docker rebuild | Passed |
| Playwright targeted test | Passed |
| Mobile CTA validation | Passed |
| Tablet CTA validation | Passed |
| Desktop CTA validation | Passed |
| Demo tenant `warteg-moncer` validation | Passed |
| Hero CTA group validation | Passed |
| Contact CTA group validation | Passed |
| Footer CTA group validation | Passed |
| Blank CTA buttons | None found |

Commands executed:

```powershell
npm run build
npm run lint
docker compose up -d --build
npx playwright test --config=playwright.config.ts -g "warteg-moncer restaurant CTA"
```

## Final Decision

Stage 9 Sprint 2 Final Fix is complete.

Hard stop remains active before Sprint 3 until approval is given.
