# STAGE 9 — Modern Template System & Design Foundation

## Objective

Transform UMKM Website Builder from a functional website generator into a commercially attractive SaaS product with modern, industry-specific templates.

Current state:

* Authentication completed
* Google Login production-ready
* Onboarding flow completed
* Website generation functional
* Multi-industry support exists
* Stage 8.3 Email Provider Integration completed (code level)
* Email Provider Production Activation deferred until final domain is available

Current limitation:

* Templates feel generic
* Visual quality is not yet commercially competitive
* Preview experience needs improvement
* Design consistency is not yet standardized

Target state:

A professional website builder capable of generating visually appealing websites tailored to specific business categories with a reusable design system and scalable template architecture.

---

# IMPORTANT CONTEXT

## Existing Infrastructure

Frontend:

* Vercel Production

Backend:

* Railway Production

Database:

* Supabase PostgreSQL

Authentication:

* Stable
* Do NOT modify

Onboarding:

* Stable
* Do NOT modify

Google Login:

* Stable
* Do NOT modify

Email Provider:

* Out of scope for Stage 9

---

# CRITICAL CONSTRAINTS

DO NOT:

* Redesign backend architecture
* Modify authentication flows
* Modify onboarding flows
* Modify Google Login implementation
* Change database structure unnecessarily
* Introduce tenant switching
* Introduce new multi-tenant architecture
* Refactor infrastructure
* Touch Railway deployment configuration
* Touch Supabase production configuration

Focus exclusively on:

* UI
* UX
* Design System
* Theme Architecture
* Template Architecture
* Preview Experience
* Commercial Presentation Quality

---

# STAGE 9 EXECUTION PLAN

This stage must be completed incrementally.

DO NOT build all templates immediately.

Sprint 1 must be completed and approved first.

---

# SPRINT 1 — Design System Foundation

## Goal

Create a reusable visual foundation that will support all future templates.

---

## Typography System

Create:

* Display
* H1
* H2
* H3
* Body
* Caption
* Small Text

Requirements:

* Mobile-first
* Consistent hierarchy
* Modern SaaS appearance
* Readability focused

---

## Color System

Create semantic tokens:

* Primary
* Secondary
* Accent
* Success
* Warning
* Error
* Background
* Surface
* Border
* Text Primary
* Text Secondary

Support:

* Light Theme

Architecture must support:

* Future Dark Theme

without redesign.

---

## Spacing System

Create reusable spacing scale:

* xs
* sm
* md
* lg
* xl
* 2xl
* 3xl

---

## UI Component Library

Create reusable components:

* Buttons
* Cards
* Inputs
* Forms
* Hero Sections
* Feature Sections
* CTA Sections
* Testimonials
* Navigation
* Footer
* Pricing Blocks
* Contact Sections
* Gallery Components
* Service Components

Requirements:

* Reusable
* Consistent
* Mobile-first
* Theme-aware

---

## Design Philosophy

The design language should be:

* Modern
* Clean
* Commercially attractive
* SaaS-oriented
* Mobile-first
* Fast loading

Avoid:

* Overly corporate appearance
* Legacy admin-dashboard aesthetics
* Heavy visual clutter

---

# QUALITY GATE (MANDATORY)

Sprint 2–6 MUST NOT start until Sprint 1 is completed.

After Sprint 1 completion:

Generate:

PHASE-10B-Sprint1-Design-System-Review.md

Include:

## Design Tokens

* Typography
* Colors
* Spacing
* Theme Structure

---

## Component Inventory

List all created components.

---

## Responsive Validation

Provide:

* Mobile validation
* Tablet validation
* Desktop validation

---

## Preview Evidence

Provide screenshots or preview references.

---

## Design Philosophy

Explain:

* Visual direction
* UX strategy
* Accessibility considerations

---

## Commercial Evaluation

Demonstrate support for:

* Restaurant
* Laundry
* Clinic
* Corporate
* Cafe

without redesign.

---

# HARD STOP REQUIREMENT

After Sprint 1:

STOP.

DO NOT continue to Sprint 2–6.

Wait for approval.

---

# SPRINT 2 — Restaurant Template

## Goal

Build a modern restaurant template.

Target businesses:

* Restaurant
* Warteg
* Food Stall
* Catering

---

## Required Sections

* Hero
* Featured Menu
* Popular Dishes
* About
* Testimonials
* Gallery
* Location
* Contact
* Reservation CTA

---

## Design Direction

Reference:

Modern restaurant websites.

Focus:

* Large imagery
* Conversion-oriented layout
* Modern visual appeal

---

# SPRINT 3 — Laundry Template

## Goal

Build a modern laundry template.

---

## Required Sections

* Hero
* Services
* Pricing
* Pickup & Delivery
* Process Timeline
* Testimonials
* Contact

---

## Design Direction

Focus:

* Trust
* Simplicity
* Clean presentation

---

# SPRINT 4 — Clinic Template

## Goal

Build a healthcare-oriented template.

---

## Required Sections

* Hero
* Services
* Doctors
* Operating Hours
* Testimonials
* Appointment CTA
* Contact

---

## Design Direction

Focus:

* Trust
* Professionalism
* Accessibility

---

# SPRINT 5 — Corporate Template

## Goal

Build a modern company profile template.

---

## Required Sections

* Hero
* About Company
* Services
* Portfolio
* Team
* Clients
* Contact

---

## Design Direction

Focus:

* Enterprise-grade presentation
* Professional appearance

---

# SPRINT 6 — Cafe Premium Template

## Goal

Create a visually rich cafe template.

---

## Required Sections

* Hero
* Signature Menu
* Story
* Events
* Gallery
* Testimonials
* Reservation CTA

---

## Design Direction

Focus:

* Lifestyle branding
* Premium visual experience
* Social-media-ready presentation

---

# PREVIEW EXPERIENCE IMPROVEMENT

Apply globally.

Requirements:

* Faster preview rendering
* Better mobile responsiveness
* Consistent interactions
* Lightweight animations
* Smooth scrolling

Avoid:

* Animation-heavy frameworks
* Performance degradation

---

# THEME ARCHITECTURE

Implement:

Theme

↓

Sections

↓

Components

↓

Templates

The architecture must support future template expansion without duplication.

---

# COMMERCIAL READINESS GOAL

By the end of Stage 9:

A prospective customer should instantly recognize:

* Restaurant Website
* Laundry Website
* Clinic Website
* Corporate Website
* Cafe Website

without requiring customization.

The generated websites should feel commercially deployable.

---

# DELIVERABLES

Codex must produce:

1. Design System
2. Theme Architecture
3. UI Component Library
4. Restaurant Template
5. Laundry Template
6. Clinic Template
7. Corporate Template
8. Cafe Template
9. Preview Experience Improvements

---

# DOCUMENTATION

Generate:

PHASE-10B-Modern-Template-System-Report.md

Include:

* Architecture Overview
* Design System
* Component Inventory
* Theme Architecture
* Template Catalog
* Before / After Comparison
* Mobile Responsiveness Validation
* Performance Validation
* Risks & Mitigations
* Future Expansion Strategy

---

# DEFINITION OF DONE

Stage 9 is complete when:

✅ Design System implemented

✅ Theme Architecture implemented

✅ UI Component Library implemented

✅ Restaurant Template completed

✅ Laundry Template completed

✅ Clinic Template completed

✅ Corporate Template completed

✅ Cafe Template completed

✅ Mobile-first validation completed

✅ Preview experience improved

✅ Commercial presentation quality improved

✅ PHASE-10B-Modern-Template-System-Report.md generated

---

# EXECUTION RULE

Sprint 1 is mandatory.

After Sprint 1 completion:

STOP.

Generate:

PHASE-10B-Sprint1-Design-System-Review.md

Wait for approval before continuing to Sprint 2–6.
