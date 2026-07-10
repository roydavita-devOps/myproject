# Template Catalog

## Purpose

This document tracks future template catalog planning. It is not an implementation report.

## Current Decision

Stage 9.3B completed a Template Catalog Readiness Audit.

Decision:

- Template Catalog is a future product capability.
- Current work remains metadata standardization and readiness validation only.
- Template Catalog UI, template switching, and template marketplace are not implemented yet.

## Current Template Status

| Template | Status |
| --- | --- |
| Base template system | Implemented. |
| Restaurant / Warteg template | Implemented through Stage 9 Sprint 2 and final CTA fix. |
| Laundry template | Implemented through Stage 9.3. |
| Clinic template | Implemented through Stage 9.4. |
| Corporate template | Implemented through Stage 9.5. |
| Cafe template | Implemented through Stage 9.6. |
| Restaurant Premium template | Implemented through Stage 9.7 Sprint 7. |
| Cafe Premium template | Implemented through Stage 9.7 Sprint 8. |
| Premium visual differentiation | Implemented through Stage 9.7C for Restaurant Premium, Cafe Premium, and safe Corporate Executive renderer enhancement. |
| Menu item image management | Implemented through Stage 9.8A for dashboard upload/change/remove and premium public rendering. |
| Featured menu and full menu modal | Implemented through Stage 9.8B for featured Signature sections and full menu modal browsing. |
| Restaurant Premium Foundation Reference | Locked through Stage 9.8E as the first approved premium quality baseline. |
| Cafe Premium redesign | Approved through Stage 9.9 using Restaurant Premium Foundation quality standards without restaurant-specific inheritance. |
| Cafe Premium warm accent and placeholder polish | Approved through Stage 9.9A. |
| Cafe Premium Hero Display controls | Approved through Stage 9.9B as a premium template capability. |
| Cafe Premium Template Lock | Locked locally through Stage 9.9C as the second approved Premium Template. |
| Premium Template Catalog & Selection Readiness | Implemented through Stage 9.10 with Recommended, Premium, Classic, and All template sections. |

## Metadata Standard

Every future template must follow the official metadata standard documented in:

- [../01-architecture/TEMPLATE_METADATA_STANDARD.md](../01-architecture/TEMPLATE_METADATA_STANDARD.md)

Required catalog fields:

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

Current implementation note:

- Operational registry metadata exists.
- Catalog display fields such as `description`, `industry`, `category`, and `preview_image` are now represented in the frontend registry metadata contract.
- `clinic_professional` includes preview placeholder support.
- Template Catalog UI must not start until those fields are added and validated.

## Current Template Keys

| Template Key | Status | Tier | Catalog Readiness |
| --- | --- | --- | --- |
| `restaurant_classic` | Active | Standard | Partial metadata. |
| `laundry_clean` | Active | Standard | Partial metadata. |
| `clinic_professional` | Active | Standard | Catalog-ready metadata with preview placeholder. |
| `corporate_executive` | Active | Premium | Catalog-ready metadata with preview placeholder. |
| `cafe_modern` | Active | Premium | Catalog-ready metadata with preview placeholder. |
| `restaurant_premium` | Active | Premium | Catalog-ready metadata with preview placeholder. |
| `cafe_premium` | Active | Premium | Catalog-ready metadata with preview placeholder. |
| `minimal_business` | Active fallback | Standard | Partial metadata. |
| `restaurant_luxury` | Planned | Luxury | Partial metadata. |
| `cafe_minimal` | Planned | Standard | Partial metadata. |

## Catalog Principle

Recommended categories are not restrictions.

Users should be able to choose a template even if their business type differs from the recommendation.

Stage 9.10 product rule:

```text
Business Type = recommendation signal
Template = user choice
```

The catalog should show recommended templates first, but available templates remain selectable across categories.

## Stage 9.10 Selection UX

Implemented catalog sections:

- Recommended for your business.
- Premium Templates.
- Classic Templates.
- All Templates.

Template card requirements now include:

- Template name.
- Tier badge: Classic or Premium.
- Approved Premium badge for locked premium templates.
- Business category.
- Short description.
- Preview highlights.
- Recommended badge when matched to business type.
- Current template badge.
- Preview button.
- Use template button.

Template change behavior:

- Previewing a template is non-persistent.
- Applying a template requires confirmation.
- Changing template preserves business data, menu, gallery, and contact information.
- Premium templates are visible and selectable during pilot before payment enforcement.
- No payment, checkout, subscription, billing, marketplace, entitlement enforcement, hosting renewal, or purchase action is implemented.

## Preview Strategy

Future preview assets should use a stable template-key-based path.

Recommended path:

```text
frontend/public/template-previews/<template_key>.jpg
```

Rules:

- Preview assets are catalog assets, not renderer dependencies.
- Missing preview assets should block Template Catalog readiness tests.
- Preview images should represent actual template appearance, not generic decorative imagery.

## Tier Strategy

Template tiers are metadata only at this stage.

Supported tier values:

```text
standard
premium
luxury
```

Future access model:

| Plan | Template Access |
| --- | --- |
| Basic | Standard templates. |
| Pro | Standard and Premium templates. |
| Premium | Standard, Premium, Luxury, and future exclusive templates. |

No billing, entitlement, or subscription enforcement is implemented by this document.

## Future Catalog Requirements

Before implementing Template Catalog UI:

1. Extend registry metadata with catalog fields.
2. Add preview images for every active template.
3. Add metadata completeness tests.
4. Add product copy for template descriptions.
5. Confirm subscription access rules in a separate approved stage.

## Readiness Reference

Architecture audit:

- [../01-architecture/PHASE-9.3B-Template-Catalog-Readiness-Audit-Report.md](../01-architecture/PHASE-9.3B-Template-Catalog-Readiness-Audit-Report.md)

## Clinic Professional Catalog Entry

| Field | Value |
| --- | --- |
| Template key | `clinic_professional` |
| Display name | Clinic Professional |
| Description | Professional healthcare landing page designed for clinics and medical practices. |
| Industry | Healthcare |
| Category | Clinic |
| Renderer key | `clinic` |
| Status | Active |
| Preview image | `clinic-professional.jpg` |
| Tier | Standard |
| Recommended business types | `CLINIC` |

## Corporate Executive Catalog Entry

| Field | Value |
| --- | --- |
| Template key | `corporate_executive` |
| Display name | Corporate Executive |
| Description | Executive business template for corporate, professional service, and consulting websites. |
| Industry | Business Services |
| Category | Corporate |
| Renderer key | `corporate` |
| Status | Active |
| Preview image | `corporate-executive.jpg` |
| Tier | Premium |
| Recommended business types | `CLINIC`, `LOCAL_SERVICE`, `RETAIL` |

## Cafe Modern Catalog Entry

| Field | Value |
| --- | --- |
| Template key | `cafe_modern` |
| Display name | Cafe Modern |
| Description | Modern cafe template for lifestyle-focused cafes and coffee shops. |
| Industry | Food & Beverage |
| Category | Cafe |
| Renderer key | `cafe` |
| Status | Active |
| Preview image | `cafe-modern.jpg` |
| Tier | Premium |
| Recommended business types | `CAFE` |

## Restaurant Premium Catalog Entry

| Field | Value |
| --- | --- |
| Template key | `restaurant_premium` |
| Display name | Restaurant Premium |
| Description | Premium restaurant landing page with chef story, signature dishes, and reservation-focused conversion. |
| Industry | Food & Beverage |
| Category | Restaurant |
| Renderer key | `restaurant_premium` |
| Status | Active |
| Preview image | `restaurant-premium.jpg` |
| Tier | Premium |
| Recommended business types | `RESTAURANT`, `WARTEG`, `CAFE` |

### Restaurant Classic vs Restaurant Premium

| Area | Restaurant Classic | Restaurant Premium |
| --- | --- | --- |
| Primary intent | Fast menu, location, and WhatsApp conversion. | Stronger dining story, signature menu, and reservation conversion. |
| Story depth | Basic restaurant profile and kitchen commitment. | Chef Story and premium trust cues. |
| Visual style | Functional restaurant landing page. | Dark editorial dining experience with champagne/gold accent, layered hero, and premium reservation card. |
| Menu presentation | Featured menu and popular dishes. | Signature Dishes with curated ranking badges, stronger spacing, and premium pricing hierarchy. |
| CTA focus | Chat WhatsApp, View Menu, Get Directions. | Reserve a Table, Explore Signature Dishes, Get Directions. |
| Tier | Standard. | Premium metadata only. |

### Restaurant Premium Foundation Lock

Stage 9.8E locks `restaurant_premium` as the first Premium Foundation Reference.

It defines the current quality bar for:

- premium layout quality,
- semantic premium color system,
- purposeful CTA treatment,
- editorial typography,
- image-safe hero behavior,
- premium hero slideshow,
- gallery UX,
- full menu modal browsing,
- menu item detail readability,
- price and currency formatting,
- opening hours display,
- mobile compactness,
- public customer-facing copy.

This is a reference standard, not a forced inheritance model. Future premium templates should reuse principles, tokens, utilities, and patterns where appropriate, while keeping their own industry-specific experience.

Future templates must not blindly copy:

- restaurant-specific copy,
- reservation-first language,
- `Reserve a Table`,
- `Signature Dishes`,
- `Full Restaurant Menu`,
- `Restaurant Story`,
- `Dishes Worth the Visit`,
- `Visit & Reservation`,
- restaurant menu assumptions,
- restaurant ambience/gallery tone.

## Cafe Premium Catalog Entry

| Field | Value |
| --- | --- |
| Template key | `cafe_premium` |
| Display name | Cafe Premium |
| Description | Premium cafe template with brand story, signature menu, visit planning, and contact-focused conversion. |
| Industry | Food & Beverage |
| Category | Cafe |
| Renderer key | `cafe_premium` |
| Status | Active |
| Preview image | `cafe-premium.jpg` |
| Tier | Premium |
| Recommended business types | `CAFE` |

Stage 9.9 implements Cafe Premium Redesign Using Restaurant Premium Foundation. Cafe Premium uses the locked foundation principles while introducing cafe-specific language, mood, content hierarchy, coffee/product showcase, pastry support, ambience, visit planning, and compact mobile treatment.

### Cafe Premium Template Lock

Stage 9.9C locks `cafe_premium` as the second approved Premium Template after `restaurant_premium`.

Cafe Premium approved principles:

- Modern specialty cafe experience.
- Warm, editorial, cozy, premium, and commercially sellable mood.
- Menu-first flow, not WhatsApp-first.
- Cafe-specific copy and no restaurant-only language.
- Premium Hero Display support with Static image and Rotating images modes.
- Clear coffee/product/menu showcase.
- Gallery treated as ambience/corners, not a generic image grid.
- Warm intentional placeholders for missing images.
- Formatted opening hours and formatted price/currency display.
- Unavailable CTAs hidden instead of rendered broken.
- Compact mobile behavior.

Approved Cafe Premium sections:

1. Premium cafe hero.
2. Signature Brews / Fresh From the Bar.
3. Coffee & Bites / Morning Favorites.
4. Cafe Story / Crafted for Slow Mornings.
5. Ambience & Corners / Slow Corners.
6. Visit the Cafe.
7. Footer.
8. Cafe Menu modal with item detail.

Approved cafe language examples:

- Specialty coffee corner.
- Signature Brews.
- Fresh From the Bar.
- Coffee & Bites.
- Morning Favorites.
- Crafted for Slow Mornings.
- Cafe Story.
- Ambience & Corners.
- Slow Corners.
- Visit the Cafe.
- Find Your Table.
- Today's Pour.
- Pastry Pairings.
- Open Cafe Menu.
- Explore Menu.
- Get Directions.
- Call Cafe.
- Message Cafe.

Do not use restaurant-only terms in Cafe Premium:

- Reserve a Table.
- Signature Dishes.
- Full Restaurant Menu.
- Restaurant Story.
- Visit & Reservation.
- Dishes Worth the Visit.
- Chef.
- Fine dining.
- Reservation-first language.

Future catalog and marketplace work should present Restaurant Premium and Cafe Premium as locked/approved premium templates while keeping Business Type as recommendation and Template as user choice.

Stage 9.9 Cafe Premium direction:

- Premium cafe hero with image-safe overlay and existing hero slideshow compatibility.
- Signature Brews and Coffee & Bites sections.
- Cafe Story section with coffee craft, pastry pairing, and neighborhood rhythm.
- Ambience & Corners gallery treatment.
- Visit the Cafe contact section with valid directions, phone, and WhatsApp actions only when data exists.
- Premium Full Menu modal with Cafe Menu / Coffee & Bites language and no Chat WhatsApp CTA inside the modal.
- Cafe-friendly presets: `roasted_cream`, `espresso_linen`, `matcha_cream`, `caramel_noir`, and `terracotta_milk`.

### Cafe Modern vs Cafe Premium

| Area | Cafe Modern | Cafe Premium |
| --- | --- | --- |
| Primary intent | Lifestyle-focused cafe presentation. | Stronger brand story, signature menu, and premium visit planning. |
| Story depth | Experience-focused cafe presence. | Brand Story with specialty and atmosphere positioning. |
| Visual style | Modern cafe website. | Warm cream, coffee, and espresso lifestyle experience with layered hero cards and visit planning cues. |
| Menu presentation | Featured menu and signature drinks. | Signature Brews and Coffee & Bites with premium product framing, category labels, featured badges, and full menu detail browsing. |
| CTA focus | Chat Cafe, View Menu, Get Directions. | Explore Menu, Get Directions, Call Cafe, and Message Cafe only when data exists. |
| Tier | Premium metadata. | Premium metadata. |

## Stage 9.7C Premium Differentiation Notes

Stage 9.7C improves visual quality only.

Implemented:

- Restaurant Premium: near full-screen dark editorial hero, champagne accent, floating reservation card, stronger signature dishes, chef story, ambience gallery, and reservation CTA.
- Cafe Premium: warm lifestyle hero, layered favorite/open cards, brand story, signature menu cards, lifestyle gallery, and visit CTA.
- Corporate Executive: safe enhancement to the existing dedicated corporate renderer with executive navy hero, stats row, and consultation card.

Not implemented:

- Template Catalog UI.
- Marketplace.
- Billing or subscription enforcement.
- Entitlement restrictions.
- Preview-before-apply.
- Template switch history.
- Prisma schema changes or database migrations.

## Stage 9.8A Menu Image Notes

Stage 9.8A adds content management support for menu item photos.

Implemented:

- Dashboard menu editor supports upload, preview, change, and remove for menu item images.
- Existing upload policy is reused with `uploads/menu`.
- Persisted menu field is `menu.imageUrl`.
- Restaurant Premium and Cafe Premium continue to render uploaded menu photos when available.
- Public premium templates continue to render fallback visuals when `menu.imageUrl` is missing.

Not implemented:

- Template Catalog UI.
- Marketplace.
- Billing or subscription enforcement.
- Entitlement restrictions.
- Preview-before-apply.
- Template switch history.
- Prisma schema changes or database migrations.

## Stage 9.8B Featured Menu Notes

Stage 9.8B separates highlighted premium menu items from the complete menu list.

Implemented:

- Dashboard menu editor supports a `Featured item` flag.
- Persisted menu field is `menu.isFeatured`.
- Restaurant Premium and Cafe Premium Signature sections use featured items when configured.
- If no real item is featured, Signature sections fall back to the first real menu items.
- If no real menu items exist, premium templates use existing fallback sample menu items.
- `View Full Menu` opens a modal showing all menu items.
- Full menu modal groups items by category and includes an `All` tab.
- Mobile modal behaves as a full-height sheet.

Not implemented:

- Template Catalog UI.
- Marketplace.
- Billing or subscription enforcement.
- Entitlement restrictions.
- Preview-before-apply.
- Template switch history.

## Stage 9.11 Publish Readiness Notes

Stage 9.11 adds website launch readiness without changing template ownership, payment, or marketplace access.

Implemented:

- Website editor displays a publish readiness panel for the selected website.
- Required checklist blocks publish until core public-site data is complete.
- Recommended checklist shows launch polish opportunities without blocking publish.
- Restaurant and Cafe templates require at least one valid menu item with visible name and formatted price before publish.
- Restaurant Premium and Cafe Premium remain publishable before subscription/payment enforcement.
- Preview-before-publish, publish confirmation, public URL display, and unpublish state use existing routes and status.

Not implemented:

- Template marketplace.
- Billing, checkout, subscription, entitlement, or access restriction.
- Hosting renewal or custom domain launch flow.
- New template registry keys.
- New backend schema or Prisma migration.

## Stage 9.11A Catalog Simplification Notes

Stage 9.11A simplifies template selection into one primary recommendation and a smaller Free/Premium browsing model.

Implemented:

- Main template page shows Restaurant Premium as the only primary recommended card.
- `View More Templates` opens the rest of the catalog in a modal.
- Modal sections use only Free Templates and Premium Templates.
- Cafe Premium remains available under Premium Templates.
- Free templates remain available under Free Templates.
- Luxury and planned/unfinished templates are hidden/deferred from the user-facing catalog.
- Template preview, confirmation before change, persistence, public rendering, and Publish Readiness compatibility are preserved.

Not implemented:

- Payment.
- Checkout.
- Subscription.
- Entitlement enforcement.
- Marketplace.
- Hosting renewal.
- Luxury template work.
- Backend or database changes.

## Stage 9.11B Free Template Naming Notes

Stage 9.11B cleans up user-facing Free template names while preserving internal template keys.

User-facing mapping:

| Internal key | User-facing name |
| --- | --- |
| `restaurant_classic` | Restaurant Free |
| `laundry_clean` | Laundry Free |
| `cafe_modern` | Cafe Free |
| `clinic_professional` | Clinic Free |
| `corporate_executive` | Corporate Free |
| `minimal_business` | Business Free |
| `restaurant_premium` | Restaurant Premium |
| `cafe_premium` | Cafe Premium |

Rules:

- Internal keys remain unchanged.
- Free templates should feel simple but clean.
- Premium templates remain richer, more visual, and more commercial.
- Luxury remains hidden/deferred.
- No payment, marketplace, entitlement, backend, Prisma, or database change is included.
