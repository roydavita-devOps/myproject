# Stage 9.8A - Menu Item Image Management Report

## Scope

Stage 9.8A adds dashboard support for menu item photos.

Implemented capabilities:

- Add a photo while creating a new menu item.
- Preview uploaded menu photo before saving the new item.
- Show existing menu item image preview.
- Change an existing menu item image.
- Remove an existing menu item image.
- Persist `imageUrl` with the menu item.
- Confirm Restaurant Premium and Cafe Premium render `menu.imageUrl`.
- Confirm premium templates keep safe fallback visuals when `imageUrl` is removed.

## Out Of Scope

Not implemented in this stage:

- Marketplace.
- Billing.
- Subscription.
- Entitlement.
- Template Catalog UI.
- Template comparison.
- Preview-before-apply.
- Template switch history.
- New storage architecture.
- Image cropping/editor.
- Bulk image upload.

## Files Modified

- `frontend/src/features/menus/MenuManagementPage.tsx`
- `frontend/src/features/menus/menus.api.ts`
- `frontend/src/features/uploads/uploads.api.ts`
- `backend/src/modules/menus/dto/update-menu.dto.ts`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/08-product/TEMPLATE_CATALOG.md`
- `docs/06-modern-template/reports/PHASE-9.8A-Menu-Item-Image-Management-Report.md`

## Data Model Notes

`imageUrl` already existed in persistence:

- Prisma `Menu.imageUrl`
- Backend create menu DTO
- Backend update menu DTO
- Frontend `MenuItem` type
- Premium public template rendering types

No Prisma schema change was required.

No migration was required.

The only backend adjustment was allowing `imageUrl: null` in `UpdateMenuDto` so removing a menu photo persists as a proper nullable value instead of an empty string.

## Upload / Media Integration Notes

Stage 9.8A reuses the existing upload system.

Upload endpoint used:

```text
POST /api/v1/uploads/menu
```

Accepted image policy remains the existing project policy:

```text
JPG, PNG, WEBP up to 4MB
```

The dashboard stores only the returned uploaded asset URL in `Menu.imageUrl`.

No base64 image persistence was introduced.

## Dashboard UI Summary

The Menu & Services dashboard now includes:

- Compact image upload/preview block in the New Item form.
- Upload/change/remove controls for existing menu items.
- Current image preview for menu items with `imageUrl`.
- Save changes action for existing item text, category, price, description, and image URL.
- Safe no-photo helper state explaining premium fallback behavior.

Existing menu fields continue to work:

- Name
- Category
- Price
- Description

Existing category creation remains unchanged.

## Public Rendering Summary

Restaurant Premium and Cafe Premium already supported `menu.imageUrl`.

Stage 9.8A validates that:

- Uploaded menu images render publicly.
- Changed menu images persist and render publicly.
- Removed images become `null`.
- Missing `imageUrl` renders the existing safe fallback visual.
- No broken image appears in validated public premium flows.

No Restaurant Premium or Cafe Premium renderer change was required.

## Screenshot Evidence Paths

- `docs/evidence/menu-item-image-management/dashboard-new-menu-form.png`
- `docs/evidence/menu-item-image-management/dashboard-image-preview-after-upload.png`
- `docs/evidence/menu-item-image-management/dashboard-existing-item-thumbnail.png`
- `docs/evidence/menu-item-image-management/public-restaurant-premium-menu-image.png`
- `docs/evidence/menu-item-image-management/public-cafe-premium-menu-image.png`
- `docs/evidence/menu-item-image-management/public-fallback-after-image-removal.png`
- `docs/evidence/menu-item-image-management/stage-9.8a-validation-results.json`

## Test Results

Passed:

- `frontend npm run lint`
- `frontend npm run build`
- `frontend npm run test`
- `backend npm run lint`
- `backend npm run test -- --runInBand`
- `docker compose up -d --build`
- `npm run smoke-test`
- Local health check: `GET /health`
- Manual Playwright evidence generation for add, preview, existing thumbnail, public restaurant premium image, public cafe premium image, and fallback after removal.

Known warning:

- Frontend production build still reports the existing Vite chunk-size warning for a bundle over 500 kB. This is not introduced by Stage 9.8A and does not fail the build.

## Risks

- Uploading an image before saving a brand-new item can create an uploaded asset even if the user abandons the form. This matches the current immediate-upload behavior used by existing branding/gallery upload controls.
- Physical deletion of replaced menu images is not implemented in this stage. The menu item URL is removed or changed, while storage cleanup can be handled in a future media lifecycle stage if needed.

## Rollback Strategy

To rollback Stage 9.8A:

1. Revert `MenuManagementPage.tsx` to the previous list/add/delete-only editor.
2. Remove `updateMenu` from the frontend menu API client if no longer used.
3. Remove `menu` from the frontend upload asset type if menu upload UI is removed.
4. Revert `UpdateMenuDto.imageUrl` type back to string-only if null removal is not desired.
5. Keep Prisma unchanged because no schema migration was introduced.

## Confirmation

Stage 9.8A did not introduce:

- Marketplace.
- Billing.
- Subscription.
- Entitlement.
- Template Catalog UI.
- Template comparison.
- Preview-before-apply.
- Template switch history.
- Template registry changes.
- Template resolver changes.
- Prisma schema changes.
- Database migrations.
