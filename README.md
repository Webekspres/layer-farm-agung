# Layer Pultry Farm Management: Agung

**Sistem Manajemen Peternakan Ayam Petelur Terintegrasi**

**Layered Farm Agung (AAPM)** is a cloud-based farm management platform split across **two repos**:

| Repo | Role |
|------|------|
| **layered-farm-agung** (this) | Admin dashboard, API (`/api/v1/*`), database, auth |
| **[aapm-mobile](../mobile-apps/aapm-mobile)** | React Native + Expo app for **staff kandang** |

See **[docs/ecosystem.md](./docs/ecosystem.md)** for architecture and local dev workflow.

The platform supports **population monitoring**, **production efficiency** (HDP, FCR), master data, inventory, and finance — with mobile offline input handled outside this repo.

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
| **Mobile (lapangan)** | **[aapm-mobile](../mobile-apps/aapm-mobile)** — React Native + Expo SDK 54 |

---

## Features & modules

The product is organized around **thirteen functional modules** that together cover master data, daily operations, compliance, and executive insight.

| # | Module | Purpose |
|---|--------|---------|
| 1 | **Centralized User Management** | Accounts, roles, and permissions with RBAC (Superadmin, Admin, Staff) and audit-friendly access patterns. |
| 2 | **Master Data Peternakan** | Canonical farm structure: sites, houses, batches, and operational parameters used across the system. |
| 3 | **Master Strain & Standardisasi** | Strain catalogs, breed standards, and target curves (production, feed, weight) for benchmarking and reporting. |
| 4 | **Front Office Mobile (Expo)** | Native mobile UI for field data entry — **not in this repo**. |
| 5 | **Offline Sync Engine** | Local queues on mobile; `SyncQueue` + API in this backend repo. |
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

| Document | Purpose |
|----------|---------|
| **[DESIGN.md](./DESIGN.md)** | Brand & UI source of truth (colors, typography, components, copy) |
| **[AGENTS.md](./AGENTS.md)** | Architecture, auth, testing, and agent conventions |
| **[docs/sitemap.md](./docs/sitemap.md)** | Route map, module targets, and implementation progress |
| **[docs/README.md](./docs/README.md)** | What to commit in `docs/` (MD yes, PDF/Office no) |
| **`.cursor/rules/`** | Detailed Cursor rules (master-data tables, Tailwind v4, etc.) |

### Prerequisites

- **Bun** (package manager and test runner)
- **Docker** (recommended) for PostgreSQL + MinIO locally
- **Node.js** LTS (used by Next.js toolchain)
- Copy [`.env.example`](./.env.example) → `.env` and set secrets

### Local database (hybrid — recommended)

PostgreSQL runs in **Docker on host port `5433`** so it does not conflict with a system Postgres on `5432`.

| Context | `DATABASE_URL` host |
|---------|---------------------|
| **`bun run dev` on your machine** | `127.0.0.1:5433` |
| **App inside `docker compose`** | `db:5432` (service name) |

Use **`127.0.0.1`**, not `localhost`, to avoid IPv6 hitting the wrong server on Windows.

```bash
bun install
cp .env.example .env          # edit BETTER_AUTH_SECRET

bun run docker:db             # Postgres on localhost:5433
bun run db:generate
bun run db:migrate
bun run db:seed               # optional sample data

bun run dev
```

One-liner (DB + MinIO + dev): `bun run hybrid`

**Verify DB** (optional):

```bash
docker exec layerfarm-agung-db psql -U layerfarm_user -d layerfarm_agung_db -c "SELECT 1;"
```

After restarting the DB container, restart `bun dev` so Prisma picks up a fresh connection.

Open [http://localhost:3000](http://localhost:3000) in the browser.

### Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Next.js development server with hot reload |
| `bun run build` | Production build |
| `bun run start` | Run the production server locally |
| `bun run lint` | ESLint |
| `bun test` | Bun unit tests (colocated `*.test.ts`) |
| `bun run db:seed` | Seed roles, permissions, sample master data |
| `bun run docker:db` | Start PostgreSQL only (host port **5433**) |
| `bun run hybrid` | Docker services + Prisma generate + `dev` |

### Conventions

- Prefer **Server Actions** for mutations that must run on the server with clear validation (**Zod**).
- Use **TanStack Query** for server state on the client; use **Zustand** for UI and cross-cutting client state that is not server-sourced.
- Keep RBAC checks close to the action or route boundary so permissions stay consistent.
- **No PWA/Serwist** in this repo. Mobile field ops use **React Native + Expo** calling **`/api/v1/*`** (see `AGENTS.md` and `docs/sitemap.md`).

### Deployment notes

- Deploy the Next.js app to your chosen host (e.g. **Vercel**, container platform, or VM) with `DATABASE_URL` and production auth settings.
- Run `prisma migrate deploy` against the production database as part of your release process.

---

## License

This project is **private** and proprietary unless otherwise stated by the rights holder.
