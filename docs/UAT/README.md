# UAT — dokumen resmi (repo backend)

Paket **User Acceptance Test** yang dikirim ke klien. File PDF mengikuti aturan [`../README.md`](../README.md) (biasanya lokal / tidak di-push karena `*.pdf` di `.gitignore`).

| | |
|--|--|
| **Status** | TC-01 s/d TC-05 **selesai** |
| **Berita acara & serah terima** | **Dikirim ke klien** — 2026-09-01 |
| **Ringkasan** | [`STATUS.md`](./STATUS.md) |

---

## Dokumen klien (PDF)

| File | Isi |
|------|-----|
| [`UAT_Readiness_dan_Lembar_Eksekusi_TC01-TC05.pdf`](<UAT_Readiness_dan_Lembar_Eksekusi_TC01-TC05.pdf>) | Readiness + lembar eksekusi TC-01–TC-05 |
| [`Berita Acara Uji Pembuktian dan Serah Terima Hasil UAT.pdf`](<Berita Acara Uji Pembuktian dan Serah Terima Hasil UAT.pdf>) | Berita acara uji pembuktian & serah terima hasil UAT |

---

## Arsip dev (workspace — bukan di repo)

Jika checkout **workspace penuh** (dua repo + folder `UAT/` di root), ada artefak eksekusi & triage untuk developer:

| Path workspace | Isi |
|----------------|-----|
| [`UAT/UAT_Lembar_Eksekusi_TC01-TC05_v1.0.6-build.30.md`](../../../UAT/UAT_Lembar_Eksekusi_TC01-TC05_v1.0.6-build.30.md) | Lembar eksekusi markdown putaran final |
| [`UAT/revisi/`](../../../UAT/revisi/) | Triage temuan, checklist fix/re-test, deploy handoff |

Tanpa workspace root, cukup PDF di folder ini + [`STATUS.md`](./STATUS.md).

---

## Tautan terkait

| Dokumen | Path |
|---------|------|
| Penyelarasan bisnis Revisi 1 | [`../handover/penyelarasan-revisi-1.md`](../handover/penyelarasan-revisi-1.md) |
| Gap matrix GAP-014 | [`../gap-matrix-aapm.md`](../gap-matrix-aapm.md) |
| Handover mobile | [`../../../layer-farm-agung-mobile/docs/handover/rilis-dan-uat.md`](../../../layer-farm-agung-mobile/docs/handover/rilis-dan-uat.md) |
