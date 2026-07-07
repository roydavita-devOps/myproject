# Roadmap

Last updated: 2026-07-07

## Completed

- Master Development Phase 1-8 baseline.
- Production readiness remediation.
- Public pilot deployment preparation.
- Supabase, Railway, and Vercel integration.
- Database and deployment readiness audit.
- QA sign-off remediation and re-run validation.
- Security audit.
- Authentication.
- Google Login.
- Google logout auto-selection security enhancement.
- Resend email provider integration at code level.
- Stage 9 Sprint 1 Design System Foundation.
- Stage 9 Sprint 1 Stabilization.
- Stage 9 Sprint 2 Restaurant Template.
- Stage 9 Sprint 2 Final CTA Visibility Fix.
- Stage 9.1A Documentation Refactor Planning.
- Stage 9.1B Documentation Refactor Execution.
- Stage 9.2 Template Architecture Validation.
- Stage 9.2A Template Registry Foundation.
- Stage 9.2B Template Registry Validation & Test Coverage.
- Stage 9.3 Laundry Template.
- Stage 9.3B Template Catalog Readiness Audit.
- Stage 9.4 Clinic Professional Template.
- Stage 9.5 Corporate Executive Template.
- Stage 9.6 Cafe Modern Template.
- Stage 9.6A Template Consistency Audit.
- Stage 9.6B Basic Template Standardization.
- Stage 9.7 Premium Template Expansion: Restaurant Premium and Cafe Premium.
- Stage 9.7A Template Selection & Assignment Audit.
- Stage 9.7B Template Selection Foundation.
- Stage 9.7C Premium Template Visual Differentiation.
- Stage 9.8A Menu Item Image Management.
- Stage 9.8A-R1 Public Premium Menu Item Count Fix.
- Stage 9.8B Featured Menu and Full Menu Modal.
- Stage 9.8C Premium Template Color Customization and Density Redesign.
- Stage 9.8D Premium Contrast and Readability Remediation.
- Stage 9.8D Restaurant Premium Editorial Redesign, CTA Strategy, Contrast & Typography Refinement.
- Stage 9.8D-R1 Restaurant Premium CTA, Readability & Opening Hours Remediation.
- Stage 9.8D-R2 Restaurant Premium Foundation UX and Data Remediation.
- Stage 9.8D-R3 Image Upload Optimization and WebP Processing Pipeline.
- Stage 9.8D-R4 Supabase Storage Adapter for Durable User Uploads.
- Stage 9.8D-R5 Image Delete and Legacy Local Upload Cleanup Remediation.
- Stage 9.8D-R6 Restaurant Premium Color System Remediation.
- Stage 9.8D-R7 Restaurant Premium Final Polish.
- Stage 9.8D-R8 Restaurant Premium Button and Surface Depth Polish.
- Stage 9.8D-R9 Gallery Multiple Upload, Bulk Delete and Image Type Guard.
- Stage 9.8D-R10 Premium Hero Slideshow for Restaurant Premium.
- Stage 9.8D-R11 Premium Full Menu Modal Item Detail and Price Readability.
- Stage 9.8D-R11A Premium Full Menu Modal Warm Accent Alignment.
- Stage 9.8D-R12 Register Slug Removal and Business Information Ownership.
- Stage 9.8D-R13 Restaurant Premium Mobile Hero Image Parity and Compact Layout Polish.
- Stage 9.8E Restaurant Premium Foundation Reference Lock.

## In Progress

- Modern Template System as the active product quality track.
- Restaurant Premium Foundation is locked. Stage 9.9 Cafe Premium Redesign is the next recommended stage, but implementation has not started.

## Planned

### Stage 9.9

Cafe Premium Redesign Using Restaurant Premium Foundation.

Focus:

- Premium cafe hero.
- Coffee and product showcase.
- Signature drinks.
- Pastry and food support.
- Ambience and gallery.
- Visit and location flow.
- Menu modal and item detail behavior.
- Mobile compact design.
- Warm, modern, cafe-friendly theme.

Guidance:

- Reuse Restaurant Premium foundation principles, semantic tokens, and proven premium patterns where appropriate.
- Do not hardcode, inherit, or blindly copy Restaurant Premium layout, restaurant-specific copy, or reservation-first assumptions.
- Cafe Premium must have cafe-specific language, mood, and content hierarchy.

### Stage 10

Production Readiness.

Focus:

- Final production hardening.
- Operational monitoring.
- Production email activation if final domain is ready.
- Release candidate validation.

### Stage 11

Commercial Launch.

Focus:

- Public launch readiness.
- Pricing.
- Pilot-to-paid conversion.
- Support and operational playbooks.

## Product Strategy Roadmap

### Template Marketplace Strategy

UMKM Builder should evolve from a simple website generator into a template-driven SaaS platform.

Core principle:

- Business Type = Recommendation.
- Template = User Selectable.
- Business Type must not permanently lock a tenant to one template.

### Business Type Recommendation Model

Business type should help the product recommend relevant starting templates.

Example:

- Business Type: Cafe
- Recommended templates: Restaurant Luxury, Cafe Modern, Local Food Landing

### Template User Choice

Users should be able to choose templates independently from their business type.

Valid examples:

- Business Type = Cafe, Template = Restaurant Luxury.
- Business Type = Clinic, Template = Corporate Executive.

### Premium Template Strategy

Premium templates should increase perceived value and support paid tiers.

Stage 9.7C clarified the current visual standard:

- Standard template = functional website.
- Premium template = branded business experience.
- Luxury template = high-end editorial experience.

Premium visual differentiation is implemented for Restaurant Premium and Cafe Premium, with safe enhancement to the existing Corporate Executive renderer. Premium tier remains metadata only until subscription enforcement is approved separately.

Stage 9.8C adds the next premium maturity layer:

- Template = layout and experience.
- Brand = color, logo, content, and images.
- Brand Color = user customization.
- Restaurant Premium and Cafe Premium can use approved presets plus user primary/accent colors without changing template identity.
- Section density adapts to available content so one, two, and many items do not create repetitive or sparse premium layouts.
- Semantic premium tokens protect readability, so brand colors influence identity, CTA, badges, and accents without being used directly for long body copy.

Stage 9.8D adds restaurant-specific commercial polish:

- Restaurant Premium uses reservation-first CTA language instead of generic WhatsApp-first copy.
- Signature Dishes is the strongest conversion section and links to the full menu without per-card WhatsApp buttons.
- Gallery and Footer no longer repeat generic contact CTAs.
- Editorial restaurant typography is applied inside the existing renderer without adding a dependency, schema change, or new template key.

Stage 9.8D-R1 resolves final Restaurant Premium review findings:

- Global reservation CTA is concentrated in the header.
- Hero focuses on content/navigation CTAs instead of repeating `Reserve a Table`.
- Visit & Reservation uses a dark readable final-action card.
- Opening Hours is tenant-editable from the dashboard and rendered from existing `Website.openingHours` data.

Stage 9.8D-R2 establishes Restaurant Premium as the first Premium Experience Foundation reference:

- Future premium templates should share foundation principles and reusable patterns, not inherit directly from `RestaurantPremiumTemplate`.
- Restaurant Premium Full Menu modal follows premium restaurant theme and does not repeat generic WhatsApp CTA.
- Menu categories are user-correctable through safe delete behavior that preserves menu items.
- Tenant slug belongs in Business Information and is removed from the initial login form for the current one-tenant-per-user model.
- Opening Hours uses structured picker controls and stores daily hours in existing JSON persistence.
- Safe additive migrations remain allowed when future premium data contracts require them, but no migration was required for this remediation.

Stage 9.8D-R3 establishes the upload media quality baseline:

- JPG, PNG, and WEBP remain the accepted owner-facing upload formats.
- Uploaded raster images are validated and converted to optimized WebP variants.
- Menu, gallery, logo, and hero uploads keep the existing single `imageUrl`/asset URL contract while the upload response exposes variant URLs for future metadata.
- Broken image fallback behavior is required in dashboard previews and public premium rendering.
- Local filesystem upload storage is acceptable for local Docker validation only; production must use durable object storage before relying on user-generated uploads in stateless deployment.

Stage 9.8D-R4 resolves the durable upload storage blocker:

- Image processing remains independent from storage destination.
- `STORAGE_DRIVER=local` is retained for local development and tests.
- `STORAGE_DRIVER=supabase` stores original and WebP variants in Supabase Storage bucket `tenant-assets`.
- Public website assets use public bucket URLs returned by the backend.
- Supabase service role key is backend-only and must never be exposed to Vercel/frontend.
- Existing local upload URLs remain backward compatible through the backend local upload route.

Stage 9.8D-R5 resolves image delete reliability:

- Menu image delete clears `menu.imageUrl` without deleting the menu item.
- Logo and hero delete clear theme image fields even if old local files are missing.
- Gallery delete archives only the gallery record and removes it from public rendering.
- Legacy `/uploads` records can be removed without requiring the physical file to still exist.
- Supabase cleanup attempts known variants and logs cleanup failures without blocking database cleanup.

Stage 9.8D-R6 establishes Restaurant Premium color-system quality:

- Restaurant Premium default preset is Editorial Umber.
- Brand colors are identity accents for CTA, badges, icons, borders, and small highlights.
- Semantic color tokens protect body text, headings, hero text, modal copy, cards, and visit details.
- Hero sections use dark image-safe overlays because tenants can upload bright, dark, or busy images.
- Premium preset colors must be validated against bright, dark, and busy image scenarios before approval.
- No marketplace, billing, subscription, entitlement, backend, Prisma, or database change is included.

Stage 9.8D-R7 completes Restaurant Premium final polish:

- Public opening hours must render as customer-facing text, never raw structured keys.
- Restaurant Premium navigation uses stable anchors for Menu, Story, Gallery, and Visit.
- Gallery placeholder states must remain readable and intentional when tenant images are missing.
- Signature Dishes copy is restaurant-facing and natural.
- No backend, Prisma, database, marketplace, billing, subscription, entitlement, or new template change is included.

Stage 9.8D-R8 adds Restaurant Premium button and surface depth polish:

- Restaurant Premium CTAs use subtle gradient, warm border, controlled shadow, and hover lift instead of flat solid blocks.
- Visit & Reservation actions keep a clear hierarchy: primary reservation, secondary call, tertiary directions.
- Dark surfaces, footer, and full menu modal tabs use quiet layered depth without glossy, neon, or gimmick effects.
- The polish is frontend token/CSS only and does not change backend, Prisma, database, marketplace, billing, subscription, entitlement, or template registry behavior.

Stage 9.8D-R9 improves Gallery management:

- Gallery is treated as a batch-based content area, so users can select or drag multiple images at once.
- Each selected file is validated independently and valid files continue uploading even when another file fails.
- Gallery supports single image delete plus selected bulk delete without removing unrelated website, menu, tenant, or business data.
- MVP upload formats are JPG, JPEG, PNG, and WEBP only; HEIC, HEIF, GIF, SVG, BMP, TIFF, and AVIF remain out of scope.
- The existing upload processing/storage pipeline remains unchanged.

Stage 9.8D-R10 adds lightweight Premium Hero motion:

- Restaurant Premium supports Static image and Rotating images display modes.
- Rotating hero images use 2-5 uploaded JPG, JPEG, PNG, or WEBP images processed by the existing WebP upload pipeline.
- The slideshow uses calm auto crossfade timing and image-safe overlays to preserve readability.
- Reduced-motion browsers receive a static first-image fallback.
- Short video hero, video upload, ffmpeg, transcoding, poster generation, and advanced media library features remain deferred.
- Classic templates remain static-image-first; premium templates may support controlled rotating hero images when explicitly approved.

Stage 9.8D-R11 improves Restaurant Premium Full Menu browsing:

- Menu item prices render as readable premium chips inside the dark modal.
- IDR and USD formatting continue through the shared formatter.
- Menu item cards are clickable and show name, price, description, category, and Featured badge when present.
- Clicking a card opens an item detail view with larger media/placeholder, full description, formatted price, category, and Back control.
- The Full Menu modal remains browsing-focused and does not add WhatsApp/reservation CTA back into Restaurant Premium menu detail.
- Category tabs, All tab, modal close, scrolling, and mobile behavior remain intact.

Stage 9.8D-R11A aligns the Restaurant Premium Full Menu modal with warm premium accents:

- Price chips, View detail links, focus rings, detail labels, and placeholder icons use copper, gold, champagne, amber, and espresso visual treatment.
- Default blue-looking accent states are removed from the Restaurant Premium Full Menu modal.
- Focus states remain visible and accessible while matching the premium restaurant direction.
- The menu modal remains browsing-focused and still does not add Chat WhatsApp, reservation, ordering, payment, marketplace, billing, subscription, entitlement, backend, Prisma, database, upload, gallery, or hero changes.

Stage 9.8D-R12 simplifies registration and moves slug ownership to Business Information:

- Initial account/tenant registration asks for business name, business type, admin name, email, and password only.
- The public Register form does not render or submit a slug.
- Backend registration remains compatible by generating a temporary unique slug when none is supplied.
- Existing explicit slug flows continue to work for internal/API compatibility.
- Business Information remains the owner-facing place to edit, validate, save, and preview the public URL slug.
- Future publish readiness should require a user-confirmed website address/slug before launch; this stage documents that requirement without implementing a new publish gate.
- No Restaurant Premium design, Full Menu Modal, hero, gallery, menu, upload, payment, subscription, marketplace, hosting renewal, template registry, Cafe Premium, or advanced onboarding work is included.

Stage 9.8D-R13 polishes Restaurant Premium mobile hero behavior:

- Mobile and desktop use the same Restaurant Premium hero media source and slideshow image order.
- Static hero, rotating images, and reduced-motion fallback stay intact.
- Mobile hero uses explicit `object-cover object-center` crop treatment to preserve the same visual subject and mood.
- Mobile-only hero spacing, headline size, supporting copy, CTA padding, feature chips, and hero card density are compacted so the hero lands around 560-640px instead of feeling like an oversized full-screen block.
- Desktop Restaurant Premium hero keeps the approved desktop layout through `md:` responsive classes.
- No backend, database, Prisma, upload pipeline, video, media library, Full Menu modal, Gallery, Register, Business Information, marketplace, payment, subscription, hosting renewal, Template Registry, Cafe Premium, or new template work is included.

Stage 9.8E locks Restaurant Premium as the first Premium Foundation Reference:

- `restaurant_premium` is now the approved quality baseline for premium layout quality, color system, CTA treatment, typography, image handling, hero behavior, menu browsing, modal behavior, gallery UX, mobile compactness, and public copy quality.
- Template = layout and experience.
- Brand = color, logo, content, and images.
- Business Type = recommendation signal, not template lock.
- Template = user choice.
- Premium templates must feel commercially sellable, dense, elegant, readable, and mobile-friendly.
- CTA behavior must be purposeful, not repetitive.
- Public copy must be customer-facing, not developer/internal.
- Reduced-motion behavior and mobile-first validation are part of the premium foundation standard.
- Future premium templates must reuse principles, semantic tokens, utilities, and patterns where appropriate, but must keep their own business-specific experience.
- Restaurant Premium must not become a hardcoded parent component for all premium templates.
- Restaurant-specific language such as `Reserve a Table`, `Signature Dishes`, `Full Restaurant Menu`, `Restaurant Story`, `Dishes Worth the Visit`, and `Visit & Reservation` must not be copied blindly into Cafe Premium or other industries.
- Railway trial is currently inactive/expired, so Stage 9.8E is a local documentation lock. Production redeploy resumes after Railway billing/reactivation.

Potential categories:

- Standard templates.
- Premium templates.
- Luxury templates.
- Exclusive industry templates.

### Subscription Based Template Access

Template access should be tied to subscription plan when monetization is activated.

Draft model:

| Plan | Template Access |
| --- | --- |
| Basic | Standard templates. |
| Pro | Standard and Premium templates. |
| Premium | Standard, Premium, Luxury, and Exclusive templates. |

## Future Vision

- Template catalog.
- Template preview.
- Change template.
- Recommended templates.
- Premium templates.
- Luxury templates.
- Template marketplace.
- Premium template packs.
- Subscription based template access.
