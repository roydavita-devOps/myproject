STAGE 9 — SPRINT 2 REMEDIATION
Restaurant Template Commercial Quality Upgrade
Context

Sprint 1 Design System has been approved.

Sprint 1 Stabilization has been partially successful.

Sprint 2 Restaurant Template has been implemented but visual review identified several issues preventing commercial approval.

This task is NOT a new template implementation.

This task is a remediation and quality improvement phase.

CURRENT PROBLEMS IDENTIFIED
Problem 1 — Blank CTA Buttons

Current screenshots show empty white buttons rendered in Hero and Contact sections.

Examples:

[ Chat WhatsApp ]
[             ]
[             ]

This is NOT acceptable.

A production website must NEVER display blank buttons.

Problem 2 — Invalid CTA Rendering

Some CTA containers are rendered even when:

icon is missing
label is empty
href is empty
action is invalid

This creates broken visual experience.

Problem 3 — Hero Section Feels Generic

Current hero section still feels like:

Generated Website Builder

instead of:

Professional Restaurant Landing Page

The visual hierarchy is not strong enough.

Problem 4 — CTA Hierarchy Is Weak

Current CTA structure is unclear.

Users should immediately understand:

Primary Action

↓

Secondary Action

↓

Supporting Action

Current implementation does not communicate this clearly.

OBJECTIVE

Upgrade Restaurant Template from:

Functional Template

to:

Commercial Showcase Template

This template will become the visual benchmark for:

Restaurant
Warteg
Food Stall
Catering
Cafe

future templates.

MANDATORY FIX 1
Zero Blank Buttons Policy

Implement strict rendering rules.

Rule:

if (!label) return null;

if (!href) return null;

if (!action) return null;

Do NOT render placeholder buttons.

Do NOT render empty containers.

Do NOT render empty action slots.

MANDATORY FIX 2
CTA Validation Layer

Create centralized CTA validation.

Requirements:

Validate:

label
icon
href
action

before rendering.

Invalid CTA:

must not render

Valid CTA:

render normally
MANDATORY FIX 3
Icon Rendering Audit

Perform full audit.

Review:

Hero CTA
Contact CTA
Footer CTA
Floating CTA

Verify:

icon exists
icon visible
icon color contrast valid

If icon unavailable:

use fallback icon.

Never render empty icon containers.

MANDATORY FIX 4
Hero Section Upgrade

Current hero must be redesigned.

Goal:

Create a premium restaurant landing page.

Requirements:

Strong Visual Hierarchy

Users must instantly see:

Business Name
Value Proposition
Main CTA

within first 3 seconds.

Premium Hero Layout

Include:

Restaurant Badge
Large Headline
Supporting Description
CTA Group
Highlight Card
Highlight Card

Current card concept is good.

Improve:

spacing
typography
readability
glassmorphism effect

Card should look premium.

MANDATORY FIX 5
CTA Hierarchy

Required structure:

Primary CTA
Chat WhatsApp

Highest visual weight.

Secondary CTA
View Menu

Medium emphasis.

Tertiary CTA
Get Directions

Lower emphasis.

Requirements:

Each CTA must have:

icon
label
valid action

No exceptions.

MANDATORY FIX 6
Demo Tenant Validation

DO NOT validate using mock data.

Validate using actual demo tenant.

Example:

warteg-moncer

Verification required:

Hero CTA
Contact CTA
Footer CTA
Gallery CTA
Menu CTA

All must render correctly.

MANDATORY FIX 7
Commercial Quality Review

Evaluate template against:

Modern Restaurant Website

Modern Cafe Landing Page

Premium Food Business Website

The final result must NOT feel like:

Admin-generated page

The final result SHOULD feel like:

Professional restaurant website ready for production.
ACCEPTANCE CRITERIA

The task is complete only when:

✅ Zero blank buttons

✅ Zero empty CTA containers

✅ Zero missing icons

✅ CTA validation layer implemented

✅ Hero section upgraded

✅ CTA hierarchy improved

✅ Demo tenant validation passed

✅ Mobile validation passed

✅ Tablet validation passed

✅ Desktop validation passed

✅ Commercial appearance significantly improved

REQUIRED OUTPUT

Generate:

PHASE-10B-Sprint2-Restaurant-Remediation-Report.md

Include:

Root Cause Analysis
CTA Rendering Fixes
Icon Rendering Fixes
Hero Section Improvements
Before / After Screenshots
Mobile Validation
Tablet Validation
Desktop Validation
Commercial Readiness Assessment
HARD STOP

Do NOT start:

Sprint 3 Laundry
Sprint 4 Clinic
Sprint 5 Corporate
Sprint 6 Cafe

until Restaurant Template Remediation is approved.

STOP.

Wait for approval.