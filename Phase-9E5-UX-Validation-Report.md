# UX Validation Report - Stage 5.5

## Status

Stage 5.5 is complete.

This review validates the platform from the perspective of non-technical UMKM owners:

- Warteg Owner
- Laundry Owner
- Clinic Owner
- Workshop Owner

The review was performed after Stage 5 smoke testing, using the running Docker stack on desktop and mobile viewport sizes.

## UX Readiness Score

Overall UX readiness: **68/100**

The product is usable for a guided MVP demo. It is not yet ready for self-serve production onboarding without support.

## User Journey Map

| Journey Step | Current Experience | UX Status | Notes |
| --- | --- | --- | --- |
| Discover login/register | Login and register pages are available and simple | Good | Form is direct, but copy assumes user understands tenant slug |
| Create tenant | Register creates tenant and first website automatically | Good | Strong first-time flow, but lacks onboarding checklist |
| Reach dashboard | User lands on dashboard after register/login | Good | Clear next actions exist: edit website, manage menu, preview |
| Edit business profile | Website editor allows business name, tagline, contact, maps, address | Good | Missing guided examples per business type |
| Upload logo/theme asset | Backend endpoint exists, no owner-facing UI control yet | Critical | Owner cannot upload logo from dashboard without API/tooling |
| Manage menu/services | Menu management supports category and item creation | Medium | Works for restaurants/warteg, but copy is less tailored for clinic/workshop services |
| Publish website | Publish button exists in website editor | Good | Missing confirmation, public URL copy, and post-publish guidance |
| Preview website | Preview exists for website, public site works | Medium | Preview is available but owner is not guided to share/check mobile |
| Mobile dashboard | Mobile layout is usable with bottom nav | Medium | Navigation is compact, but logout/header consumes useful vertical space |
| Public website | Public site renders well with CTA and menu/review/contact sections | Good | Good first impression for UMKM customers |

## Persona Findings

### Warteg Owner

Strengths:

- Menu/categories map well to food items.
- WhatsApp and phone CTA fit local customer behavior.
- Public site has menu, reviews, location, and contact sections.

Pain points:

- Price input has no formatting helper while typing.
- Dashboard content count shows `0 items` even when seeded menu exists because dashboard website list does not include menu details.
- No simple "lihat website saya" public URL after publish.

### Laundry Owner

Strengths:

- Menu & Services can model laundry services and pricing.
- Business info fields cover WhatsApp and address.

Pain points:

- "Menu" language may feel restaurant-specific; laundry owner expects "Services" or "Layanan".
- No pickup/delivery settings in UI despite laundry template concept.
- No business hours editor.

### Clinic Owner

Strengths:

- Public site structure can display services and contact details.
- Reviews and location are relevant.

Pain points:

- Missing doctor/schedule management UI.
- No compliance-oriented copy or disclaimer fields.
- No appointment/contact form workflow.

### Workshop Owner

Strengths:

- Services and prices can be entered through menu management.
- Phone/WhatsApp CTA is useful for booking repair inquiries.

Pain points:

- No service categories tailored to motor/mobil/spare parts.
- No before/after/gallery management UI.
- No booking/queue estimate flow.

## UX Pain Points

| Severity | Pain Point | Impact |
| --- | --- | --- |
| Critical | Logo upload backend exists but no UI control is exposed | Business owner cannot complete branding without technical help |
| High | No onboarding checklist after registration | New users may not know the required steps before publishing |
| High | No post-publish public URL copy/share action | Owner may not know where their website is live |
| High | Domain button exists but is non-functional | Creates expectation mismatch and trust risk |
| Medium | Dashboard content count can show `0 items` even when menu data exists | Reduces confidence in dashboard accuracy |
| Medium | Menu language is not tailored by business type | Laundry, clinic, and workshop owners may feel the product is restaurant-first |
| Medium | No mobile-specific onboarding cues | Mobile users can use the app but are not guided step-by-step |
| Medium | No save success feedback beyond data refresh | Non-technical users need clear confirmation |
| Low | Login requires tenant slug field | Existing users may not remember tenant slug |
| Low | Error messages are generic | Users may not know how to fix failed registration/login |

## Missing Features

| Severity | Missing Feature | Recommended Stage |
| --- | --- | --- |
| Critical | Owner-facing logo/hero/gallery upload controls | Before pilot |
| High | Onboarding checklist with completion status | Before pilot |
| High | Public URL display, copy button, and open live site button | Before pilot |
| High | Domain management page or disable Domain button until ready | Before pilot |
| Medium | Business-type-specific labels and templates in dashboard/menu UI | Pilot hardening |
| Medium | Business hours editor | Pilot hardening |
| Medium | Gallery management UI | Pilot hardening |
| Medium | Save/publish success toast or inline confirmation | Pilot hardening |
| Medium | Mobile-first onboarding assistant | Pilot hardening |
| Low | Slug recovery or login-by-email tenant selector | Later self-serve improvement |

## Recommended Improvements

### Critical

1. Add logo and hero upload controls in website/theme settings.
2. Add gallery upload UI for tenant admins and editors.
3. Connect uploaded asset URLs directly to theme/menu/gallery records.

### High

1. Add first-run onboarding checklist:
   - Business info complete
   - Logo uploaded
   - Menu/services added
   - WhatsApp/phone set
   - Website published
2. Add post-publish panel:
   - Public URL
   - Copy link
   - Open live site
   - Share to WhatsApp
3. Make Domain button functional or hide it until domain flow exists.

### Medium

1. Rename "Menu & Services" dynamically by business type:
   - Warteg/Cafe: Menu
   - Laundry: Services
   - Clinic: Services & Schedule
   - Workshop: Services
2. Add save and publish success feedback.
3. Add business hours editor.
4. Improve dashboard metrics by including menu count and publish readiness.

### Low

1. Improve login helper text for tenant slug.
2. Improve registration error messages.
3. Add optional sample content hints in empty states.

## Mobile Experience

Validated mobile viewport: `390x844`.

Strengths:

- Bottom navigation makes core sections reachable.
- Dashboard, website list, menu management, and public site fit on mobile.
- Public site hero and CTA are readable.

Issues:

- Header with email, role, and logout takes vertical space.
- Bottom nav only shows first four items, hiding Domains and Settings.
- Menu management form is long on mobile and would benefit from collapsible sections.
- Publish flow lacks mobile-specific confirmation/share action.

## Navigation Structure

Current navigation:

- Dashboard
- Website
- Menu
- Analytics
- Domains
- Settings

Assessment:

- Good for SaaS admin users.
- Slightly abstract for non-technical UMKM owners.
- "Website" and "Menu" are clear for warteg/cafe.
- "Analytics", "Domains", and "Settings" should remain secondary until the owner has published.

Recommended owner-first ordering:

1. Dashboard
2. Edit Website
3. Menu/Services
4. Publish & Share
5. Gallery
6. Settings
7. Domains
8. Analytics

## Final Verdict

Stage 5.5 result: **PASS with UX blockers before pilot self-serve launch**.

The product can be demoed and tested with guided users. Before pilot customers use it without support, prioritize:

1. Owner-facing upload controls.
2. Onboarding checklist.
3. Public URL copy/share after publish.
4. Functional or hidden domain flow.

STOP. Wait for approval before Stage 6 - QA Sign-Off.
