# UMKM Website Builder SaaS - Phase 4 Frontend Design

## 1. Frontend Architecture

The frontend is a React 19, Vite, TypeScript, Tailwind CSS application that serves two product surfaces from one codebase:

- Admin SaaS App: authenticated workspace for Super Admin, Tenant Admin, and Editor.
- Public Website Renderer: public tenant website experience resolved by custom domain, subdomain, or slug.

```text
frontend/
  src/
    app/
      App.tsx
      providers/
      routes/
    assets/
    components/
      ui/
      layout/
      forms/
      website-preview/
    features/
      auth/
      dashboard/
      tenants/
      websites/
      themes/
      menus/
      gallery/
      reviews/
      analytics/
      domains/
      public-site/
    hooks/
    lib/
      api/
      auth/
      query/
      theme/
      validation/
    pages/
    stores/
    types/
```

### Architectural Principles

- Keep route-level pages thin; business logic lives in feature hooks and API services.
- Use React Query for server state: auth profile, tenant data, websites, menus, gallery, reviews, analytics.
- Use lightweight local state for UI-only concerns: sidebar state, theme panel tabs, preview viewport.
- Centralize Axios token handling and refresh-token retry.
- Keep tenant website rendering data-driven so each business type uses templates rather than hardcoded pages.
- Use the same `PublicSiteRenderer` for custom domains and preview mode, but preview can render draft data.

### UI Direction

The admin app should feel like an operational SaaS dashboard for repeated use:

- Dense but readable layouts.
- Quiet neutral surfaces with restrained accent colors.
- Left navigation on desktop, bottom or drawer navigation on mobile.
- Tables for operational lists.
- Forms with clear sections for business profile, theme, content, and publishing.
- Cards only for repeated records and focused panels, not every page section.

The public tenant websites should feel professional and business-specific:

- Warteg/restaurant/cafe templates emphasize hero image, menu, location, WhatsApp CTA.
- Laundry template emphasizes services, pricing, pickup service, FAQ.
- Clinic template emphasizes doctors, services, schedule, contact.
- Workshop template emphasizes services, pricing, reviews, contact.

---

## 2. App Providers

```text
AppProviders
  |
  +-- BrowserRouter
  +-- QueryClientProvider
  +-- AuthProvider
  +-- ThemeModeProvider
  +-- ToasterProvider
```

### Provider Responsibilities

- `QueryClientProvider`: cache API data, retries for idempotent reads, invalidation after mutations.
- `AuthProvider`: stores current user, access token, refresh token, logout flow.
- `ThemeModeProvider`: admin light/dark mode, persisted in local storage.
- `ToasterProvider`: success/error feedback for mutations.

Tradeoff: React Query plus small context providers is preferable to a global store for most server-backed workflows. A large store would duplicate backend state and increase invalidation complexity.

---

## 3. Routing Structure

Routes are split by access level and product surface.

```text
/
  -> redirect based on host and auth state

/auth/login
/auth/register
/auth/forgot-password
/auth/reset-password

/app
  /dashboard
  /websites
  /websites/new
  /websites/:websiteId
  /websites/:websiteId/content
  /websites/:websiteId/menu
  /websites/:websiteId/gallery
  /websites/:websiteId/reviews
  /websites/:websiteId/theme
  /websites/:websiteId/preview
  /analytics
  /domains
  /subscription
  /settings

/admin
  /dashboard
  /tenants
  /tenants/:tenantId
  /templates
  /subscriptions
  /analytics

/site/:slug
  -> public tenant website by slug

custom-domain host
  -> public tenant website using /public/site
```

### Route Guards

- `GuestRoute`: redirects authenticated users to dashboard.
- `ProtectedRoute`: requires valid auth.
- `RoleRoute`: checks `SUPER_ADMIN`, `TENANT_ADMIN`, or `EDITOR`.
- `TenantRoute`: requires tenant context for tenant workspace routes.
- `PublicSiteRoute`: fetches published public site data and shows not found if unpublished.

### Role-Based Navigation

Super Admin navigation:

- Platform Dashboard
- Tenants
- Templates
- Subscriptions
- Platform Analytics

Tenant Admin navigation:

- Dashboard
- Website
- Menu/Services
- Gallery
- Reviews
- Analytics
- Domains
- Subscription
- Settings

Editor navigation:

- Dashboard
- Website Content
- Menu/Services
- Gallery
- Reviews
- Analytics view only

---

## 4. Page Structure

### Auth Pages

`LoginPage`

- Email
- Password
- Optional tenant slug when needed
- Forgot password link
- Register link

`RegisterPage`

- Business name
- Slug
- Business type selector
- Admin name
- Email
- Password

Registration maps directly to `POST /auth/register`, which provisions tenant, subscription, admin user, default theme, draft website, and subdomain.

### Tenant Dashboard

Purpose: show immediate operational health and publishing status.

Sections:

- Website publish status
- Public URL/custom domain status
- Visitors summary
- WhatsApp/contact clicks
- Recent contacts
- Content completion checklist

### Website Detail

Purpose: manage business information.

Sections:

- Business identity: name, tagline, description
- Contact details: address, phone, WhatsApp, email
- Social links
- Google Maps URL
- Opening hours
- Publish actions

Backend endpoints:

- `GET /websites/:id`
- `PUT /websites/:id`
- `PATCH /websites/:id/publish`
- `PATCH /websites/:id/unpublish`

### Menu Management

Purpose: manage restaurant menu, laundry services, workshop services, and similar list-based offerings.

Views:

- Category list
- Item table/card list
- Item create/edit drawer
- Reorder control

Backend endpoints:

- `GET /menu-categories`
- `POST /menu-categories`
- `PUT /menu-categories/:id`
- `DELETE /menu-categories/:id`
- `GET /menus`
- `POST /menus`
- `PUT /menus/:id`
- `PATCH /menus/reorder`
- `DELETE /menus/:id`

### Theme Builder

Purpose: customize tenant website visual identity.

Controls:

- Template selection
- Primary/accent color swatches
- Typography selector
- Logo upload
- Hero image upload
- Preview viewport selector: mobile, tablet, desktop

Theme Builder should update CSS variables in preview immediately, then persist changes through theme APIs once backend theme module is implemented.

### Public Preview

Purpose: preview unpublished site data safely.

Layout:

- Top preview toolbar with viewport selector and publish button.
- Full public renderer below.
- No marketing copy or instructions inside the preview itself.

### Super Admin Tenants

Purpose: manage platform tenants.

Views:

- Tenant table with status, plan, domain, created date
- Tenant detail with websites, subscription, domains
- Suspend/activate/delete actions

Backend endpoints:

- `GET /tenants`
- `POST /tenants`
- `GET /tenants/:id`
- `PUT /tenants/:id`
- `PATCH /tenants/:id/suspend`
- `PATCH /tenants/:id/activate`
- `DELETE /tenants/:id`

---

## 5. Component Tree

```text
App
  AppProviders
    AppRoutes
      GuestLayout
        LoginPage
        RegisterPage
      TenantAppLayout
        AppSidebar
        AppHeader
        MainContent
          DashboardPage
          WebsiteEditorPage
          MenuManagementPage
          GalleryPage
          ReviewsPage
          AnalyticsPage
          DomainsPage
      SuperAdminLayout
        AdminSidebar
        AdminHeader
        MainContent
          AdminDashboardPage
          TenantListPage
          TenantDetailPage
          TemplateManagementPage
      PublicSiteLayout
        PublicSiteRenderer
          TemplateRenderer
            HeroSection
            AboutSection
            MenuSection
            ServicesSection
            PricingSection
            GallerySection
            ReviewsSection
            LocationSection
            ContactSection
```

### Shared UI Components

- `Button`
- `IconButton`
- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `Switch`
- `Tabs`
- `Dialog`
- `Drawer`
- `Table`
- `Badge`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `ImageUploader`
- `ColorSwatch`
- `PreviewFrame`

Use icon buttons for common actions such as edit, delete, publish, preview, upload, copy link, and reorder.

---

## 6. State Management Design

### Server State

React Query keys:

```ts
['auth', 'me']
['tenants']
['tenants', tenantId]
['websites']
['websites', websiteId]
['menu-categories', websiteId]
['menus', websiteId]
['public-site', hostOrSlug]
['analytics', 'summary', websiteId]
```

Mutation invalidation:

- Website update invalidates `['websites']` and `['websites', websiteId]`.
- Publish/unpublish invalidates website detail and public site preview.
- Menu mutations invalidate menu and category queries for the website.
- Tenant status mutations invalidate tenant list and tenant detail.

### Client State

Use small stores or context for:

- `authStore`: access token, refresh token, current user.
- `uiStore`: sidebar collapsed, mobile drawer, theme mode.
- `previewStore`: viewport mode and preview scale.

Avoid storing API resources in client stores. React Query owns server-backed data.

### Axios Client

Responsibilities:

- Base URL from `VITE_API_URL`.
- Attach bearer access token.
- On `401`, call `/auth/refresh` once and replay the original request.
- On refresh failure, clear auth and redirect to login.
- Include `X-Tenant-Slug` later if backend adds explicit tenant header support.

---

## 7. Tenant Theme Strategy

Public site rendering uses tenant theme data from the API and maps it into CSS variables:

```text
--tenant-primary
--tenant-secondary
--tenant-accent
--tenant-font-heading
--tenant-font-body
```

### Theme Application Flow

```text
Public site data
  |
  +-- theme object
  |
  +-- ThemeVariableProvider
  |
  +-- TemplateRenderer
```

### Template Strategy

Each template is a section configuration, not a separate app. The renderer chooses sections based on template schema and business type.

Template section mapping:

- Warteg: Hero, About, Menu, Reviews, Gallery, Location, Contact
- Laundry: Hero, Services, Pricing, Pickup Service, Reviews, FAQ, Contact
- Clinic: Hero, Doctors, Services, Schedule, Reviews, Contact
- Workshop: Hero, Services, Pricing, Reviews, Contact

Tradeoff: A schema-driven renderer is more maintainable than building separate React apps per tenant. It requires disciplined section contracts but enables reuse and customization at SaaS scale.

---

## 8. API Service Design

```text
lib/api/http.ts
features/auth/auth.api.ts
features/tenants/tenants.api.ts
features/websites/websites.api.ts
features/menus/menus.api.ts
features/public-site/public-site.api.ts
```

Initial API service coverage for Phase 5:

- `authApi.register`
- `authApi.login`
- `authApi.refresh`
- `authApi.logout`
- `tenantsApi.list`
- `tenantsApi.create`
- `tenantsApi.update`
- `tenantsApi.suspend`
- `tenantsApi.activate`
- `tenantsApi.remove`
- `websitesApi.list`
- `websitesApi.get`
- `websitesApi.create`
- `websitesApi.update`
- `websitesApi.publish`
- `websitesApi.unpublish`
- `websitesApi.preview`
- `menusApi.listCategories`
- `menusApi.createCategory`
- `menusApi.updateCategory`
- `menusApi.deleteCategory`
- `menusApi.listMenus`
- `menusApi.createMenu`
- `menusApi.updateMenu`
- `menusApi.reorderMenus`
- `menusApi.deleteMenu`
- `publicSiteApi.byHost`
- `publicSiteApi.bySlug`

---

## 9. Accessibility, SEO, and Responsive Design

### Accessibility

- All form controls have labels.
- Icon-only buttons have accessible names and tooltips.
- Dialogs and drawers trap focus.
- Keyboard navigation works across menus, tabs, tables, and forms.
- Error states are announced near fields and summarized at form level.

### SEO

Public tenant sites should generate:

- Page title from business name and tagline.
- Meta description from business description.
- Open Graph image from hero image or logo.
- Structured data for local business fields once backend supports it.

Admin routes can be noindexed.

### Responsive Design

- Mobile-first Tailwind breakpoints.
- Admin tables switch to compact cards on small screens.
- Website editor uses stacked form sections on mobile and two-column layout on desktop.
- Public site CTA remains reachable on mobile without covering content.
- Preview frame has fixed viewport presets to prevent layout shifts.

---

## 10. Phase 5 Implementation Order

Recommended implementation order:

1. Vite React TypeScript scaffold with Tailwind.
2. App providers, router, Axios client, auth storage.
3. Auth pages and auth API integration.
4. Tenant app layout and role-aware navigation.
5. Website list/detail/edit flow.
6. Menu/category management.
7. Public site renderer by slug/domain.
8. Super Admin tenant management.
9. Preview page and publish workflow.
10. Polish responsive states, dark mode, accessibility, loading/error states.

This order makes the frontend useful against the already implemented backend before expanding to modules planned but not yet implemented.

---

## Phase 4 Approval Gate

Phase 4 frontend design is complete. Do not proceed to Phase 5: Frontend Implementation until approval is given.
