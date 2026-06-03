# UMKM Website Builder SaaS - Phase 5 Frontend Implementation

## 1. Folder Structure

```text
frontend/
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  src/
    main.tsx
    styles.css
    vite-env.d.ts
    app/
      App.tsx
    components/
      layout/
        AppShell.tsx
      ui/
        Badge.tsx
        Button.tsx
        Field.tsx
        IconButton.tsx
        State.tsx
    features/
      auth/
      dashboard/
      menus/
      public-site/
      tenants/
      websites/
    lib/
      api/
      storage.ts
    pages/
    types/
```

## 2. Source Code Delivered

The frontend implementation now includes:

- React 19 + Vite + TypeScript application.
- Tailwind CSS v4 via Vite plugin.
- React Router route structure for:
  - Auth pages
  - Tenant workspace
  - Super Admin workspace
  - Public tenant site
- React Query provider and query invalidation pattern.
- Axios API client with bearer token injection and refresh-token retry.
- Auth provider using local storage session persistence.
- Role-aware app shell navigation.
- Reusable UI components for buttons, icon buttons, fields, badges, loading, error, and empty states.

## 3. UI Screens Delivered

### Auth

- Login page
- Register tenant page

### Tenant Admin / Editor

- Tenant dashboard
- Website list
- Website editor
- Website preview
- Menu and service management
- Placeholder pages for analytics, domains, and settings pending backend modules

### Super Admin

- Platform dashboard
- Tenant management table with activate, suspend, and delete actions
- Placeholder platform analytics page

### Public Website

- Public site renderer by tenant slug at `/site/:slug`
- Reusable authenticated preview renderer at `/app/websites/:websiteId/preview`
- Sections:
  - Header
  - Hero
  - About
  - Menu & Services
  - Reviews
  - Location
  - Contact

## 4. API Integration

Implemented frontend service coverage:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /tenants`
- `PATCH /tenants/:id/suspend`
- `PATCH /tenants/:id/activate`
- `DELETE /tenants/:id`
- `GET /websites`
- `GET /websites/:id`
- `PUT /websites/:id`
- `PATCH /websites/:id/publish`
- `PATCH /websites/:id/unpublish`
- `GET /menu-categories`
- `POST /menu-categories`
- `GET /menus`
- `POST /menus`
- `DELETE /menus/:id`
- `GET /public/site/:slug`

## 5. Verification

Commands run:

```text
npm install
npm run build
```

Result:

- Frontend dependencies installed successfully.
- Production build completed successfully.
- Vite dev server is running at `http://localhost:5173/`.

## 6. Notes

- Some planned pages are intentionally placeholders because their backend modules are reserved for later expansion: themes, gallery, reviews, analytics, domains, subscriptions, and uploads.
- The authenticated preview uses website detail data instead of guessing tenant slug, so Tenant Admin and Editor can preview draft/unpublished content.
- Public `/site/:slug` still maps to the published backend endpoint and requires a real tenant slug.

## Phase 5 Approval Gate

Phase 5 frontend implementation is complete. Do not proceed to Phase 6: DevOps & Infrastructure until approval is given.
