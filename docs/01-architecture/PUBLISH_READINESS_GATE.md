# Publish Readiness Gate

Last updated: 2026-07-09

## Purpose

The publish readiness gate prevents owners from publishing an incomplete public website from the dashboard editor.

The gate is a product-readiness layer, not a payment or entitlement layer.

## Source Of Truth

Frontend readiness logic lives in:

- `frontend/src/features/websites/publishReadiness.ts`

The checker returns:

- `readyToPublish`
- `required`
- `recommended`
- `summary`

## Required Checks

- Business name exists.
- Business type exists.
- Template is selected.
- Public slug exists and matches the slug format.
- At least one contact method exists.
- Address exists.
- Opening hours are structured and valid.
- Public template can resolve to a renderer.
- Restaurant/cafe/food templates have at least one menu item.
- Restaurant/cafe/food menu items have names.
- Restaurant/cafe/food menu prices format safely and do not render as undefined, null, empty, or NaN.

## Recommended Checks

- Hero image or slideshow.
- Logo.
- Description.
- Gallery has at least 3 images.
- Google Maps URL.
- Social links.
- Restaurant/cafe menu has at least 3 items.
- Featured menu item.
- Menu item images.
- Menu item descriptions.

## Publish Flow

1. Website editor loads website data.
2. Readiness checker evaluates the current website payload.
3. Required items block the Publish button when incomplete.
4. Recommended items are shown as non-blocking improvements.
5. Owner can preview before publishing.
6. When ready, owner confirms publish in a dialog.
7. Existing publish endpoint sets `Website.status = PUBLISHED`.
8. Existing public route returns only published websites.

## Explicit Non-Scope

- Payment.
- Subscription.
- Entitlement.
- Marketplace.
- Hosting renewal.
- Custom domain launch.
- New Prisma schema.
- New backend publish state.
