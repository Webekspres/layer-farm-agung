# Agent guide — Layered Farm Agung

Instructions for AI coding agents and contributors working in this repository. **Brand and UI tokens** are defined in **[DESIGN.md](./DESIGN.md)** — treat that file as the source of truth for look-and-feel; do not invent colors, fonts, or product naming.

Detailed Cursor rules live in **`.cursor/rules/`** (architecture, naming, auth, Tailwind v4, master-data tables, testing). This document summarizes what matters every session.

---

## Project snapshot

| | |
|--|--|
| **Product** | Layered Farm Agung — PWA manajemen peternakan ayam petelur |
| **Stack** | Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui, Prisma 7, PostgreSQL, Better Auth, Bun |
| **Package manager** | **Bun** (`bun install`, `bun run dev`, `bun test`) |
| **Locale** | UI copy in **Bahasa Indonesia** |

---

## Next.js (read before coding)

<!-- BEGIN:nextjs-agent-rules -->

This is **not** the Next.js from older training data. APIs and conventions may differ (Next.js 16).

Before using routing, caching, or Server Actions APIs, read the relevant guide under `node_modules/next/dist/docs/` and follow deprecation notices.

<!-- END:nextjs-agent-rules -->

- Route protection: root **`proxy.ts`** (not `middleware.ts`).
- Route groups: `(authentication)`, `(dashboard)`.
- Mutations: **Server Actions** in `features/*/actions/` with Zod validation.

---

## Architecture (feature-based)

Do **not** add domain logic under `lib/` or heavy UI under `app/`.

| Location | Purpose |
|----------|---------|
| `app/` | Routes only: `page`, `layout`, `loading`, `error`, API routes, `globals.css` |
| `features/[name]/` | Domain: `components/`, `actions/`, `services/`, `schemas/`, `lib/`, `config/`, `server/`, `client/` |
| `components/ui/` | shadcn primitives — minimal edits |
| `components/shared/` | Cross-feature UI (e.g. `action-feedback.ts`) |
| `components/layout/` | Shell: sidebar, header, tenant switcher |
| `lib/` | Infra only: `prisma.ts`, `utils.ts` (`cn`) |

**Dependency flow:** `app` → `features` → `components` → `lib` (never `lib` → `features`).

**Placement checklist**

1. Multiple domains → `components/shared/` or `components/layout/`
2. Single feature → `features/[name]/components/`
3. Mutation → `features/[name]/actions/`
4. DB/query helper → `features/[name]/services/`

---

## Naming & files

- TS: `camelCase`; types `PascalCase`; config constants `UPPER_SNAKE_CASE` or `camelCase`.
- Files: `kebab-case.tsx` / `kebab-case.ts`; export components as `PascalCase`.
- Imports: `@/` alias only.

---

## Auth & permissions

- **Better Auth**: `features/auth/server/auth.ts`; API `app/api/auth/[...all]/route.ts`.
- Session: `getServerSession`, `hasPermission` in `features/auth/lib/session.ts`.
- **No public signup** — users created by admin.
- Login: username or email.
- **UI gates**: `hasPermission(session, "permission_name")` — do not hardcode role names in components.
- **Tenant scope**: operational data filtered by tenant / `getActiveSubdomainId(session)` where applicable.
- Server actions: put `redirect()` **outside** `try/catch`.

Env: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`.

---

## Master data & RBAC (Domain 2 pattern)

| Permission | Scope |
|------------|--------|
| `manage_master_data` | Tenant: lokasi, kandang, vendor |
| `manage_global_catalog` | Superadmin only: strain, grade telur |

- Global catalog pages: `requireManageGlobalCatalogSession()`.
- List pages: **server-side** search (`?q=`, ~350ms debounce) + URL filters; `list-*.ts` + `parse-*-filters.ts` + `*-toolbar.tsx`; `<Suspense>` around management UI.
- Full checklist: `.cursor/rules/master-data-tables.mdc`.

---

## UI, styling & feedback

Follow **[DESIGN.md](./DESIGN.md)** for tokens, typography, and brand copy.

**Tailwind v4**

- Theme in `app/globals.css` only — **no** `tailwind.config.ts`.
- Use semantic classes: `bg-primary`, `text-muted-foreground`, `border-border`, `bg-sidebar`, etc.
- Dark mode: `.dark` class via `next-themes`.

**Toasts (CRUD)**

- Root: `@/components/ui/sonner` in `app/layout.tsx`.
- Server action results:
  - `useActionFeedback(state, { successMessage, onSuccess, when })` with `useActionState`
  - `notifyActionResult(result, { success: "..." })` for imperative calls (`startTransition`)
- Prefer toast for success; keep `FieldError` for inline form errors.

**shadcn**

- Add: `bunx shadcn@latest add [component]`
- Dialogs: use `dialog-shell*` utilities from `globals.css`.

---

## Testing

- Runner: **Bun** — `bun test`; files colocated: `foo.test.ts` next to `foo.ts`.
- **Do not** use Jest/Vitest.
- **Category A (test):** RBAC, tenant scoping, auth provisioning, inventory/stock math, financial/production calcs.
- **Category B (skip):** shadcn primitives, static layout, thin pass-through actions.

See `.cursor/rules/testing-standards.mdc`.

---

## Common commands

```bash
bun install
bun run dev              # development
bun test                 # unit tests
bun run db:migrate       # Prisma migrate dev
bun run db:seed          # seed permissions & sample data
bun run db:generate      # Prisma client
bun run lint             # ESLint
```

Docker hybrid: `bun run hybrid` (services + generate + dev).

---

## Agent workflow

1. Read **DESIGN.md** before UI changes; read **`.cursor/rules/`** for the task domain.
2. Match existing patterns in the nearest `features/[name]/` module.
3. Minimize diff scope — no drive-by refactors.
4. After Category A logic changes, add or update colocated tests.
5. New master-data list pages: search + filters per `master-data-tables.mdc`.
6. Wire CRUD feedback with `action-feedback` + Indonesian success messages.
7. Do not commit unless the user asks.

---

## Domain roadmap (context only)

Implemented in phases: **Domain 1** identity/RBAC/tenants/users; **Domain 2** master data (locations, cages, strains, grades, vendors); **Domain 3+** production, inventory, PWA field input, offline sync — see `README.md`.

When adding nav items, update `features/dashboard/config/navigation.ts` and `features/permissions/config/wired-permissions.ts`, then seed.

---

## Related files

| Doc / path | Contents |
|------------|----------|
| [DESIGN.md](./DESIGN.md) | Brand, colors, type, components, toasts |
| [README.md](./README.md) | Product modules, schema overview |
| `.cursor/rules/*.mdc` | Full rules for Cursor |
| `prisma/schema.prisma` | Data model |
| `app/globals.css` | Design tokens (implementation) |
