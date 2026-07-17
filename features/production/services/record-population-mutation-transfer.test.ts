import { describe, expect, test } from "bun:test";
import { evaluateTransferTargetCage } from "./record-population-mutation";

const SOURCE_ID = "550e8400-e29b-41d4-a716-446655440000";
const TARGET_ID = "660e8400-e29b-41d4-a716-446655440001";

const ACTIVE_TARGET = { id: TARGET_ID, name: "Kandang B", status: "Active" };

describe("evaluateTransferTargetCage (Pindah transfer rules)", () => {
  test("rejects when no target cage is selected", () => {
    const result = evaluateTransferTargetCage(SOURCE_ID, undefined, null, false);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("wajib diisi");
  });

  test("rejects when target equals source cage", () => {
    const result = evaluateTransferTargetCage(
      SOURCE_ID,
      SOURCE_ID,
      { id: SOURCE_ID, name: "Kandang A", status: "Active" },
      true,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("berbeda dari kandang asal");
  });

  test("rejects when target cage does not exist in tenant", () => {
    const result = evaluateTransferTargetCage(SOURCE_ID, TARGET_ID, null, false);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("tidak ditemukan");
  });

  test("rejects when target cage is not Active", () => {
    const result = evaluateTransferTargetCage(
      SOURCE_ID,
      TARGET_ID,
      { ...ACTIVE_TARGET, status: "Inactive" },
      true,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("tidak aktif");
  });

  test("rejects when target cage has no active cycle", () => {
    const result = evaluateTransferTargetCage(
      SOURCE_ID,
      TARGET_ID,
      ACTIVE_TARGET,
      false,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("siklus aktif");
  });

  test("accepts a valid, active, different target cage with an active cycle", () => {
    const result = evaluateTransferTargetCage(
      SOURCE_ID,
      TARGET_ID,
      ACTIVE_TARGET,
      true,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.targetCage).toEqual({ id: TARGET_ID, name: "Kandang B" });
    }
  });
});
