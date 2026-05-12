# Layer Farm Management: Agung

**Sistem Manajemen Peternakan Ayam Petelur Terintegrasi**

AyamAgung is a cloud-based **Progressive Web App (PWA)** built to digitize layer-farm operations end to end. The platform supports **population monitoring**, **production efficiency** tracking (including **HDP** and **FCR**), and **hybrid access** so teams can work in the field or office with **offline-first input** and **synchronization** when connectivity returns.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Features & modules](#features--modules)
3. [Database schema overview](#database-schema-overview)
4. [Development guidelines](#development-guidelines)
5. [License](#license)

---

## Tech stack

| Layer | Technology |
|--------|------------|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) App Router |
| **Styling & UI** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) · [shadcn/ui](https://ui.shadcn.com/) · ![Lucide](https://img.shields.io/badge/Lucide-000000?style=flat-square&logo=lucide&logoColor=white) |
| **Backend / API** | Next.js **Server Actions** |
| **ORM** | ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white) — **29 models** across **4 domains** |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) |
| **Authentication** | **Better Auth** with **RBAC** (Superadmin, Admin, Staff) |
| **State** | **Zustand** |
| **Data fetching** | **TanStack Query** |
| **Validation & forms** | **Zod** · **React Hook Form** |
| **PWA** | **Serwist** (service worker, caching, offline shell) |

---

## Features & modules

The product is organized around **thirteen functional modules** that together cover master data, daily operations, compliance, and executive insight.

| # | Module | Purpose |
|---|--------|---------|
| 1 | **Centralized User Management** | Accounts, roles, and permissions with RBAC (Superadmin, Admin, Staff) and audit-friendly access patterns. |
| 2 | **Master Data Peternakan** | Canonical farm structure: sites, houses, batches, and operational parameters used across the system. |
| 3 | **Master Strain & Standardisasi** | Strain catalogs, breed standards, and target curves (production, feed, weight) for benchmarking and reporting. |
| 4 | **Front Office PWA (Mobile Input)** | Field-optimized UI for fast, reliable data entry on phones and tablets. |
| 5 | **Offline Sync Engine** | Local queues, conflict-safe sync, and reconciliation when the device reconnects to the cloud. |
| 6 | **Mutasi Populasi** | Mortality, transfers, grading, and other population movements with full traceability. |
| 7 | **Vendor & Procurement** | Suppliers, purchase orders, receipts, and cost attribution to flocks or cost centers. |
| 8 | **Inventory Control** | Feed, medicine, packaging, and spare parts with stock levels, movements, and alerts. |
| 9 | **Early Warning System** | Rule-based and trend-based alerts (production drop, mortality spike, feed deviation, etc.). |
| 10 | **Executive Dashboard** | KPIs, HDP/FCR, comparisons across houses or periods, and export-ready summaries. |
| 11 | **Sales Recording** | Orders, deliveries, pricing, and linkage to inventory and cashflow where applicable. |
| 12 | **Cashflow Ledger** | Income, expenses, categories, and period views for operational finance visibility. |
| 13 | **Health / Vaccination Management** | Schedules, administrations, withdrawals, and flock health history. |

---

## Database schema overview

The data model is implemented with **Prisma ORM** on **PostgreSQL** and is designed as **approximately twenty-nine models** grouped into **four logical domains**. Exact table names live in `prisma/schema.prisma` as the project evolves.

| Domain | Scope (representative entities) |
|--------|----------------------------------|
| **1. Identity & access** | Users, sessions, organizations/tenants, roles, permissions, invitations, and audit metadata tied to authentication (**Better Auth** + RBAC). |
| **2. Farm operations** | Farm master data, houses, flocks/batches, strain references, standards, daily production, population mutations, and operational events used for HDP/FCR. |
| **3. Supply chain & inventory** | Vendors, procurement documents, warehouses, stock items, movements, reservations, and links to consumption by flock or period. |
| **4. Commercial, finance & health** | Sales records, pricing, cashflow ledger lines, early-warning signals, dashboard aggregates, vaccination programs, treatments, and health events. |

Cross-domain relationships (for example flock → inventory consumption → ledger) are modeled explicitly so reports remain consistent and traceable.

---

## Development guidelines

### Prerequisites

- **Node.js** (LTS recommended; align with the version used in CI if defined)
- **pnpm**, **npm**, or **yarn** — use one package manager consistently across the team
- **PostgreSQL** for local and deployed databases
- Environment variables for database URL, auth secrets, and any third-party keys (see `.env.example` when available)

### Getting started

```bash
# Install dependencies
npm install

# Copy and edit environment variables
cp .env.example .env

# Generate Prisma Client (after schema is present)
npx prisma generate

# Apply migrations in development
npx prisma migrate dev

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in the browser.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Run the production server locally |
| `npm run lint` | ESLint |

### Conventions

- Prefer **Server Actions** for mutations that must run on the server with clear validation (**Zod**).
- Use **TanStack Query** for server state on the client; use **Zustand** for UI and cross-cutting client state that is not server-sourced.
- Keep RBAC checks close to the action or route boundary so permissions stay consistent.
- For PWA behavior, follow **Serwist** configuration for precaching, runtime caching, and update prompts.

### Deployment notes

- Deploy the Next.js app to your chosen host (e.g. **Vercel**, container platform, or VM) with `DATABASE_URL` and production auth settings.
- Run `prisma migrate deploy` against the production database as part of your release process.

---

## License

This project is **private** and proprietary unless otherwise stated by the rights holder.
