# AAPM Gap Matrix (Phase 0)

**Status:** Phase 0 approved; **Phase 1 Pilot Reliability implemented 2026-08-11** (code + docs). Device retests for PH1-A/B/C/H still **pending**.  
**Created:** 2026-08-11  
**Authority:** P0 Follow-up Notes + Readiness Report; P1 UAT Form; P2 Ringkasan; P3 Proposal (background only).  
**Rule:** Follow-up retest status wins over older UAT notes. Proposal does not override pilot scope.  
**Phase 1 report:** [phase1-pilot-reliability-report.md](./phase1-pilot-reliability-report.md)  
**Pilot pack:** [pilot-guide-v1.md](./pilot-guide-v1.md), [pilot-ops-contact.md](./pilot-ops-contact.md)

## Methodology

For each relevant finding: extract from sources → inspect Web UI → API/action/service → Prisma → Mobile client/cache/UI → assign **Implementation Reality (1–7)** → classify pilot impact.  
If runtime-only: **Verification / Retest Required** (do not guess).

| # | Implementation Reality |
|---|------------------------|
| 1 | Feature does not exist |
| 2 | Exists but has a bug |
| 3 | Exists but behavior differs from requirement |
| 4 | Exists but needs UX/polish |
| 5 | Works / wired — verification/retest only |
| 6 | Should remain disabled/restricted during pilot |
| 7 | Ambiguous — product/client clarification |

**Code inspection note:** Layer chains were reviewed in-repo (not runtime). Items marked Verification still need a formal retest pack on a pilot-like environment.

---

## Full Gap Matrix

| ID | Gap / finding | Source | Section / ref | Current status (P0) | Impl. reality | Category | Pilot impact | Required action | Area | Acceptance (summary) | Dependency | Priority |
|----|---------------|--------|---------------|---------------------|---------------|----------|--------------|-----------------|------|----------------------|------------|----------|
| GAP-001 | Staff assignment/revocation must update Mobile cage list | Follow-up; Readiness | Android penugasan; Prioritas Wajib | Improved 9 Aug (2↔3 cages) | **5** | Verification / Retest Required | Must pass before pilot | Formal retest + document stale-cache until next online fetch | Both | See Phase 1 A | — | P0 |
| GAP-002 | Daily inputs must land on correct active cycle / cage | Follow-up; Readiness | Prioritas Wajib; core gate | Required for pilot | **5** (prod gates Active cycle; **no `cycle_id` FK**) | Verification / Retest Required | Must pass (one Active cycle) | Retest create/read web+Android; do not redesign multi-cycle yet | Both / API | See Phase 1 B | GAP-003 limit | P0 |
| GAP-003 | New cycle inherits old production/pakan/mati/HDP/FCR | Follow-up §6; Readiness 5.15 / §9 | Cycle defect — kritis | Open; **known limitation** | **2** | Post-Pilot Capability Gate (+ Pilot Limit) | Not used in pilot if close/start forbidden | Forbid close/start in pilot; fix isolation post-pilot | Web / API / Prisma | Follow-up §6 bukti | — | P0 gate / P1 limit |
| GAP-004 | Population live calc ignores cycle `start_date` (all mutations on cage) | Follow-up §6; code | `resolve-active-cycle-population.ts` | Root cause of GAP-003 | **2** | Post-Pilot Capability Gate | Contained if no 2nd cycle | Fix when enabling multi-cycle | API / Prisma | Same as GAP-003 | GAP-003 | P0 gate |
| GAP-005 | Idempotent retry/sync — no duplicate records | Follow-up; Readiness | Catatan ganda; Prioritas Wajib | Improved one-device | **5** | Verification / Retest Required | Must pass | Retest double-tap, flush, reopen-with-queue | Both | See Phase 1 C | — | P0 |
| GAP-006 | After correction, Android shows latest without ambiguous stale UI | Follow-up Koreksi | 9 Aug: web OK; Android needs reopen | Partial | **5** (residual **2** risk: edit may not bust history cache) | Verification / Retest Required | Must pass | Retest edit → riwayat focus/pull; fix only if fails | Mobile | See Phase 1 D | — | P0 |
| GAP-007 | Correction requires reason, approval, version, before/after trail | UAT Input Harian; Ringkasan #1; Follow-up | Koreksi / kewenangan data | Open; product-dependent | **3** / **7** | Product Decision Required (+ Post-Pilot Gate) | Not pilot blocker if basic correction OK | Decide policy; then implement | Both | TBD after decision | Product | P2 |
| GAP-008 | Staff Web access scope: retain Web login but restrict to operational/monitoring; hide finance via **nav and dashboard content** (not mobile-only) | Follow-up (staff can enter web + Android); Readiness; product decision 2026-08-11 | Pembatasan staf; “Informasi yang terlihat oleh staff” | **Policy decided**; implementation open | **3** | Pilot Blocker (implement restrict) | Must pass before pilot | Keep Web login; Mobile primary; restrict Web to operational scope; no finance/revenue/PO staff workflow; do **not** broaden perms; hiding Keuangan nav alone is **not** sufficient | Web | See Phase 1 E | GAP-009 | P0 |
| GAP-009 | Staff dashboard exposes **Pendapatan hari ini** KPI despite no `view_cashflow`; finance must not leak via KPI cards/widgets | Follow-up; code; product decision 2026-08-11 | `get-dashboard-executive.ts` / dashboard overview | **Policy decided**; defect open until KPIs gated | **3** | Pilot Blocker | Must hide revenue/financial KPIs for staff | Gate dashboard KPI build/render for staff (nav hide already insufficient); hide Pendapatan; do not broaden staff permissions | Web | See Phase 1 E | GAP-008 | P0 |
| GAP-010 | Close/open cycle during pilot | Readiness; Follow-up | Baseline excludes multi-cycle | Must not activate | **6** | Pilot Limit / Operational Workaround | Restrict | Hide/disable or SOP: no close/start 2nd cycle | Web / Docs-Ops | Pilot guide states disabled | GAP-003 | P0 limit |
| GAP-011 | Cold-start offline (reopen app offline → work) | Follow-up §7; UAT; Ringkasan #2 | Offline | Open; not pilot path | **2** + **6** | Post-Pilot Capability Gate (+ Pilot Limit) | Internet-first pilot | Do not promise; fix post-pilot | Mobile | Follow-up §7 two tests | — | P0 gate |
| GAP-012 | QR / deep-link opens assigned cage reliably | Follow-up §8; UAT | QR | No progress 9 Aug | **6** (+ residual **2**) | Post-Pilot Capability Gate (+ Pilot Limit) | Manual cage pick | Disable as primary path; fix before enable | Both | Follow-up §8 three cases | — | P0 gate |
| GAP-013 | Production TB → sellable egg stock → sales | Follow-up §9; UAT; Readiness | Telur jual | Outside pilot baseline; code path **exists** (`IN_HARVEST` + sales) | **6** (activation gate; not missing) | Pilot Limit + Post-Pilot Capability Gate | Do not promise/activate | Onboarding guide + retest before enable | Web / API / Docs | Follow-up §9 | Config vs defect unclear without guided setup | P1 gate |
| GAP-014 | HDP/FCR used as decision KPIs without official formula / labels | Follow-up; Readiness; UAT Dashboard | HDP/FCR | Must not be decision metrics in pilot | **3** / **6** | Pilot Limit (+ Product Decision on official formula) | De-emphasize / label temporary | Phase 1: label or hide as decision KPI | Web | See Phase 1 F / KPI | GAP-003 for trusted numbers | P0 |
| GAP-015 | Customer-readable release / version identity | Follow-up paket mitra | Versi web + APK | Missing in UI | **1** | Pilot Blocker (Docs-Ops / small UI) | Required for retest package | Expose version web + mobile Profile; document build | Both / Docs-Ops | Version visible on Profile/about | — | P0 |
| GAP-016 | Pilot guide v1 + basic backup + on-call contact | Follow-up; Readiness | Paket mitra; gate layanan | Missing as customer pack | **1** | Pilot Blocker | Required before pilot | Write guide + backup note + contact | Docs-Ops | Docs delivered | GAP-010–014 limits listed | P0 |
| GAP-017 | Multi-part daily form partial save vs atomic | UAT; Readiness; Follow-up | Input harian rules | Explained as partial OK | **7** / **5** | Product Decision Required | Clarify UX copy | Decide expected behavior; keep per-component messages | Both | TBD | Product | P1 |
| GAP-018 | Feed card 0 kg when materials typed “Lainnya” | UAT Master Data / Dashboard | Item type | Open | **3** / **4** | Post-Pilot / polish | Not pilot core | Validate Feed type / dashboard filter | Web | UAT note | — | P2 |
| GAP-019 | Unit conversion (karung↔kg) | UAT; Follow-up; Ringkasan | Satuan | Needs agreement | **7** | Product Decision Required / Out of pilot | Not required for pilot | Decide later | Web | TBD | Product | P3 |
| GAP-020 | Min stock alerts empty / unused | UAT Inventory | Ambang minimum | Open | **4** / **5** | Verification / polish | Optional | Seed min alerts or document unused | Web | — | — | P2 |
| GAP-021 | Stock card: source doc refs + running balance | UAT Inventory | Masukan | Open | **4** | Post-Pilot polish | N/A | Later UX | Web | — | — | P3 |
| GAP-022 | PO tempo / approval gate | UAT PO | Cakupan | Question not defect | **7** | Out of Scope / Product | N/A | Do not implement unless scoped | Web | — | Product | P3 |
| GAP-023 | Location form: address, PIC, effective date | UAT Master Data | Masukan | Open | **4** | Post-Pilot polish | N/A | Later | Web | — | — | P3 |
| GAP-024 | Strain age targets empty but HDP target line drawn | UAT Master Data | Masukan | Open | **4** / **3** | Post-Pilot polish | De-emphasize with GAP-014 | Later | Web | — | GAP-014 | P2 |
| GAP-025 | Formal export / customer data takeout | Follow-up; Readiness | Laporan | Not found | **1** / **7** | Post-Pilot / Product Decision | Not pilot baseline | Clarify need then build | Web | TBD | Product | P2 |
| GAP-026 | Dashboard “0% siklus aktif” with active cycles | UAT Dashboard | Perlu perbaikan | Open | **2** / **5** | Verification / Retest Required | Confusing but not core gate | Retest metric; fix if still wrong | Web | Display matches active cycles | — | P1 |
| GAP-027 | Feed/medical record without requiring Active cycle | Code vs Follow-up | record-feed / medical | Soft gap | **3** | Verification / Retest Required | OK if cage always has Active in pilot | Retest; optional harden later | API | Inputs only when Active exists | GAP-002 | P1 |
| GAP-028 | Advanced offline queue claim vs cold-start failure | Follow-up §7; Profile “Data offline siap” | Offline | Misleading if cold-start fails | **3** + **6** | Pilot Limit | Internet-first | Soften copy / do not claim full offline | Mobile / Docs | Guide: online-first | GAP-011 | P0 limit |
| GAP-029 | Accounting AR/AP, journals, payroll | Ringkasan; Proposal | Di luar cakupan | Out | **7** / Out | Out of Scope | N/A | None | — | — | — | — |
| GAP-030 | Feed mixing / formula | Ringkasan | Belum tersedia | Out | **1** | Out of Scope | N/A | None | — | — | — | — |

---

## Companion lists

### 1. Pilot Blockers (must clear before pilot start)

| ID | Action type |
|----|-------------|
| GAP-001 | Verification retest (assignment ↔ Mobile list) |
| GAP-002 | Verification retest (inputs on Active cycle, one cycle) |
| GAP-005 | Verification retest (idempotency) |
| GAP-006 | Verification retest (correction → latest on Android) |
| GAP-014 | Implement/limit: HDP/FCR non-decision labeling or hide |
| GAP-015 | Implement Docs-Ops/UI: customer-visible version |
| GAP-016 | Docs-Ops: pilot guide + backup + on-call |
| GAP-008 | Implement staff Web **scope policy** (login kept; finance out of **nav + dashboard content**; not mobile-only; do not broaden perms) |
| GAP-009 | Hide **Pendapatan** / financial KPIs from staff dashboard (nav-only hide is insufficient) |

Dashboard “matches source notes” (Follow-up Prioritas Wajib) is covered by retest of GAP-002 + GAP-014 (non-decision KPIs) + operational dashboard smoke — listed under Phase 1 backlog.

### Decided product policy — Staff Web (GAP-008 / GAP-009)

Recorded **2026-08-11** (pilot):

1. Staff **must** remain able to log in to Web — **not** mobile-only.
2. Mobile/Android remains the **primary** operational channel for staff.
3. Staff Web is a **restricted operational/monitoring** surface, not the full admin dashboard.
4. Staff must **not** see financial/revenue information on Web — including **navigation and dashboard KPI cards/summaries/widgets**.
5. Keuangan-related navigation/workflows stay hidden/blocked for staff.
6. Specifically: **Pendapatan hari ini** must not be shown to staff.
7. Inventory / cage / production / operational Web access only where already supported by existing staff permissions (`view_dashboard`, `manage_production`, `manage_inventory`) and P0 sources — **do not broaden**.
8. PO / purchasing is **not** a staff operational workflow unless explicitly permission-supported (staff lacks purchase/cashflow perms today — keep it that way).

### 2. Pilot Limits / Operational Workarounds

| ID | Workaround |
|----|------------|
| GAP-003 / GAP-004 / GAP-010 | One Active cycle per cage; **no close/start** new cycle during pilot |
| GAP-011 / GAP-028 | Internet-first; do not promise cold-start offline; soften “data offline siap” claims |
| GAP-012 | Staff picks cage from list; QR not primary |
| GAP-013 | Do not activate/promise egg stock sales in pilot |
| GAP-014 | HDP/FCR indicative only / labeled / hidden as decision |
| GAP-008 / GAP-009 | **PH1-E shipped:** staff Web login kept; finance/revenue/PO hidden without `view_cashflow` (nav + dashboard KPIs/charts) |

### 3. Post-Pilot Capability Gates

| ID | Gate before activation |
|----|------------------------|
| GAP-003 / GAP-004 | Multi-cycle isolation (Follow-up §6 acceptance) |
| GAP-011 | Cold-start offline (Follow-up §7 two scenarios) |
| GAP-012 | QR/deep-link (Follow-up §8 three cases) |
| GAP-013 | Egg stock + sales with onboarding guide (Follow-up §9) |
| GAP-007 | Advanced correction audit (after product decision) |
| GAP-018, GAP-020, GAP-021, GAP-023, GAP-024, GAP-025 | Master-data / reporting hygiene |

### 4. Product Decisions Required

| ID | Question |
|----|----------|
| ~~GAP-008 / GAP-009~~ | **Decided 2026-08-11** — see “Decided product policy — Staff Web” above |
| GAP-007 | Is mandatory reason + immutable audit required before / during / after pilot? |
| GAP-014 / GAP-017 | Official HDP/FCR definition; rules for multiple inputs same day / partial save |
| GAP-019 | Unit conversion model |
| GAP-022 | PO credit / approval in scope? |
| GAP-025 | Formal export required for pilot or later? |
| GAP-013 | Is missing sellable stock config vs product defect when Egg item absent? |

### 5. Verification / Retest Required (runtime)

| ID | Why code review is not enough |
|----|-------------------------------|
| GAP-001 | Cache timing / warm after revoke |
| GAP-002 | Cross web↔Android identity of records |
| GAP-005 | Real retry/flush device scenarios |
| GAP-006 | Focus/cache race after PATCH |
| GAP-026 | Confirm “0% siklus aktif” still reproduces |
| GAP-027 | Confirm feed/medical allowed without Active cycle in UI flows |
| GAP-013 | Guided farm setup may make sales work — config vs defect |

### 6. Out of Scope (do not build for pilot)

| ID | Notes |
|----|-------|
| GAP-029 | AR/AP, journals, payroll |
| GAP-030 | Feed mixing |
| GAP-022 | Unless product expands scope |
| P3 Proposal PWA / full offline / multi-subdomain marketing claims | Superseded by Readiness pilot baseline |

---

## Proposed Phase 1 backlog (implementation / testing only after approval)

**Wave rule:** verify first; small fix only if retest fails; restrict rather than over-build. **No Phase 2 gates in this wave.**

### PH1-A — Staff assignment → cage visibility (GAP-001)

**Area:** Both  
**Action:** Retest pack; document that list updates on next successful online `GET /api/v1/cages` / warm (no push). Fix only if assigned cages never appear when online.

```text
Given staff S is assigned to cages L1 and L2 and Mobile has refreshed online
When admin assigns L3 to S and S refreshes/warms cages online
Then Mobile cage list shows L1, L2, L3
When admin revokes L3 and S refreshes/warms online
Then Mobile list shows L1, L2 only
```

**Source:** Follow-up Android penugasan; Prioritas Wajib; Readiness assignment evidence.

### PH1-B — Active cycle correctness (one-cycle pilot) (GAP-002, GAP-027)

**Area:** Both / API  
**Action:** Retest production/feed/population/health against single Active cycle; confirm web history matches. Do **not** redesign `cycle_id` unless retest fails under one Active cycle. Optionally note feed/medical lack Active-cycle gate.

```text
Given cage K has exactly one Active cycle and staff is assigned
When staff records production, feed, population (mati), and medical for today
Then each record is stored for cage K and appears in Android history and web recap for that cage/date
And values match between Android and web after sync
```

**Source:** Follow-up Prioritas Wajib; Readiness core gate.

### PH1-C — Idempotency (GAP-005)

**Area:** Both  
**Action:** Retest only; no new architecture if `client_mutation_id` unique + mobile queue flush already behave.

```text
Given a production (and feed) submit with clientMutationId M succeeds
When the same payload with M is retried or flushed again from the offline queue
Then exactly one DB row exists for that mutation and UI does not show duplicates
```

**Source:** Follow-up catatan ganda; Readiness core gate.

### PH1-D — Correction refresh (GAP-006)

**Area:** Mobile (+ API if needed)  
**Action:** Retest edit production → open riwayat. If stale without manual reopen, fix cache invalidation on edit success (minimal). No advanced audit (GAP-007).

```text
Given an existing production record with TB=2
When staff corrects TB to 3 and saves successfully
Then web shows 3 and Android history shows 3 after returning to riwayat (focus/refresh) without requiring full app restart
```

**Source:** Follow-up Koreksi 9 Aug.

### PH1-E — Staff Web scope + dashboard finance hide (GAP-008, GAP-009)

**Area:** Web  
**Action:** Implement decided pilot policy only — **no mobile-only lockout**, **no denying Web login**, **no new staff permissions**, **no unrelated RBAC churn**.

- Keep staff Web login (`view_dashboard` stays).
- Keep Keuangan nav/workflows blocked (already no `view_cashflow`) — **necessary but not sufficient**.
- Also hide financial/revenue **dashboard** content for staff (KPI cards/summaries/widgets), especially **Pendapatan hari ini**.
- Do not treat PO/purchasing as a staff workflow; do not grant purchase/cashflow permissions.
- Leave Inventori / production operational surfaces as already allowed by existing staff perms — **do not broaden** dashboard or other permissions.

```text
Given a user with the staff role
When the user logs into Web and opens the dashboard
Then the user can access the Web dashboard
And Finance-related navigation (Keuangan) is not available
And financial/revenue KPI cards such as “Pendapatan hari ini” are not displayed
And the dashboard only exposes operational information already allowed for the staff role
And staff permissions are not broadened beyond the existing seeded set
```

**Source:** Follow-up (staff can enter web + Android; informasi terlihat oleh staff); Readiness role split; product decision 2026-08-11.

### PH1-F — Pilot controls & KPI labeling (GAP-010, GAP-012, GAP-013, GAP-014, GAP-028)

**Area:** Web / Mobile / Docs-Ops  
**Action:** Soft-control + copy: disable/hide or SOP for cycle close/start, QR-primary, egg sales; label/hide HDP/FCR as non-decision; soften full-offline claims.

```text
Given pilot baseline (Readiness)
When a pilot user uses the apps per guide
Then QR is not required (list pick works), sales/egg-stock and multi-cycle are not presented as active capabilities
And HDP/FCR are labeled as temporary/indicative or not shown as decision KPIs
And Profile does not claim full offline reopen if cold-start is unsupported
```

**Source:** Readiness baseline; Follow-up pilot position sections.

### PH1-G — Version identity + pilot pack (GAP-015, GAP-016)

**Area:** Docs-Ops (+ small UI)  
**Action:** Show version on Mobile Profile and Web (e.g. footer/about); write Pilot Guide v1, basic backup note, on-call contact.

```text
Given a build installed for retest
When customer/staff opens Profile (Mobile) and agreed Web location
Then a human-readable version/build id is visible
And Pilot Guide v1 lists in-scope flows and explicitly disabled capabilities
And a one-page backup + contact note exists for the pilot farm
```

**Source:** Follow-up “Paket yang Diminta dari Mitra”; Readiness layanan minimum for pilot.

### PH1-H — Dashboard smoke vs source notes (supports Prioritas Wajib)

**Area:** Web  
**Action:** Retest population/production cards against known inputs on one-cycle farm; include GAP-026 check.

```text
Given known TB, feed kg, and population on two cages under one Active cycle each
When admin opens dashboard
Then core counts match source notes (population sum, production) within documented formulas
And HDP/FCR are not treated as official decision metrics (per PH1-F)
```

**Source:** Follow-up Prioritas Wajib dashboard; UAT Dashboard (evidence).

---

## Code evidence anchors (selected)

| Topic | Evidence |
|-------|----------|
| Assignment API filter | `list-field-cages.ts` + `GET /api/v1/cages` |
| No `cycle_id` on daily tables | Prisma models; `record-daily-production.ts` checks Active cycle only |
| Population inheritance | `resolve-active-cycle-population.ts` loads all mutations `record_date <= asOf` (no `start_date` filter) |
| Idempotency | `client_mutation_id` unique + mobile `pending-input-queue` / sync |
| Staff perms | `system-roles.ts`: `view_dashboard`, `manage_production`, `manage_inventory` |
| Revenue KPI gated (PH1-E) | `dashboard-overview.tsx` filters `id === "revenue"` + timeline PO unless `view_cashflow`; charts via `showFinance` |
| Egg harvest stock | `record-daily-production.ts` `Item` type `Egg` → `IN_HARVEST` |
| Cold-start | Mobile `auth-provider` / `getSession` network-required → null session offline; Profile copy softened (PH1-F) |
| Version (PH1-G) | Mobile Profile `v1.0.0 (build 2)`; Web Profile `AAPM Web v0.1.0` |

---

## Cannot reconcile without human / client input

1. ~~Staff dashboard finance/revenue visibility (GAP-008/009)~~ — **decided 2026-08-11** (Web login kept; finance/revenue hidden from nav **and** dashboard KPIs).  
2. **Official HDP/FCR definition** (GAP-014) — formulas exist (`kg/butir`) but not ratified.  
3. **Correction audit strictness** (GAP-007) — quality finding vs pilot “koreksi dasar”.  
4. **Egg stock zero after TB** (GAP-013) — code can create stock if Egg item exists; may be **configuration** vs defect — needs guided setup attempt before classifying final.  
5. **Partial multi-component save** (GAP-017) — product/UX rule.  
6. All **Verification** rows — need runtime retest on agreed build.

---

## Stop point

Phase 1 coding for PH1-A–H is complete (see report). **No Phase 2** (cycle isolation / cold-start offline / QR-primary / egg→sales activation / advanced audit) in this wave. Next: formal device retest of PH1-A/B/C/H on pilot-like build; fill `pilot-ops-contact.md` before customer go-live.
