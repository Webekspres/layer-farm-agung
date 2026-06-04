# Design system — Layered Farm Agung

**Source of truth** for brand, visual language, and UI conventions. Implementation lives in `app/globals.css`, `app/layout.tsx`, and `components/ui/*`. Agents and contributors should read this before changing look-and-feel.

---

## Brand identity

| Item | Value |
|------|--------|
| **Product name (UI & metadata)** | Layered Farm Agung |
| **Short context** | Sistem manajemen peternakan ayam petelur terintegrasi |
| **Client / deployment** | Klien Agung Petelur (operasional “Pak Agung”) |
| **UI locale** | Bahasa Indonesia (`lang="id"` on `<html>`) |
| **Tone** | Profesional, jelas, operasional — hindari marketing berlebihan di dalam app |

### Logo & imagery

| Asset | Path | Usage |
|-------|------|--------|
| App logo | `/image/Logo.png` | Login, header, favicon-adjacent branding |
| Login hero | `/image/login-bg-img.jpg` | Split login panel (desktop only) |
| Alternate logo | `/assets/logos/aapm-default.png` | Marketing / exports when needed |

- Prefer **logo + wordmark** “Layered Farm Agung” on auth and shell.
- Hero photography: peternakan / lapangan; overlay gelap tetap agar teks testimonial terbaca (lihat login split).

### Voice & copy

- **Buttons**: verb first — “Simpan”, “Tambah”, “Hapus”, “Masuk”.
- **Empty states**: jelaskan langkah berikutnya (“Belum ada lokasi. Tambah lokasi…”).
- **Errors**: kalimat utuh, tanpa kode teknis ke pengguna (“Gagal menyimpan data.”).
- **Permissions / roles**: tampilkan label ramah (`manage_production` → “manage production” atau terjemahan singkat di badge).
- **Soon / placeholder**: badge “Soon” di nav untuk modul belum aktif — jangan hapus tanpa produk siap.

---

## Color system

Semantic tokens in **OKLCH** — defined in `:root` and `.dark` in `app/globals.css`. **Never** hardcode hex in components when a token exists.

### Brand palette (intent)

| Role | Light | Dark | Intent |
|------|-------|------|--------|
| **Primary** | Green `oklch(0.527 0.154 150)` | Deeper green `oklch(0.448 0.119 151)` | Pertanian, pertumbuhan, aksi utama |
| **Foreground** | Near-black cool | Near-white cool | Teks utama |
| **Background** | White | Deep blue-gray | Halaman |
| **Card / Popover** | White | Elevated blue-gray | Panel, dialog, toast surface |
| **Muted** | Cool gray-green | Dark gray | Secondary text, subtle fills |
| **Destructive** | Red | Softer red | Hapus, error, validasi gagal |
| **Border** | Light gray | White 10% alpha | Divider, inputs |
| **Charts 1–5** | Warm oranges | Same hues | Grafik & peringatan (chart-4 = warning-adjacent) |

### Semantic usage (Tailwind)

```
bg-background text-foreground
bg-card text-card-foreground
bg-primary text-primary-foreground     → CTA, submit, brand emphasis
bg-muted text-muted-foreground         → Secondary UI, descriptions
bg-destructive / text-destructive      → Danger actions & errors
border-border ring-ring
bg-sidebar text-sidebar-foreground     → App shell navigation
```

### Charts & status

- **Success / positive KPI**: primary green or chart-1.
- **Warning / attention**: chart-4 (amber-orange family).
- **Error / critical**: destructive.
- **Neutral / info**: muted + foreground.

---

## Typography

Loaded in `app/layout.tsx`:

| Token | Font | Role |
|-------|------|------|
| `--font-sans` | **Raleway** | Body, UI, tables, forms |
| `--font-heading` | **Instrument Sans** | Page titles, card titles, hero headings |

### Scale & weight

- Page title: `font-heading text-2xl`–`text-3xl font-bold tracking-tight`
- Card title: `font-heading text-base` or `text-lg`
- Body: `text-sm` / `text-base`, `text-muted-foreground` for secondary
- Monospace: permission names, slugs — `font-mono text-sm`
- **Do not** introduce a third font family without updating this doc and `layout.tsx`.

---

## Layout & spacing

### Page shell

- Dashboard content: `@utility page-content` in `globals.css` — responsive padding `p-4` → `xl:p-12`.
- Max width: fluid within sidebar layout; tables `overflow-x-auto` on small screens.

### Radius

- Base `--radius: 0.625rem` (10px).
- Cards, dialogs, inputs: `rounded-lg` / `rounded-xl` aligned with shadcn defaults.
- Derived: `--radius-sm` … `--radius-4xl` via `@theme inline`.

### Elevation

- Cards: `border border-border/80 shadow-sm`
- Dialogs: default shadcn overlay + `dialog-shell` utilities for scrollable body
- Toasts: `shadow-md` via Sonner wrapper

### Dialog patterns (admin CRUD)

Use utilities from `globals.css`:

- `dialog-shell` — default form dialog
- `dialog-shell-wide` — wide forms (e.g. user edit)
- `dialog-shell-sm` — confirm delete
- `dialog-header-padding`, `dialog-body-scroll`, `dialog-footer-padding`

---

## Dark mode

- **Mechanism**: `next-themes`, `attribute="class"`, `.dark` on `<html>`.
- **Rule**: every new surface must work in both themes using semantic tokens only.
- **Sonner**: `--sonner-*` tokens in `globals.css` mirror popover/card/destructive/primary per theme.
- **Login hero**: fixed dark gradient overlay — not tied to theme toggle (intentional).

---

## Components

### Stack

- **shadcn/ui** primitives in `components/ui/` — add via `bunx shadcn@latest add [component]`.
- **Lucide** icons, `size-4` default in buttons.
- Compose feature UI in `features/*/components/`, not raw primitives in `app/`.

### Buttons

| Variant | Use |
|---------|-----|
| `default` | Primary submit |
| `outline` | Secondary / cancel adjacent |
| `ghost` | Icon actions in tables |
| `destructive` | Confirm delete |

Loading: `<Loader2 className="size-4 animate-spin" />` + disabled state.

### Tables (master data)

- Toolbar: search (debounced URL `?q=`) + domain filters — see `.cursor/rules/master-data-tables.mdc`.
- Header row: `bg-muted/40`
- Empty: centered `text-muted-foreground`, distinguish filter vs no data.

### Feedback (toasts)

- **Library**: Sonner via `@/components/ui/sonner` (theme-aware).
- **CRUD**: `useActionFeedback` / `notifyActionResult` from `@/components/shared/action-feedback`.
- **Success**: short Indonesian past tense — “Lokasi berhasil ditambahkan.”
- **Errors**: server message as-is; keep `FieldError` inline on forms for field-level context.
- **Position**: `top-center` in root layout (adjust only here).

### Forms

- Labels: `Field` + `FieldLabel` from shadcn field pattern.
- Validation: Zod → server action → `{ error?, success? }`.
- Disable inputs while `isPending`.

---

## Iconography

- **Navigation**: Lucide, one icon per item (`features/dashboard/config/navigation.ts`).
- **Semantic**: Building2 (tenant), MapPin (lokasi), Layers (kandang), Egg (produksi), etc.
- **Size**: `size-4` inline; `size-5`–`size-6` for empty states sparingly.

---

## Accessibility & motion

- Focus: `outline-ring/50` on interactive elements (base layer in `globals.css`).
- Prefer visible labels; `aria-label` on icon-only buttons.
- `disableTransitionOnChange` on theme provider — avoid flash; respect reduced motion for custom animations.

---

## What not to do

- Do **not** add `tailwind.config.ts` — Tailwind v4 is CSS-first (`tailwind-v4` rule).
- Do **not** use raw green/red hex — use `primary`, `destructive`, `chart-*`.
- Do **not** put business logic in CSS.
- Do **not** duplicate success text inline when toast already confirms (errors may stay inline).
- Do **not** change brand name per screen without updating this file.

---

## Changing the design system

1. Update tokens in `app/globals.css` (`:root` / `.dark`).
2. Mirror intent in this **DESIGN.md** table.
3. If Sonner colors shift, update `--sonner-*` blocks in the same CSS file.
4. Screenshot login + dashboard light/dark after meaningful token changes.

---

## Related docs

- **Implementation rules for agents**: `AGENTS.md`
- **Cursor rules (detail)**: `.cursor/rules/tailwind-v4.mdc`, `master-data-tables.mdc`
- **Product scope**: `README.md`
