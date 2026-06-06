# Stage 8.2 — Authentication & Onboarding UX Refinement

## Objective

Refine the authentication and onboarding experience to align with modern SaaS standards and eliminate unnecessary friction during user registration.

The current implementation requires users to enter tenant/business information before authenticating with Google. This creates a poor user experience and does not match user expectations for modern applications.

The goal of Stage 8.2 is to separate:

* Authentication
* Account Creation
* Tenant Creation
* Website Onboarding

into distinct and scalable workflows.

---

# Current Production Status

## Infrastructure

* Frontend: Vercel ✅
* Backend: Railway ✅
* Database: Supabase PostgreSQL ✅
* Production Environment: Active ✅

## Google Authentication

Google Authentication has been successfully configured and is already running in Production mode.

Current Status:

* Google OAuth Client Created ✅
* Publishing Status = Production ✅
* User Type = External ✅
* GOOGLE_CLIENT_ID configured in Railway Production ✅
* VITE_GOOGLE_CLIENT_ID configured in Vercel Production ✅
* Public Google Login available for all Google accounts ✅

Important:

Do NOT redesign or replace the existing Google OAuth implementation unless a critical issue is identified.

The current architecture is:

Google Identity Services (GIS)

Frontend
→ Google Authentication
→ Google ID Token
→ Backend Verification
→ Internal JWT Session

This implementation should remain the standard moving forward.

---

# Email Provider Status

Email Provider integration is NOT active yet.

The following features are not production-ready:

* Email Verification
* Forgot Password
* Password Reset Email
* Account Activation Email

Future provider options:

Preferred order:

1. Resend (Recommended)
2. SendGrid
3. Mailgun
4. SMTP

Stage 8.2 must not block onboarding due to missing email verification functionality.

Email verification will be implemented in later stages.

---

# Target SaaS User Journey

## Option A — Continue with Google

User visits registration page

↓

Clicks:

"Continue with Google"

↓

Google Authentication

↓

Backend creates or finds user

↓

If onboarding incomplete:

Redirect to:

/onboarding

↓

Complete business setup

↓

Tenant created

↓

Redirect to Dashboard

---

## Option B — Register with Email

User visits registration page

↓

Clicks:

"Register with Email"

↓

Completes registration form

↓

Tenant created

↓

Redirect to Dashboard

---

# Sprint 1 — Split Authentication Flows

## Goal

Separate Google Signup from Email Registration.

---

## Current Problem

Google Login is embedded inside the tenant registration form.

Users must currently enter:

* Business Name
* Slug
* Business Type

before authenticating with Google.

This creates unnecessary friction.

---

## Tasks

### UI Refactor

Create two primary actions:

#### Continue with Google

Google authentication only.

No tenant information required.

#### Register with Email

Traditional registration flow.

---

### Registration Page Requirements

Display:

* Continue with Google
* Register with Email

as independent actions.

Google Login must not require:

* Business Name
* Slug
* Business Type
* Admin Name

before authentication.

---

## Acceptance Criteria

* User can authenticate with Google immediately.
* User can still register manually using email/password.
* Existing authentication functionality remains operational.

---

# Sprint 2 — Tenant Onboarding Wizard

## Goal

Introduce a dedicated onboarding flow after authentication.

---

## New Route

/onboarding

---

## Step 1 — Business Information

Fields:

* Business Name
* Business Slug
* Business Type

---

## Step 2 — Website Preferences

Fields:

* Template Selection
* Theme Preference
* Color Preset (Optional)

---

## Step 3 — Review & Confirmation

User reviews onboarding information.

Create Tenant.

Generate initial workspace.

---

## Requirements

* Wizard progress should survive page refresh.
* Validation required at every step.
* User cannot skip onboarding completion.

---

## Acceptance Criteria

* Tenant created only after onboarding completion.
* User experience resembles modern SaaS onboarding flows.

---

# Sprint 3 — Google User Auto-Provisioning

## Goal

Automatically create user accounts after successful Google authentication.

---

## New Flow

Google Login

↓

Verify Google Token

↓

Search User By Email

IF User Exists

→ Login

ELSE

→ Create User

↓

Set:

onboardingCompleted = false

↓

Redirect:

/onboarding

---

## Database Requirements

Introduce onboarding tracking.

Preferred options:

Option A:

user.onboardingCompleted

or

Option B:

user.onboardingRequired

Choose whichever best aligns with the existing schema.

---

## Acceptance Criteria

* New Google users do not require manual registration.
* Existing users continue to log in normally.
* No duplicate accounts created.

---

# Sprint 4 — Conditional Routing & Access Control

## Goal

Control application routing based on onboarding status.

---

## Routing Logic

IF onboardingCompleted = false

↓

Redirect:

/onboarding

ELSE

↓

Redirect:

/dashboard

---

## Protected Routes

Dashboard access requires completed onboarding.

Users without completed onboarding should never access:

* Dashboard
* Website Builder
* Tenant Settings

until onboarding is finished.

---

## Acceptance Criteria

* Users without tenants are redirected to onboarding.
* Users with completed onboarding enter the dashboard directly.
* No dead-end navigation paths.

---

# Deliverables

Codex must produce:

## Code Changes

* Frontend modifications
* Backend modifications
* API changes
* Routing updates

---

## Database Changes

* Migration scripts (if required)
* Schema updates (if required)

---

## Documentation

Generate:

Stage-8.2-Authentication-Onboarding-Report.md

including:

* Architecture Changes
* UX Changes
* API Changes
* Database Changes
* Test Results
* Risks & Mitigations
* Rollback Strategy

---

# Constraints

Do NOT:

* Break existing Google Login functionality.
* Break existing Email/Password authentication.
* Redesign multi-tenant architecture.
* Introduce tenant switching.
* Modify production infrastructure unnecessarily.

---

# Future Roadmap Alignment

Tenant Switching remains a future enhancement and is intentionally out of scope for Stage 8.2.

Planned roadmap:

Stage 8.2 — Authentication & Onboarding UX Refinement

↓

Stage 8.3 — Email Provider Integration (Resend)

↓

Stage 8.4 — Email Verification

↓

Stage 8.5 — Forgot Password & Password Reset

↓

Stage 9 — Production Readiness Audit

↓

Stage 10 — Commercial Launch Preparation

---

# Definition of Done

Stage 8.2 is considered complete when:

✅ Google Login works without requiring tenant form completion

✅ Email Registration remains functional

✅ Dedicated onboarding wizard is implemented

✅ Tenant creation occurs after onboarding

✅ Dashboard access requires completed onboarding

✅ Existing authentication remains stable

✅ Production deployment succeeds

✅ Stage-8.2-Authentication-Onboarding-Report.md is generated

✅ All acceptance criteria pass validation
