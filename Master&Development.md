# UMKM Website Builder SaaS - Master Prompt

## Objective

Act as a Principal Software Architect, Senior Full Stack Engineer, Senior DevOps Engineer, Product Manager, and SaaS Founder.

Design and build a production-ready multi-tenant SaaS platform called:

**UMKM Website Builder**

The platform allows businesses such as:

* Warteg
* Restaurant
* Cafe
* Laundry
* Workshop
* Clinic
* Salon
* Retail Store
* Local Services

to create and manage professional business websites without coding.

The result must be suitable for commercial use and scalable to thousands of tenants.

---

# Technology Stack

## Frontend

Use:

* React 19
* Vite
* TypeScript
* Tailwind CSS
* React Router
* Axios
* React Query
* Framer Motion

Requirements:

* Mobile First
* SEO Friendly
* Responsive Design
* Dark Mode Support
* Accessibility Friendly

---

## Backend

Use:

* NestJS
* TypeScript
* Prisma ORM
* JWT Authentication
* REST API

Requirements:

* Clean Architecture
* Modular Structure
* Role Based Access Control (RBAC)
* Multi-Tenant Support

---

## Database

Use:

* PostgreSQL

Generate:

* Prisma Schema
* ERD
* Database Migration Strategy

---

## Infrastructure

Use:

* Docker
* Docker Compose
* Nginx Reverse Proxy

---

## Source Control

Use:

* GitHub

Generate:

* Branch Strategy
* Git Workflow
* Pull Request Workflow

---

## CI/CD

Use:

* GitHub Actions

Generate:

* Build Pipeline
* Test Pipeline
* Docker Build Pipeline
* VPS Deployment Pipeline

---

# Multi-Tenant Architecture

Implement true multi-tenancy.

Requirements:

* Tenant Isolation
* Tenant Based Authentication
* Tenant Based Data Filtering
* Tenant Custom Domain Support
* Tenant Theme Customization

Examples:

Tenant 1:
WARTEG MONCER

Tenant 2:
Laundry Suka Suka

Tenant 3:
Klinik Sehat Bersama

All tenants must use the same codebase.

No tenant should require a separate application deployment.

---

# User Roles

Generate RBAC for:

## Super Admin

Can:

* Manage tenants
* Manage subscriptions
* View platform analytics
* Manage templates

## Tenant Admin

Can:

* Manage own website
* Manage menus
* Manage gallery
* Manage content

## Editor

Can:

* Update content
* Update gallery

Cannot:

* Change subscription
* Delete tenant

---

# SaaS Core Features

Generate complete implementation design.

---

## Authentication

Features:

* Login
* Register
* Forgot Password
* Reset Password
* Refresh Token
* JWT Authentication

---

## Tenant Management

Features:

* Create Tenant
* Update Tenant
* Suspend Tenant
* Delete Tenant

---

## Website Builder

Features:

* Create Website
* Publish Website
* Unpublish Website
* Website Preview

---

## Theme Builder

Features:

* Theme Selection
* Color Selection
* Typography Selection
* Hero Image Selection
* Logo Upload

---

## Business Information

Store:

* Business Name
* Tagline
* Description
* Address
* Phone Number
* WhatsApp Number
* Email
* Social Media
* Google Maps Link
* Opening Hours

---

## Menu Management

Features:

* Add Menu
* Edit Menu
* Delete Menu
* Menu Categories
* Pricing
* Image Upload

Examples:

Restaurant:

* Nasi Goreng
* Ayam Bakar

Laundry:

* Cuci Kering
* Cuci Setrika

---

## Gallery Management

Features:

* Upload Images
* Delete Images
* Reorder Images
* Categorize Images

---

## Customer Reviews

Features:

* Review Management
* Star Rating
* Google Review Integration Placeholder

---

## Analytics

Features:

* Total Visitors
* Popular Pages
* Conversion Tracking
* Contact Click Tracking
* WhatsApp Click Tracking

---

# Website Templates

Generate reusable templates for:

## Warteg Template

Sections:

* Hero
* About
* Menu
* Reviews
* Gallery
* Location
* Contact

---

## Laundry Template

Sections:

* Hero
* Services
* Pricing
* Pickup Service
* Reviews
* FAQ
* Contact

---

## Clinic Template

Sections:

* Hero
* Doctors
* Services
* Schedule
* Reviews
* Contact

---

## Workshop Template

Sections:

* Hero
* Services
* Pricing
* Reviews
* Contact

---

# Database Design

Generate complete schema.

Tables:

* users
* roles
* tenants
* subscriptions
* websites
* templates
* themes
* menus
* menu_categories
* galleries
* reviews
* contacts
* analytics
* domains

Include:

* Primary Keys
* Foreign Keys
* Indexes
* Constraints

---

# API Design

Generate complete REST API specification.

Examples:

Authentication:

POST /auth/login

POST /auth/register

POST /auth/refresh

---

Tenant:

GET /tenants

POST /tenants

PUT /tenants/:id

DELETE /tenants/:id

---

Website:

GET /websites

POST /websites

PUT /websites/:id

DELETE /websites/:id

---

# Frontend Structure

Generate complete folder structure.

Example:

frontend/
├── src/
├── pages/
├── layouts/
├── components/
├── services/
├── hooks/
├── stores/
├── assets/
├── routes/
└── types/

---

# Backend Structure

Generate complete folder structure.

Example:

backend/
├── src/
├── modules/
├── auth/
├── tenants/
├── websites/
├── themes/
├── analytics/
├── prisma/
└── common/

---

# Docker Requirements

Generate:

1. Frontend Dockerfile
2. Backend Dockerfile
3. docker-compose.yml
4. Nginx Configuration
5. Production Deployment Guide

Requirements:

Single command deployment:

docker compose up -d

---

# GitHub Actions

Generate workflows:

1. Build Frontend
2. Build Backend
3. Run Tests
4. Build Docker Images
5. Deploy to VPS

---

# Security Requirements

Implement:

* JWT Authentication
* Refresh Tokens
* Password Hashing
* Helmet
* Rate Limiting
* CORS
* Input Validation
* SQL Injection Protection

---

# SaaS Monetization

Generate subscription models:

Free Plan

Starter Plan

Business Plan

Enterprise Plan

Include:

* Monthly Pricing
* Feature Matrix
* Upgrade Flow

---

# Deliverables

Generate in order:

1. High-Level Architecture Diagram
2. Database Design
3. Prisma Schema
4. REST API Specification
5. Frontend Structure
6. Backend Structure
7. Docker Configuration
8. GitHub Actions
9. Deployment Guide
10. SaaS Monetization Strategy

Important:

Do NOT skip steps.

Generate architecture first.

Wait for confirmation before generating implementation code.

The final solution must be production-ready, scalable, maintainable, containerized, and suitable for commercial SaaS deployment.


# Development Process (IMPORTANT)

Follow the implementation phases below.

Do NOT generate the entire project in a single response.

Act as a professional software architect and engineering team.

After each phase, stop and wait for approval before continuing.

---

## Phase 1 - Architecture Design

Generate:

* High-Level Architecture Diagram
* Multi-Tenant Architecture
* Database Design
* Tenant Isolation Strategy
* Security Design
* Infrastructure Design
* Docker Architecture
* Deployment Architecture

Deliverables:

1. System Architecture
2. Database ERD
3. Tenant Strategy
4. Security Strategy
5. Deployment Strategy

STOP.

Wait for approval before Phase 2.

---

## Phase 2 - Database & Backend Design

Generate:

* Prisma Schema
* PostgreSQL Design
* Backend Module Design
* API Specification
* Authentication Design
* Authorization Design

Deliverables:

1. Prisma Schema
2. API Endpoints
3. RBAC Design
4. Authentication Flow

STOP.

Wait for approval before Phase 3.

---

## Phase 3 - Backend Implementation

Generate:

* NestJS Project Structure
* Modules
* Services
* Controllers
* DTOs
* Guards
* Middleware

Requirements:

* Production Ready
* SOLID Principles
* Clean Architecture

Deliverables:

1. Folder Structure
2. Source Code
3. Unit Test Strategy

STOP.

Wait for approval before Phase 4.

---

## Phase 4 - Frontend Design

Generate:

* UI Architecture
* Routing Structure
* Component Hierarchy
* State Management Design
* Tenant Theme Strategy

Deliverables:

1. Frontend Architecture
2. Page Structure
3. Component Tree

STOP.

Wait for approval before Phase 5.

---

## Phase 5 - Frontend Implementation

Generate:

* React Components
* Pages
* Layouts
* Hooks
* Services
* API Integration

Requirements:

* React
* TypeScript
* Tailwind CSS

Deliverables:

1. Folder Structure
2. Source Code
3. UI Screens

STOP.

Wait for approval before Phase 6.

---

## Phase 6 - DevOps & Infrastructure

Generate:

* Frontend Dockerfile
* Backend Dockerfile
* docker-compose.yml
* nginx.conf

Requirements:

Single command deployment:

docker compose up -d

Deliverables:

1. Docker Configuration
2. Nginx Configuration
3. Environment Variables

STOP.

Wait for approval before Phase 7.

---

## Phase 7 - CI/CD

Generate:

* GitHub Actions
* Build Pipeline
* Test Pipeline
* Docker Build Pipeline
* VPS Deployment Pipeline

Deliverables:

1. GitHub Workflows
2. Deployment Scripts
3. Release Strategy

STOP.

Wait for approval before Phase 8.

---

## Phase 8 - SaaS Operations

Generate:

* Subscription Plans
* Tenant Onboarding Flow
* Tenant Provisioning Flow
* Monitoring Strategy
* Backup Strategy
* Disaster Recovery Strategy

Deliverables:

1. SaaS Monetization
2. Operational Guide
3. Scaling Strategy

STOP.

Wait for approval before generating additional features.

---

# Quality Rules

Never generate placeholder architecture.

Always explain tradeoffs.

Always justify technology choices.

Always think as a SaaS Architect first and a Developer second.

Prefer maintainability over complexity.

Prefer scalability over shortcuts.

Prefer reusable multi-tenant design over tenant-specific customization.

The goal is to build a commercial SaaS product that can support hundreds or thousands of tenants using a single codebase.
