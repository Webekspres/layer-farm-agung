# Daily Input — Soft Daily Report & Correction Audit

**Status:** Input Harian refinement (not Phase 2)  
**Decisions:** GAP-007 + GAP-017 locked 2026-08-12  
**Related:** [gap-matrix-aapm.md](./gap-matrix-aapm.md)

## Product rules

- Partial multi-component save remains OK (not atomic).
- Empty / missing component = **Belum dilaporkan** (no row). Explicit **0** = reported zero (row exists).
- Explicit **none** for pengobatan: create with `noneReported: true` (sentinel row “Tidak ada pengobatan”).
- Explicit **none** for mutasi populasi (Mobile): toggle “Tidak ada mutasi populasi hari ini” → `POST Mati` qty `0`.
- Population create: typed `0` on Mobile decrease → `POST Mati` qty `0` (masih didukung).
- Do not coerce unreported → 0 in UI or aggregations that imply “reported”.
- Correction: mandatory **reason**, **actor**, **timestamp**, **before → after**, append-only history.
- **No** approval workflow / `PENDING_APPROVAL`.
- One correction session may touch multiple fields/components with **one** reason.

## Data model

### `DailyReport` (soft parent)

Unique `(tenant_id, cage_id, record_date)`. Created via `ensureDailyReport` when the first component is saved. Domain rows stay in:

- `DailyProduction`
- `FeedConsumption`
- `PopulationMutation`
- `MedicalRecord`

Linked by cage + date (no mandatory FK rewrite on all four tables in v1).

### `DailyInputCorrection` (immutable)

| Field | Purpose |
|-------|---------|
| `daily_report_id` | Parent report |
| `actor_user_id` | Who corrected |
| `reason` | Required free text |
| `changes` | JSON array of `{ component, recordId?, field, before, after }` |
| `client_mutation_id` | Unique idempotency key |
| `created_at` | When |

Users cannot delete correction rows.

## API

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/v1/cages/{cageId}/daily-report?date=` | Current values + unreported flags + correction summary |
| `GET` | `/api/v1/cages/{cageId}/daily-corrections?date=` | Timeline of correction events |
| `PATCH` | existing component routes | Require `reason` (+ optional `clientMutationId`); write one correction event |

Create flows call `ensureDailyReport` after successful insert.

## UX

- Mobile: Detail Daily Report (current + Belum dilaporkan) → Edit with reason → Riwayat Koreksi timeline.
- Web: production recap shows unreported vs 0; **Riwayat Koreksi** tab/section for cage+date.

## Non-goals

Multi-cycle `cycle_id`, approval, cold-start offline, merging four tables into one.
