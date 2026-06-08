# 🐔 AAPM - Internal Development Notes & Business Logic

> **Note for Cursor AI:** This file contains strict constraints, business rules, and validation bounds for the Agung Petelur Management System (AAPM). Always cross-reference this file before writing or refactoring any API routes, Prisma queries, or Zod/Form schemas.

---

## 🔐 Domain 1: Auth & Multi-Tenant (Better-Auth)
- **Subdomain Isolation:** All queries for transactional data (`DailyProduction`, `FeedConsumption`, `SalesOrder`, etc.) MUST include a strict `where: { subdomain_id }` check extracted from the verified session.
- **Tenant Context:** All multi-tenant API routes must validate the incoming header `active_subdomain_id` or query parameters against the user's active session before returning or writing any data.
- **Role Permissions (RBAC):**
  - `superadmin`: Access to global system setup and cross-subdomain tenant management.
  - `admin`: Full management of a specific subdomain's master data, inventory, and finance.
  - `staff`: Primary client is **React Native + Expo** mobile app. Admin dashboard access may be limited per deployment policy.

---

## 🏗️ Domain 2: Master Data & Infrastructure
- **Cage Deletion Safety:** A `Cage` cannot be deleted if it has an active or historic `CycleSetting` tied to it (`onDelete: Restrict` level logic in backend middleware).
- **Standardisasi Tipe Kandang (`cage_type`):** Jangan gunakan text-input bebas. Form UI wajib menggunakan dropdown dengan preset standard industri: `Closed House (Battery)`, `Open House (Battery)`, `Open House (Floor/Postal)`, dan `Lainnya`. 
- **Rasionalisasi:** Mencegah kontaminasi data string di database agar kalkulasi otomatis Modul Analytics (HDP & FCR) tidak mengalami deviasi/error saat membandingkan performa antar tipe infrastruktur kandang.
- **Active Cycle Constraint:** A single `Cage` can only have ONE cycle with `status: "Active"` at any given timestamp. Initiating a new cycle requires explicitly closing or archiving the previous one.
  - additional: only active `cage` can create a cycle. Inactive cage cannot create a cycle.
- **QR Identifiers:** QR codes printed for farm gates contain a URL wrapping the unique UUID of the `Cage`. 
  - Mobile deep link (Expo): `aapm://kandang/[cage_id]/produksi` or agreed universal link — **not** a Next.js route in this repo.

---

## 🥚 Domain 3: Operasional Kandang & Mobile Forms (Offline-First, Expo)
- **Mobile form bounds (Egg Production)** — validate in API + `features/*/schemas`; UI in Expo app:
  - `quantity` (Jumlah Telur Layak) and `weight` (Total Berat) inputs MUST NOT accept negative values.
  - Max egg count per single entry is capped at `10,000` to prevent catastrophic accidental typos by staff.
  - `egg_crack` (Jumlah Telur Pecah) must be tracked explicitly and flagged in orange/red accents if it exceeds 5% of the total harvest entry.
- **Feed Consumption Bounds:**
  - `quantity` (Jumlah Pakan Diberikan) must be validation-checked against current `InventoryStock` levels. If stock drops below `min_stock_alert`, immediately trigger a Sonner toast warning.
- **Mortalitas / Population Mutation:**
  - Recording any number of dead chickens (`mutation_type: "Mortalitas"`) must immediately decrement the active flock size tracked in the active `CycleSetting`.
- **Sync Queue Engine (`SyncQueue`):**
  - Mobile app queues payloads locally when offline; flush to API / `SyncQueue` when online. Admin repo exposes API — no service worker.

---

## 💼 Domain 4: Finansial, Sales, & Opex
- **Standalone Constraint:** The application acts as a standalone ledger. There is NO third-party payment gateway integration. All sales entries default to a `status: "Paid"` or `status: "Pending/Term"` checked manually by the admin.
- **Cashflow Integrity:** Every inventory procurement purchase order (`PurchaseOrder`) marked as `Paid` must automatically generate a matching outbound transaction inside `CashflowTransaction` mapped under the correct `OpexCategory`.

---

## 🎨 Global UI/UX Constraints
- **Sonner (admin web only):** `position="top-center"`, theme-aware via `@/components/ui/sonner`.
- **Mobile touch targets (Expo app):** minimum 44px — not applicable to Next.js admin UI beyond responsive forms.