# STAGE 8.1 — AUTHENTICATION PRODUCTION ACTIVATION

## ROLE

Act as:

* Principal Authentication Architect
* Senior Security Engineer
* Senior Full Stack Engineer
* Senior DevOps Engineer
* SaaS Product Architect

Current Platform Status:

* Stage 6 QA Sign-Off = PASS
* Stage 7 Security Audit = PASS
* Stage 8 Authentication Enhancement = PASS

Implemented:

* Google Login
* Google Register
* Forgot Password
* Password Reset
* Email Verification
* Session Management

Code implementation already exists.

DO NOT redesign authentication.

DO NOT migrate to Supabase Auth.

DO NOT replace JWT architecture.

DO NOT introduce third-party auth frameworks.

Preserve existing architecture.

---

# OBJECTIVE

Activate and validate authentication features for real production usage.

Current blocker:

Authentication features exist but are not fully activated because external providers are not yet configured.

Target:

Google Login + Email Verification + Forgot Password must work end-to-end in production.

---

# PHASE A — AUTHENTICATION READINESS AUDIT

Review existing implementation.

Verify:

Backend

* Google Login Endpoint
* Google Register Endpoint
* Verify Email Endpoint
* Resend Verification Endpoint
* Forgot Password Endpoint
* Reset Password Endpoint
* Session Management Endpoint

Frontend

* Google Login Button
* Google Register Button
* Verify Email Screen
* Forgot Password Screen
* Reset Password Screen
* Session Management Screen

Environment

* GOOGLE_CLIENT_ID
* VITE_GOOGLE_CLIENT_ID
* Email Provider Variables

Generate:

AUTHENTICATION READINESS REPORT

Classify:

PASS
WARNING
FAIL

STOP

Identify missing production requirements.

---

# PHASE B — GOOGLE OAUTH PRODUCTION ACTIVATION

Review implementation.

Validate:

* Google Identity Services integration
* Google token verification
* Google user creation
* Google login flow
* Existing tenant architecture compatibility

Generate:

GOOGLE OAUTH ACTIVATION PLAN

Include:

1. Required Google Cloud configuration
2. Required Railway variables
3. Required Vercel variables
4. Authorized Origins
5. Redirect URI requirements
6. Validation procedure

If implementation changes are required:

Implement minimal changes only.

Requirements:

* Preserve backend JWT ownership
* Preserve tenant-scoped authentication
* Preserve existing session model

Generate:

GOOGLE OAUTH ACTIVATION REPORT

STOP

---

# PHASE C — EMAIL DELIVERY ACTIVATION

Preferred Provider:

Resend

Alternative Providers:

* SMTP
* SendGrid
* Mailgun

Review:

* Email Verification Flow
* Forgot Password Flow

Implement provider integration if not already implemented.

Requirements:

Email Verification

* Send verification email
* Verify token
* Mark user verified

Forgot Password

* Send reset email
* Validate reset token
* Update password
* Revoke active refresh tokens

Generate:

EMAIL DELIVERY ACTIVATION REPORT

Include:

Provider Setup
Environment Variables
Email Templates
Validation Flow

STOP

---

# PHASE D — END-TO-END VALIDATION

Execute full validation.

Scenario 1

Google Register

User
↓
Google Login
↓
Tenant Creation
↓
Dashboard

Scenario 2

Email Verification

Register
↓
Receive Email
↓
Verify Email
↓
Verified Account

Scenario 3

Forgot Password

Forgot Password
↓
Receive Email
↓
Reset Password
↓
Login

Scenario 4

Session Management

Login
↓
Multiple Sessions
↓
List Sessions
↓
Revoke Session

Validate:

Frontend
Backend
Railway
Vercel
Database

Generate:

END-TO-END VALIDATION REPORT

PASS / FAIL

STOP

---

# PHASE E — PRODUCTION ACTIVATION CHECKLIST

Generate:

PRODUCTION AUTHENTICATION CHECKLIST

Include:

Google OAuth

□ Google Project Created

□ OAuth Consent Screen Configured

□ OAuth Client Created

□ Authorized Origins Configured

□ Railway Variable Configured

□ Vercel Variable Configured

□ Google Login Tested

Email Provider

□ Provider Account Created

□ Domain Verified

□ API Key Configured

□ Railway Variable Configured

□ Verify Email Tested

□ Forgot Password Tested

Security

□ Production Tokens Not Exposed

□ Verification Tokens Not Returned

□ Reset Tokens Not Returned

□ JWT Validation Tested

□ Session Revocation Tested

---

# FINAL DECISION

Generate:

STAGE 8.1 AUTHENTICATION PRODUCTION ACTIVATION REPORT

Include:

1. Authentication Readiness Report
2. Google OAuth Activation Report
3. Email Delivery Activation Report
4. End-to-End Validation Report
5. Production Authentication Checklist

Decision:

READY FOR STAGE 9

or

ADDITIONAL ACTIVATION REQUIRED

STOP.

Do not start Stage 9.

Do not modify templates.

Do not implement monetization.

Focus only on production activation of authentication features.
