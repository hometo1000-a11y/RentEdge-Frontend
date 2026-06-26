# RentEdge | India's Fintech-Powered Rental Network

RentEdge is a premium broker-free rental platform that integrates modern financial services (credit score reporting, security deposit loans, and automated HRA e-receipts) into the Indian rental economy.

This repository is built using **Next.js 16 (Turbopack)**, **Tailwind CSS**, and **Framer Motion** for micro-interactions, layout transitions, and rich aesthetics.

---

## 🛠️ Tech Stack & Key Conventions

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS (Tailwind v4 ready) + custom CSS rules in `globals.css`
- **Animations**: Framer Motion for premium transitions, glass card floating loops, and modal entries
- **Icons**: Lucide React
- **Theme**: State-synchronized Light/Dark modes (toggled via React states and document element class list syncing)

---

## 📁 Repository Structure & Component Guide

### 📂 App Pages (`src/app/`)
- `page.tsx`: The primary route controller. Manages user authentication state, active roles (Tenant vs. Landlord), deep link parameters, toast messages, and routes between onboarding/portal shells.
- `layout.tsx`: Root HTML shell loading the `Plus Jakarta Sans` Google Font, setting default responsive Viewport definitions, and applying global antialiased styles.
- `globals.css`: Holds keyframe animations (`float`, `float-delayed`), masked mesh grids (`.bg-grid-pattern`), and heading adapters for theme synchronization.

### 📂 Components (`src/components/`)
- `Navbar.tsx`: Holds site navigation and the redesigned mint-bordered **Check Rent Score** CTA button. Manages light/dark mode root theme toggling.
- `Hero.tsx`: Rich introductory landing block. Features search parameters and two floating widgets: the **CIBIL Bureau Boost** estimator card and the **Live Node Registry** ticker.
- `Features.tsx`: Visual overview highlighting key platform differentiators (Zero-Brokerage, Smart Contracts, Rent Score reporting).
- `RentScoreSimulator.tsx`: Slider-driven simulator calculating credit rating increases based on payment timelines, lease length, and security returns.
- `Pricing.tsx`: Pricing and monetization grid offering subscription tier cards for both Tenants (Basic/Pro/Elite) and Landlords (Essential/Growth/Enterprise).
- `LandlordOnboardingPipeline.tsx`: An interactive step-by-step onboarding system for property owners to list units, request deposit terms, and initialize credentials.
- `LandlordOS.tsx`: The operating hub dashboard for landlords. Provides real-time metrics for expected rent collection, pending late due automatic nudges, and access codes.
- `TenantLifecycleController.tsx` & `TenantShell.tsx`: The workflow dashboard for tenants, enabling rent payments, lease reviews, and document management.
- `PublicGrid.tsx`: Property exploration block featuring search term filtering, location toggles, image carousels, and favorites.
- `AuthModal.tsx`: Secure overlay interface for mock role validation (Tenant/Owner).

---

## ⚙️ State Management & LocalStorage Reference

To maintain data persistency across role switching and reloads, the project leverages native browser `localStorage` variables:

| Key | Type | Description |
| :--- | :--- | :--- |
| `rentedge_authenticated` | `boolean` | Authenticated session status flag. |
| `rentedge_user_role` | `string` | Stores active account role (`'tenant'`, `'owner'`, or `'hostel'`). |
| `rentedge_user_fullname` | `string` | Full name of the authenticated user (defaults to *Rajvardhan Pawar*). |
| `rentedge_user_email` | `string` | Email address of the logged-in user. |
| `rentedge_properties` | `Array` | Landlord's registered property object records. |
| `rentedge_all_properties` | `Array` | Extended list of properties cached for discovery and public searches. |
| `rentedge_access_codes_registry` | `Array` | Active/pending lease entry code list owned by landlords. |
| `rentedge_access_codes` | `Object` | Access code verification index map used by tenants to link leases. |

---

## 🚀 Running Locally

Ensure Node.js is installed, then run:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Compile production bundle
npm run build

# Start production server
npm run start
```
