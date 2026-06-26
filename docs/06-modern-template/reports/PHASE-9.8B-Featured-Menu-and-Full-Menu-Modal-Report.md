# Stage 9.8B - Featured Menu and Full Menu Modal Report

## Scope

Stage 9.8B separates premium highlighted menu items from the full regular menu.

Implemented:

- Dashboard `Featured item` toggle for new and existing menu items.
- Persisted `isFeatured` flag on menu items.
- Restaurant Premium Signature Dishes uses featured items when available.
- Cafe Premium Signature Menu uses featured items when available.
- Full Menu modal for all premium menu items.
- Full Menu modal category tabs with `All`.
- Mobile modal behavior as a full-height sheet.
- Safe fallback behavior when no featured item exists.
- Safe fallback behavior when no real menu item exists.

## Out Of Scope

Not implemented:

- Marketplace.
- Billing.
- Subscription.
- Entitlement.
- Template Catalog UI.
- Template comparison.
- Preview-before-apply.
- Template switch history.
- Authentication or tenant logic changes.

## Files Modified

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260626112000_add_menu_is_featured/migration.sql`
- `backend/src/modules/menus/dto/create-menu.dto.ts`
- `backend/src/modules/menus/dto/update-menu.dto.ts`
- `backend/src/modules/menus/menus.service.ts`
- `frontend/src/types/api.ts`
- `frontend/src/features/menus/menus.api.ts`
- `frontend/src/features/menus/MenuManagementPage.tsx`
- `frontend/src/features/templates/PremiumFullMenuModal.tsx`
- `frontend/src/features/templates/RestaurantPremiumTemplate.tsx`
- `frontend/src/features/templates/CafePremiumTemplate.tsx`
- `smoke/saas.smoke.spec.ts`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/08-product/TEMPLATE_CATALOG.md`

## Data Model Notes

Menu items are stored in a normalized Prisma `Menu` table, not flexible JSON.

Therefore, Stage 9.8B required a minimal Prisma schema change:

```text
isFeatured Boolean @default(false) @map("is_featured")
```

Migration added:

```text
backend/prisma/migrations/20260626112000_add_menu_is_featured/migration.sql
```

Existing menu items default to `false`.

## Dashboard UI Summary

The Menu & Services dashboard now supports:

- `Featured item` checkbox in the new item form.
- `Featured item` checkbox on existing item edit controls.
- Status helper text showing whether an item appears in premium Signature sections or only in the Full Menu modal.
- Existing image, category, price, name, and description behavior remains intact.

## Public Signature Section Behavior

Restaurant Premium:

- Signature Dishes shows `isFeatured === true` menu items.
- If no real item is featured, it falls back to the first 3 real menu items.
- If no real menu exists, it uses fallback sample dishes.

Cafe Premium:

- Signature Menu shows `isFeatured === true` menu items.
- If no real item is featured, it falls back to the first 4 real menu items.
- If no real menu exists, it uses fallback sample cafe menu items.

Normal non-featured items do not appear in Signature sections while featured items exist.

## Full Menu Modal Behavior

The premium modal:

- Opens from `View Full Menu`.
- Shows all menu items.
- Groups by category when categories exist.
- Includes an `All` tab.
- Shows image thumbnail or safe fallback visual.
- Shows name, description, price, category label, and Featured badge where relevant.
- Includes WhatsApp CTA when available.
- Closes via close button, Escape key, or backdrop click.
- Locks body scroll while open.
- Uses a mobile full-height sheet layout.

## Accessibility Notes

- Modal uses `role="dialog"` and `aria-modal="true"`.
- Close button has `aria-label="Close full menu"`.
- Focus moves to the close button when the modal opens.
- Escape key closes the modal.
- Basic Tab focus wrapping is implemented inside the modal.

## Test Results

Passed:

- `frontend npm run lint`
- `frontend npm run build`
- `frontend npm run test`
- `backend npm run lint`
- `backend npm run build`
- `backend npm run test -- --runInBand`
- `backend npm run prisma:generate`
- Local Prisma migrate deploy with Docker Postgres credentials.
- `docker compose up -d --build`
- Docker health check `GET /health`
- Docker Prisma migrate status
- `npm run smoke-test`

Known warning:

- Vite still reports the existing chunk-size warning above 500 kB. Build succeeds.

## Screenshot Evidence Paths

- `docs/evidence/featured-menu-full-menu-modal/dashboard-featured-toggle-form.png`
- `docs/evidence/featured-menu-full-menu-modal/dashboard-existing-featured-status.png`
- `docs/evidence/featured-menu-full-menu-modal/public-signature-featured-only.png`
- `docs/evidence/featured-menu-full-menu-modal/full-menu-modal-all-items.png`
- `docs/evidence/featured-menu-full-menu-modal/full-menu-modal-category-tabs.png`
- `docs/evidence/featured-menu-full-menu-modal/mobile-full-menu-modal.png`
- `docs/evidence/featured-menu-full-menu-modal/public-no-featured-fallback-highlights.png`
- `docs/evidence/featured-menu-full-menu-modal/stage-9.8b-validation-results.json`

## Risks

- The new `is_featured` column requires production migration deployment before backend code that writes `isFeatured` is used.
- Full menu modal increases frontend bundle size slightly.
- Existing menu items default to non-featured; tenants may need to mark desired highlights after deployment.

## Rollback Strategy

To rollback:

1. Revert dashboard featured toggle UI.
2. Revert premium templates to slice-first menu behavior.
3. Remove `PremiumFullMenuModal.tsx` usage.
4. Revert DTO/service/frontend API `isFeatured` fields.
5. If needed, add a database rollback migration to drop `menus.is_featured`.

## Prisma Confirmation

Prisma schema migration was required because menu items are stored in a normalized table.

Migration file:

```text
backend/prisma/migrations/20260626112000_add_menu_is_featured/migration.sql
```

## Confirmation

Stage 9.8B did not modify:

- Template registry.
- Template resolver.
- Template keys.
- Marketplace.
- Billing.
- Subscription.
- Entitlement.
- Template Catalog UI.
- Preview-before-apply.
- Template switch history.
