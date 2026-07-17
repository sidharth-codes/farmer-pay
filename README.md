# FarmerPay — "Trust Every Harvest."

> Blockchain-powered agricultural traceability and instant secure payments on the Stellar network.

FarmerPay traces agricultural products from farmer to consumer and settles payments the moment custody changes hands. Every batch carries a verifiable QR identity; every ownership transfer is cryptographically signed and anchored on-chain.

---

## Phase 1 scope

Phase 1 builds the **production-ready foundation** that every later phase extends. It deliberately ships **no** business logic, blockchain, QR, or payment code — only the architecture, routing, design system, auth structure, and database schema.

**Included**

- React + Vite + TypeScript frontend with a premium, accessible, dark-mode-ready design system
- Full routing with lazy loading, protected routes, and role-based access
- Auth context (mock session in Phase 1; JWT-ready), theme context, TanStack Query client
- Reusable UI component library (Button, Card, Modal, Table, Pagination, Search, Avatar, etc.)
- Public pages: Landing, About, Features, How It Works, Contact, public QR Verify
- Auth pages: Login, Register, Forgot Password
- Role dashboards: Farmer, Wholesaler, Retailer, Admin (+ shared sub-routes)
- Error pages: 404, 403, 500
- Express + TypeScript backend scaffold (Helmet, CORS, rate limiting, Zod validation)
- Prisma schema covering current and future tables
- API client + service layer (typed, Phase 2-ready)

**Not included (by design — arrives in later phases)**

- Stellar SDK integration (Phase 2)
- QR minting & verification logic (Phase 2)
- Payment/settlement logic (Phase 2)
- Batch custody ledger (Phase 2)
- Cloudinary storage (Phase 2+)

---

## Tech stack

| Layer        | Technology                                            |
| ------------ | ---------------------------------------------------- |
| Frontend     | React, Vite, TypeScript, Tailwind CSS, Framer Motion |
| Data         | TanStack Query, React Hook Form, Zod                  |
| Routing      | React Router v6 (lazy loading, protected routes)     |
| UI           | Custom shadcn-style primitives, Lucide icons          |
| Backend      | Node.js, Express, TypeScript                          |
| Database     | PostgreSQL via Prisma ORM                             |
| Auth         | JWT + bcrypt (structure in place; mock session now)   |
| Future chain | Stellar SDK                                          |
| Future store | Cloudinary                                           |

---

## Project structure

```
farmerpay/
├── src/                       # Frontend
│   ├── api/                   # API client + request layer
│   ├── assets/                # Static assets
│   ├── components/
│   │   ├── layouts/           # Navbar, Footer, PublicLayout, DashboardLayout
│   │   └── ui/                # Reusable design-system primitives
│   ├── constants/             # App-wide constants (routes, labels, keys)
│   ├── contexts/              # AuthContext, ThemeContext
│   ├── hooks/                 # Reusable hooks
│   ├── pages/                 # Route-level views
│   │   ├── auth/              # Login, Register, Forgot Password
│   │   └── dashboards/        # Role dashboards + sub-routes
│   ├── services/              # Domain service layer (typed API calls)
│   ├── store/                 # Query client
│   ├── types/                 # Shared TypeScript types
│   └── utils/                 # Helpers (cn, formatters, env)
├── server/                    # Backend
│   └── src/
│       ├── config/            # env + Prisma config
│       ├── controllers/       # Route controllers
│       ├── middleware/        # validate, errorHandler, notFoundHandler
│       ├── models/            # Zod schemas (request models)
│       ├── repositories/      # Prisma access isolation
│       ├── routes/            # Express routers
│       ├── services/          # Business logic
│       └── utils/             # Errors, env schema
├── prisma/
│   └── schema.prisma          # Full data model (current + future tables)
├── .env.example               # Environment variable template
└── README.md
```

### Folder responsibilities

- **`components/ui`** — stateless design-system primitives. No business logic, no data fetching.
- **`components/layouts`** — structural chrome (navbar, sidebar, footer) shared across routes.
- **`contexts`** — cross-cutting state (auth session, theme) provided via React context.
- **`services`** — one service per domain; the only place that calls the API client.
- **`api`** — the HTTP transport; services depend on it, components never do.
- **`repositories` (backend)** — isolates Prisma so services stay testable and framework-agnostic.
- **`models` (backend)** — Zod schemas that validate request bodies at the boundary.

---

## Architecture diagram

```
┌───────────────────────────── FRONTEND (Vite + React) ─────────────────────────────┐
│                                                                                   │
│   Route (React Router)                                                            │
│     ├── PublicLayout ── Landing / About / Features / How / Contact / Verify       │
│     ├── GuestRoute ──── Login / Register / Forgot Password                        │
│     └── ProtectedRoute ── DashboardLayout                                        │
│                              ├── /dashboard/farmer    (role: FARMER)               │
│                              ├── /dashboard/wholesaler (role: WHOLESALER)         │
│                              ├── /dashboard/retailer  (role: RETAILER)            │
│                              └── /dashboard/admin     (role: ADMIN)               │
│                                                                                   │
│   Contexts: AuthContext · ThemeContext     Query: TanStack Query Client           │
│   Components: ui/* (primitives) · layouts/* (chrome)                              │
│   Services ──► api/client ──► (Phase 2) Express API                               │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
                                         │ HTTP (JSON, JWT)
                                         ▼
┌───────────────────────────── BACKEND (Express + TS) ──────────────────────────────┐
│                                                                                   │
│   Helmet · CORS · Rate Limit · JSON body parser                                   │
│   Routes ──► Controllers ──► Services ──► Repositories ──► Prisma                 │
│   Middleware: validate (Zod) · errorHandler · notFoundHandler                      │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
                                         │ Prisma Client
                                         ▼
┌───────────────────────────── DATABASE (PostgreSQL) ───────────────────────────────┐
│                                                                                   │
│   Phase 1:  User · Profile · UserRole                                             │
│   Phase 2:  Product · ProductBatch · OwnershipHistory · BatchSplit               │
│             Wallet · Payment · QRVerification                                     │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
                                         │ (Phase 2)
                                         ▼
┌───────────────────────────── STELLAR (Phase 2) ───────────────────────────────────┐
│   Wallets · Payment settlement · On-chain provenance anchors                      │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or a hosted instance)

### 1. Clone & install frontend

```bash
npm install
cp .env.example .env   # adjust VITE_API_URL
```

### 2. Backend setup

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

The app runs on `http://localhost:5173`; the API on `http://localhost:4000`.

---

## Development guide

- **Adding a page:** create `src/pages/MyPage.tsx`, export it, lazy-import it in `src/App.tsx`, and add a route. Use `ProtectedRoute` for authed routes, `GuestRoute` for auth pages.
- **Adding a UI primitive:** add to `src/components/ui/`, export from `src/components/ui/index.ts`. Keep it stateless and composable.
- **Adding a service:** add a domain object to `src/services/index.ts` that calls `apiClient`. Components consume services, never the client directly.
- **Adding a backend route:** define a Zod schema in `models/`, a controller in `controllers/`, wire it in `routes/`. Keep Prisma calls in `repositories/`.
- **Schema changes:** edit `prisma/schema.prisma`, then `npm run db:generate && npm run db:push`.

### Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Type-check + build for production    |
| `npm run typecheck` | Run TypeScript without emitting    |
| `npm run lint`    | Lint the frontend                    |
| `cd server && npm run dev` | Start the Express API         |

---

## User roles

| Role        | Authenticates | Dashboard              | Purpose                                   |
| ----------- | :-----------: | ---------------------- | ----------------------------------------- |
| Farmer      | ✅            | `/dashboard/farmer`    | Register harvests, receive instant pay    |
| Wholesaler  | ✅            | `/dashboard/wholesaler`| Acquire & redistribute bulk batches        |
| Retailer    | ✅            | `/dashboard/retailer`  | Receive batches, expose consumer scans     |
| Admin       | ✅            | `/dashboard/admin`     | Govern network, manage participants        |
| Consumer    | ❌            | (public verify page)  | Scan QR to verify the full custody chain   |

---

## Security posture (Phase 1)

- Helmet security headers, CORS allow-list, and rate limiting on the backend
- Zod input validation at every request boundary
- Secrets live only in environment variables — never committed
- `asChild` button pattern avoids raw `Link` className collisions
- Auth context is the single source of truth for session state; protected routes gate every dashboard

---

## What's next (Phase 2)

1. Replace the mock auth session with real JWT + bcrypt against the Express API
2. Integrate the Stellar SDK for wallet creation and instant settlement
3. Implement QR minting and the public verification lookup against on-chain data
4. Build the batch custody ledger (OwnershipHistory) with signed transfers
5. Add Cloudinary for certification document storage

---

© FarmerPay, Inc. "Trust Every Harvest."
