# PHASE-10B Sprint 2 - Restaurant Remediation Report

Tanggal implementasi: 2026-06-06

## Root Cause Analysis

Visual review menemukan risiko blank CTA karena action rendering belum cukup ketat.

Root causes:
- CTA action belum punya field `action` eksplisit.
- Button component hanya mengecek `href` dan `label`, belum memvalidasi action type.
- Hero CTA masih memakai contact action generic, sehingga hierarchy belum membedakan primary/secondary/tertiary.
- Menu, gallery, dan footer belum memiliki CTA validation evidence yang eksplisit.

## CTA Rendering Fixes

Implemented:
- `TemplateAction.action` is now required.
- `normalizeTemplateAction()` rejects missing action, empty label, empty href, and invalid href.
- `validateTemplateActions()` filters invalid actions before rendering.
- `TemplateButton()` returns `null` if action normalization fails.
- CTA containers render only when valid actions exist.

CTA hierarchy:
- Primary: `Chat WhatsApp`
- Secondary: `View Menu`
- Tertiary: `Get Directions`

## Icon Rendering Fixes

Implemented:
- CTA resolver provides icons for WhatsApp, phone, menu, and directions.
- `TemplateButton()` uses fallback `ArrowUpRight` if a valid action has no icon.
- Playwright audit verifies visible CTAs have at least one SVG icon.

## Hero Section Improvements

Updated Restaurant hero:
- Larger premium visual area: `min-h-[86vh]`.
- Stronger image overlay and bottom gradient.
- Restaurant badge changed to premium pill style.
- CTA group now renders the mandatory hierarchy:
  - Chat WhatsApp
  - View Menu
  - Get Directions
- Highlight card improved with stronger glassmorphism, spacing, shadow, and clearer copy.

## Before / After Screenshots

Before:
- `docs/evidence/modern-template/sprint2/restaurant/sprint2-restaurant-mobile.png`
- `docs/evidence/modern-template/sprint2/restaurant/sprint2-restaurant-tablet.png`
- `docs/evidence/modern-template/sprint2/restaurant/sprint2-restaurant-desktop.png`

After:
- `docs/evidence/modern-template/sprint2/remediation/sprint2-remediation-mobile.png`
- `docs/evidence/modern-template/sprint2/remediation/sprint2-remediation-tablet.png`
- `docs/evidence/modern-template/sprint2/remediation/sprint2-remediation-desktop.png`

## Mobile Validation

Viewport: `390x844`

Result: PASS

Validated:
- Restaurant landing page text exists.
- Primary, secondary, and tertiary hero CTAs render.
- No blank visible anchors.
- No blank visible buttons.
- All visible CTA links include SVG icons.
- No browser page errors.

## Tablet Validation

Viewport: `768x1024`

Result: PASS

Validated:
- Hero hierarchy is visible.
- Menu, gallery, contact, footer, and reservation CTAs render through validated actions.
- No blank visible anchors.
- No blank visible buttons.
- All visible CTA links include SVG icons.
- No browser page errors.

## Desktop Validation

Viewport: `1440x1100`

Result: PASS

Validated:
- Premium hero layout renders with highlight card.
- CTA hierarchy is clear.
- Demo tenant `warteg-moncer` renders restaurant template.
- No blank visible anchors.
- No blank visible buttons.
- All visible CTA links include SVG icons.
- No browser page errors.

## Demo Tenant Validation

Validated tenant:
- `warteg-moncer`

Validated CTA areas:
- Hero CTA: PASS
- Contact CTA: PASS
- Footer CTA: PASS
- Gallery CTA: PASS
- Menu CTA: PASS

Validated links:
- WhatsApp: `https://wa.me/6281210010010`
- Phone: `tel:+622175001001`
- Directions: `https://maps.google.com`
- Menu: `#services`

## Commercial Readiness Assessment

Result: PASS for Sprint 2 remediation.

The template now reads as a restaurant landing page rather than a generic generated site:
- Strong first-viewport business signal.
- Food/restaurant badge visible immediately.
- Primary conversion action is clear.
- Secondary menu action is explicit.
- Directions are lower emphasis and still accessible.
- Highlight card feels more premium and less admin-like.

## Acceptance Criteria

| Criteria | Status |
| --- | --- |
| Zero blank buttons | PASS |
| Zero empty CTA containers | PASS |
| Zero missing icons | PASS |
| CTA validation layer implemented | PASS |
| Hero section upgraded | PASS |
| CTA hierarchy improved | PASS |
| Demo tenant validation passed | PASS |
| Mobile validation passed | PASS |
| Tablet validation passed | PASS |
| Desktop validation passed | PASS |
| Commercial appearance improved | PASS |

## Hard Stop

Do not start Sprint 3 Laundry, Sprint 4 Clinic, Sprint 5 Corporate, or Sprint 6 Cafe until Restaurant Template Remediation is approved.
