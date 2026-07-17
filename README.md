# FarmerPay — "Trust Every Harvest."

> Blockchain-powered agricultural traceability and instant secure payments on the Stellar network.

FararmerPay traces agricultural products from farmer to consumer and settles payments the moment custody changes hands. Every batch carries a permanent digital identity — a **Digital Product Passport** — encoded in a cryptographically signed QR code. The batch ID and QR never change; ownership, payments, and custody transfer around them.

---

## What's built (Phases 1–4)

### Phase 1 — Foundation

- React + Vite + TypeScript frontend with a premium, accessible, dark-mode-ready design system
- Full routing with lazy loading, protected routes, and role-based access
- Auth context (Supabase email/password), theme context, TanStack Query client
- Reusable UI component library (Button, Card, Modal, Table, Pagination, Search, Avatar, Badge, Breadcrumb, EmptyState, ErrorScreen, FilterBar, ImageGallery, NotificationBell, PageHeader, Pagination, ProfileAvatar, QRCard, SearchBox, Skeleton, Spinner, StatusBadge, Table, ThemeSwitch, TimelinePlaceholder, CertificationCard, PassportVerificationBadge, PasswordStrengthMeter)
- Public pages: Landing, About, Features, How It Works, Contact, public QR Verify
- Auth pages: Login, Register, Forgot Password, Reset Password, Verify Email
- Role dashboards: Farmer, Wholesaler, Retailer, Admin (+ shared sub-routes)
- Error pages: 404, 403, 500 + global `ErrorBoundary` wrapping the router
- Express + TypeScript backend scaffold (Helmet, CORS, rate limiting, Zod validation)
- Prisma schema covering current and future tables
- API client + service layer (typed)

### Phase 2 — Auth & Agricultural Domain

- Supabase email/password authentication with `onAuthStateChange` session sync
- `profiles` table with role (`FARMER` / `WHOLESALER` / `RETAILER` / `ADMIN` / `CONSUMER`), verification status, and display name
- `audit_logs` table for security-relevant actions (login, password change, admin actions)
- `notification_preferences` table per user
- Agricultural domain: `farms`, `products`, `product_categories`, `harvests`, `batches`, `batch_images`, `certifications`
- Full CRUD services for each domain (`farmService`, `productService`, `harvestService`, `batchService`)
- Dashboard pages: Farm list/create/detail, Products, Harvests, Batches list/detail
- Row-level security (RLS) on every table — users can only access their own data
- Profile settings page (display name, avatar, contact info) with live notification preferences
- Security settings page (password change, session list, audit log view)

### Phase 3 — Hardening & Admin

- `ErrorBoundary` component catching render errors with recovery UI
- `PasswordStrengthMeter` on the Register page (weak/fair/good/strong scoring)
- Admin Users page with search, filter by role/verification status, user management modal, and audit log viewer
- `useDashboardRedirect` hook for role-based post-login routing
- `GuestRoute` / `ProtectedRoute` guards with role gating
- `ThemeSwitch` with persisted dark/light/system preference

### Phase 4 — Digital Product Passport & QR

Every agricultural batch receives a **permanent digital identity**. The QR code represents this identity forever — ownership changes, payments change, the current holder changes, but the batch ID and QR never change.

**Core concept**

- Every batch receives a **Global Batch ID** (e.g. `FP-KL-2026-000001`) — immutable, never reused
- Each batch has its own **Digital Product Passport** containing: batch ID, product, farm, farmer, harvest, images, certifications, verification status, current holder, current status, ownership timeline placeholder, blockchain placeholder, payment placeholder

**QR generation & security**

- QR is generated after batch creation
- QR payload contains only the verify URL: `https://farmerpay.app/verify/{BatchID}` — no product info
- Every QR includes a **digital signature** (HMAC-SHA256), **timestamp**, and **checksum** to prevent fake QR generation
- If the QR payload is modified, verification fails

**QR downloads**

- PNG (1024px high-resolution)
- SVG (vector)
- PDF label (printable 4×4 inch)
- Printable sticker (branded label template with FarmerPay logo, QR, batch ID, product name, harvest date, verification badge)

**Public verification page** (`/verify/{BatchID}` — no login required)

Apple Wallet-style premium design showing:

- Verified badge with colored status (Verified / Pending / Suspended / Expired / Rejected)
- Product image and name
- Farm name and farmer name
- Harvest date
- Current status and current holder
- Certifications (certificate cards)
- Batch details (quantity, location, batch ID)
- Map placeholder
- Last updated timestamp
- Ownership timeline placeholder

**QR scan history**

Every scan is logged with:

- Scan time
- Approximate location (country/region)
- Device type
- Browser
- IP hash (SHA-256 — never stores raw IP)

**Admin QR management**

- Admins can regenerate a QR only if compromised
- Old QR is immediately invalidated (marked `COMPROMISED`)
- Version history maintained (`version` column incremented)
- New QR generates fresh signature + checksum

**Database tables**

- `qr_codes` — QR code records with signature, checksum, version, status
- `qr_code_downloads` — download log (format, timestamp)
- `qr_scan_logs` — scan events (device, browser, location, IP hash)
- `digital_passports` — cached passport data per batch
- All tables have RLS enabled

**Frontend pages & components**

- `BatchPassportPage` — full passport view with QR card, batch summary, hero banner, image gallery, certification cards, ownership timeline, blockchain placeholder
- `VerifyPage` — public Apple Wallet-style verification page
- `QRCard` — QR display with download menu (PNG/SVG/PDF/Sticker)
- `PassportVerificationBadge` — colored status badge
- `CertificationCard` — certificate display card
- `ImageGallery` — batch image gallery
- `TimelinePlaceholder` — ownership timeline placeholder
- Scan history modal with table (time, device, browser, IP hash)
- QR regeneration modal with confirmation warning

**Error states**

- QR not found
- Batch not found
- QR expired
- Verification failed (signature mismatch)
- Tampered QR (checksum mismatch)

---

## Tech stack

| Layer        | Technology                                            |
| ------------ | ---------------------------------------------------- |
| Frontend     | React 18, Vite 5, TypeScript, Tailwind CSS, Framer Motion |
| Data         | TanStack Query, React Hook Form, Zod                  |
| Routing      | React Router v6 (lazy loading, protected routes)     |
| UI           | Custom shadcn-style primitives, Lucide icons          |
| Backend      | Node.js, Express, TypeScript                          |
| Database     | PostgreSQL (Supabase) with row-level security          |
| Auth         | Supabase email/password (JWT, session management)      |
| QR           | `qrcode` + `qrcode.react` (HMAC-SHA256 signed)         |
| Future chain | Stellar SDK (Phase 5)                                 |
| Future store | Cloudinary (Phase 5+)                                 |

---

## Project structure

```
farmerpay/
├── src/                       # Frontend
│   ├── api/                   # API client + Supabase client
│   ├── components/
│   │   ├── layouts/           # Navbar, Footer, PublicLayout, DashboardLayout
│   │   └── ui/                # Reusable design-system primitives
│   ├── constants/             # App-wide constants (routes, labels, keys, query keys)
│   ├── contexts/              # AuthContext, ThemeContext
│   ├── hooks/                 # useDashboardRedirect
│   ├── pages/                 # Route-level views
│   │   ├── auth/              # Login, Register, Forgot/Reset Password, Verify Email
│   │   ├── dashboards/        # Role dashboards + sub-routes
│   │   │   ├── admin/         # AdminUsersPage
│   │   │   ├── agriculture/   # Farms, Products, Harvests, Batches, BatchPassport
│   │   │   └── settings/      # ProfileSettings, SecuritySettings
│   ├── services/              # Domain service layer (auth, agricultural, qr, passport)
│   ├── store/                 # Query client
│   ├── types/                 # Shared TypeScript types
│   └── utils/                 # Helpers (cn, formatters, env)
├── server/                    # Backend (Express + TS)
│   └── src/
│       ├── config/            # env + Prisma config
│       ├── controllers/       # Route controllers
│       ├── middleware/        # validate, errorHandler, notFoundHandler
│       ├── models/            # Zod schemas (request models)
│       ├── repositories/      # Prisma access isolation
│       ├── routes/            # Express routers
│       ├── services/          # Business logic
│       └── utils/             # Errors, env schema
├── supabase/
│   └── migrations/            # SQL migrations (agricultural, auth, passport/QR domains)
├── prisma/
│   └── schema.prisma          # Full data model (current + future tables)
├── .env.example               # Environment variable template
└── README.md
```

### Folder responsibilities

- **`components/ui`** — stateless design-system primitives. No business logic, no data fetching.
- **`components/layouts`** — structural chrome (navbar, sidebar, footer) shared across routes.
- **`contexts`** — cross-cutting state (auth session, theme) provided via React context.
- **`services`** — one service per domain; the only place that calls the API client or Supabase.
- **`api`** — the HTTP transport + Supabase client; services depend on it, components never do.
- **`repositories` (backend)** — isolates Prisma so services stay testable and framework-agnostic.
- **`models` (backend)** — Zod schemas that validate request bodies at the boundary.

---

## Architecture diagram

```
┌───────────────────────────── FRONTEND (Vite + React) ─────────────────────────────┐
│                                                                                   │
│   Route (React Router)                                                            │
│     ├── PublicLayout ── Landing / About / Features / How / Contact / Verify       │
│     ├── GuestRoute ──── Login / Register / Forgot / Reset / Verify Email          │
│     └── ProtectedRoute ── DashboardLayout                                        │
│                              ├── /dashboard/farmer    (role: FARMER)               │
│                              ├── /dashboard/wholesaler (role: WHOLESALER)         │
│                              ├── /dashboard/retailer  (role: RETAILER)            │
│                              └── /dashboard/admin     (role: ADMIN)               │
│                                                                                   │
│   ErrorBoundary wraps the entire router                                           │
│   Contexts: AuthContext · ThemeContext     Query: TanStack Query Client           │
│   Components: ui/* (primitives) · layouts/* (chrome)                              │
│   Services ──► api/client + supabase ──► Supabase (Postgres + Auth)               │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌───────────────────────────── SUPABASE (PostgreSQL + Auth) ─────────────────────────┐
│                                                                                   │
│   Auth:     Supabase email/password (JWT sessions)                                │
│   RLS:      Every table has row-level security — users see only their own data     │
│                                                                                   │
│   Domain tables:                                                                  │
│     Auth:         profiles · audit_logs · notification_preferences               │
│     Agricultural: farms · products · product_categories · harvests              │
│                  batches · batch_images · certifications                         │
│     Passport/QR:  qr_codes · qr_code_downloads · qr_scan_logs                   │
│                   digital_passports                                              │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
                                         │ (Phase 5)
                                         ▼
┌───────────────────────────── STELLAR (Phase 5) ───────────────────────────────────┐
│   Wallets · Payment settlement · On-chain provenance anchors                      │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## Installation

### Prerequisites

- Node.js 18+

### 1. Clone & install frontend

```bash
npm install
cp .env.example .env   # Supabase credentials are pre-populated
```

### 2. Backend setup (optional — for local Express API)

```bash
cd server
npm install
cp ../.env.example .env # set DATABASE_URL + JWT_SECRET
npm run db:generate
npm run db:push         # or: npm run db:migrate
npm run dev
```

### 3. Run the frontend

```bash
npm run dev
```

The app runs on `http://localhost:5173`. Supabase is provisioned and credentials are pre-populated in `.env`.

---

## Development guide

- **Adding a page:** create `src/pages/MyPage.tsx`, export it, lazy-import it in `src/App.tsx`, and add a route. Use `ProtectedRoute` for authed routes, `GuestRoute` for auth pages.
- **Adding a UI primitive:** add to `src/components/ui/`, export from `src/components/ui/index.ts`. Keep it stateless and composable.
- **Adding a service:** add a domain object to `src/services/` that calls the Supabase client. Components consume services, never the client directly.
- **Adding a backend route:** define a Zod schema in `models/`, a controller in `controllers/`, wire it in `routes/`. Keep Prisma calls in `repositories/`.
- **Database migrations:** use the Supabase MCP `apply_migration` tool for DDL. Never use raw SQL outside that tool.

### Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the Vite dev server            |
| `npm run build`     | Build for production                 |
| `npm run typecheck` | Run TypeScript without emitting     |
| `npm run lint`      | Lint the frontend                    |
| `npm run preview`   | Preview the production build         |

---

## User roles

| Role        | Authenticates | Dashboard              | Purpose                                   |
| ----------- | :-----------: | ---------------------- | ----------------------------------------- |
| Farmer      | ✅            | `/dashboard/farmer`    | Register harvests, mint traceable batches  |
| Wholesaler  | ✅            | `/dashboard/wholesaler`| Acquire & redistribute bulk batches        |
| Retailer    | ✅            | `/dashboard/retailer`  | Receive batches, expose consumer scans     |
| Admin       | ✅            | `/dashboard/admin`     | Govern network, manage participants        |
| Consumer    | ❌            | (public verify page)  | Scan QR to verify the full custody chain   |

---

## Digital Product Passport — how it supports the future

The Digital Product Passport is designed as a **permanent identity layer** that future phases build on top of:

### Ownership transfers (Phase 5)

The batch ID and QR never change — they are the immutable anchor. When custody transfers from farmer → wholesaler → retailer, only the `currentHolder` field and the ownership timeline update. The passport's `passportData` JSON column is extensible: new transfer events append to the timeline without invalidating the QR. Consumers scanning the same QR see the updated custody chain instantly.

### Batch lineage (Phase 5+)

Because every batch has a globally unique, immutable ID, parent-child relationships can be tracked. A wholesaler splitting a bulk batch into sub-batches creates new batch IDs that reference the parent's ID in their `metadata`. The passport's timeline placeholder will render the full lineage tree — scan any child batch and trace back to the original farm.

### Blockchain anchoring (Phase 5)

The QR's HMAC signature and checksum already provide off-chain integrity. Phase 5 will anchor the batch ID, signature, and a SHA-256 hash of the passport data on the Stellar ledger as an immutable provenance record. The `digital_passports` table has a `blockchain_anchor` placeholder column ready. Verification will check both the off-chain signature and the on-chain anchor, giving consumers cryptographic proof that the passport was not tampered with after minting.

### Consumer transparency (ongoing)

The public `/verify/{BatchID}` page requires no login and renders the full passport in an Apple Wallet-style premium UI. As future phases add ownership transfers, blockchain anchors, and payment records, the same page will surface them progressively — the consumer sees exactly what they need: where the product came from, who handled it, and whether it's verified. The scan log table already records every consumer interaction, giving farmers and admins insight into verification engagement without compromising privacy (IPs are hashed, never stored raw).

---

## Security posture

- Helmet security headers, CORS allow-list, and rate limiting on the backend
- Zod input validation at every request boundary
- Row-level security on every Supabase table — users can only access their own data
- QR codes are HMAC-SHA256 signed with a server secret — tampered payloads fail verification
- IP addresses are SHA-256 hashed before storage in scan logs — raw IPs are never persisted
- Secrets live only in environment variables — never committed
- `ErrorBoundary` catches render errors and shows a recovery UI
- Auth context is the single source of truth for session state; protected routes gate every dashboard

---

## What's next (Phase 5)

1. Integrate the Stellar SDK for wallet creation and instant settlement
2. Implement ownership transfers with signed custody handoff
3. Anchor passport data on the Stellar ledger for on-chain provenance
4. Add Cloudinary for certification document and batch image storage
5. Build batch splitting with parent-child lineage tracking

---

© FarmerPay, Inc. "Trust Every Harvest."
