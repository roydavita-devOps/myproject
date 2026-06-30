# PHASE 9.8D-R5 - Image Delete And Legacy Upload Cleanup Report

Date: 2026-06-30

Status: Implemented and locally validated. Awaiting product approval.

## 1. Executive Summary

Stage 9.8D-R5 fixes image removal reliability across dashboard, backend, database references, storage cleanup, and public rendering.

Resolved flows:

- Logo image removal.
- Hero image removal.
- Gallery image removal.
- Menu item image removal.
- Legacy local `/uploads` image reference cleanup.
- Supabase variant cleanup tolerance.

No template redesign, upload pipeline rebuild, Prisma migration, payment, marketplace, or media library work was introduced.

## 2. Scope

Implemented:

- Direct menu image delete endpoint.
- Menu dashboard delete button now calls backend and persists removal immediately.
- Delete feedback message in `ImageUpload`.
- Storage cleanup failures are logged and do not block database reference cleanup.
- Legacy local missing files can be removed from database references.
- Evidence script and screenshot evidence.

Not implemented:

- Advanced media library.
- Image editor.
- Bulk media manager.
- New templates.
- Payment/subscription/marketplace.

## 3. Delete Flow Audit

| Area | Finding Before R5 |
| --- | --- |
| ImageUpload component | Delete button called `onDelete`, but menu item usage only changed local form state. |
| Menu image delete | No direct backend endpoint existed. User needed to click Save after local state change, so delete appeared broken. |
| Gallery image delete | Backend archived gallery record and attempted upload delete. |
| Hero image delete | Backend cleared theme field after storage delete attempt. |
| Logo image delete | Backend cleared theme field after storage delete attempt. |
| Upload delete service | Deleted known variants, but non-NotFound storage failures could block caller flow. |
| Supabase delete | Removed object keys when inferred; failure bubbled through the caller path. |
| Local delete | Missing files returned NotFound. Website/gallery callers tolerated this. |
| Database cleanup | Menu image reference did not have a direct remove flow. |

## 4. Root Cause

Primary root cause:

```text
Menu image delete was only a local form state change.
```

The dashboard showed a delete button, but for existing menu items it did not call a dedicated backend delete endpoint. The menu item image reference remained in the database unless the user saved the form afterward.

Secondary root cause:

```text
Storage cleanup errors could block database cleanup for Supabase delete attempts.
```

For removal UX, database references must be cleared even if old physical files are already missing or Supabase cleanup partially fails.

## 5. Frontend Fixes

Implemented:

- Added `menusApi.deleteMenuImage(id)`.
- Menu item image delete now calls `DELETE /menus/:id/image`.
- Menu item remains active after image removal.
- `ImageUpload` now shows success feedback:
  - `Gambar berhasil diupload.`
  - `Gambar berhasil dihapus.`
- Preview clears after successful removal.
- User can upload a replacement image after delete.

## 6. Backend Fixes

Implemented:

- Added `DELETE /menus/:id/image`.
- Added `MenusService.deleteMenuImage()`.
- `deleteMenuImage()` deletes storage objects when possible and clears `Menu.imageUrl`.
- Menu item is not deleted or archived.
- `MenusModule` imports `UploadsModule` so menu image cleanup can use the existing upload cleanup service.

Existing flows preserved:

- `DELETE /websites/:id/theme-assets/logo`
- `DELETE /websites/:id/theme-assets/hero`
- `DELETE /websites/:id/gallery/:galleryId`

## 7. Supabase Delete Behavior

Supabase public URLs are parsed to infer the asset folder.

Known variants attempted:

- `thumb.webp`
- `medium.webp`
- `large.webp`
- `original.jpg`
- `original.png`
- `original.webp`

If cleanup partially fails:

- A warning is logged.
- Database cleanup continues.
- User flow is not blocked.

## 8. Legacy Local Upload Cleanup

Legacy local URLs such as:

```text
/uploads/legacy-menu.webp
```

can now be removed as database references even if the file no longer exists.

Important behavior:

- Physical file absence does not block image removal.
- Public site stops rendering the old image reference.
- Parent data remains intact.

## 9. Database Reference Cleanup

| Asset | Cleanup |
| --- | --- |
| logo | Clears `Theme.logoUrl`. |
| hero | Clears `Theme.heroImageUrl`. |
| menu item image | Clears `Menu.imageUrl`. |
| gallery image | Archives active gallery record so public rendering excludes it. |

No parent business records are deleted.

## 10. Public Rendering Fallback

After deletion:

- Restaurant Premium no longer renders deleted menu image URLs.
- Full menu modal uses existing fallback media behavior.
- Gallery no longer includes archived gallery records.
- Dashboard previews clear after deletion.

## 11. Files Modified

- `backend/src/modules/uploads/uploads.service.ts`
- `backend/src/modules/uploads/uploads.service.spec.ts`
- `backend/src/modules/menus/menus.module.ts`
- `backend/src/modules/menus/menus.controller.ts`
- `backend/src/modules/menus/menus.service.ts`
- `backend/src/modules/menus/menus.service.spec.ts`
- `frontend/src/components/ui/ImageUpload.tsx`
- `frontend/src/features/menus/menus.api.ts`
- `frontend/src/features/menus/MenuManagementPage.tsx`
- `scripts/generate-image-delete-remediation-evidence.mjs`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/01-architecture/ASSET_STORAGE_ARCHITECTURE.md`

## 12. Testing Results

Passed:

- `npm --prefix backend run test`
- `npm --prefix backend run lint`
- `npm --prefix backend run build`
- `npm --prefix frontend run lint`
- `npm --prefix frontend run test`
- `npm --prefix frontend run build`
- `npm exec prisma validate -- --schema prisma/schema.prisma`
- `docker compose up -d --build`
- `Invoke-WebRequest http://127.0.0.1/health`
- `Invoke-WebRequest http://127.0.0.1/health/ready`
- `npm run smoke-test`
- `node scripts/generate-image-delete-remediation-evidence.mjs`

Results:

- Backend tests: 49 passed.
- Frontend tests: 41 passed.
- Smoke tests: 10 passed.

Notes:

- Supabase partial cleanup behavior is covered by mocked unit tests.
- Vite chunk-size advisory warning remains non-blocking.

## 13. Evidence Locations

Evidence folder:

```text
docs/evidence/image-delete-remediation/
```

Evidence files:

- `menu-image-delete-before.png`
- `menu-image-delete-after.png`
- `gallery-image-delete-before.png`
- `gallery-image-delete-after.png`
- `legacy-local-image-remove.png`
- `restaurant-premium-public-after-image-delete.png`
- `supabase-storage-after-delete.png`
- `image-delete-validation-results.json`

## 14. Risks

- Supabase storage cleanup can still leave orphaned objects if Supabase remove calls fail repeatedly. This is logged and should be monitored operationally.
- Legacy local files that no longer exist cannot be physically deleted, but their database references can be cleared.
- If future private media is introduced, public bucket delete behavior must be re-evaluated with signed URL policy.

## 15. Rollback Strategy

Code rollback:

1. Revert R5 commit.
2. Menu image deletion returns to update/save behavior.
3. Existing database records remain valid.

Operational rollback:

1. No Prisma rollback required.
2. Supabase/local stored objects remain accessible by URL unless separately deleted.
3. If rollback is needed after users delete images, deleted database references should not be restored unless explicitly recovered from backup.

## 16. Go / No-Go Decision

Go for approval.

Production note:

Go for production only if Supabase Storage R4 environment remains configured and delete cleanup warnings are monitored in backend logs.
