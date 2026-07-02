import { describe, expect, test } from "bun:test";
import { medicalRecordSchema } from "./medical-record";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("medicalRecordSchema", () => {
  test("accepts valid medical record payload", () => {
    const result = medicalRecordSchema.safeParse({
      cageId: validUuid,
      indication: "Lemas dan kurang nafsu makan",
      sickPopulation: 10,
      mortalityCount: 2,
      medicineName: "Vitamin B Complex",
      dosageAndDuration: "2ml per liter air minum selama 3 hari",
      applicationMethod: "Minum",
      treatmentNotes: "Dipantau perkembangannya",
      treatmentDate: "2026-06-25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.applicationMethod).toBe("Minum");
      expect(result.data.sickPopulation).toBe(10);
      expect(result.data.mortalityCount).toBe(2);
    }
  });

  test("rejects invalid application method", () => {
    const result = medicalRecordSchema.safeParse({
      cageId: validUuid,
      indication: "Lemas",
      sickPopulation: 10,
      mortalityCount: 2,
      medicineName: "Vitamin",
      dosageAndDuration: "1 hari",
      applicationMethod: "Makan", // not in enum
      treatmentDate: "2026-06-25",
    });
    expect(result.success).toBe(false);
  });

  test("accepts an inventory item with quantityUsed", () => {
    const result = medicalRecordSchema.safeParse({
      cageId: validUuid,
      indication: "Lemas",
      medicineName: "Amoksisilin",
      dosageAndDuration: "3 hari",
      applicationMethod: "Minum",
      treatmentDate: "2026-06-25",
      itemId: validUuid,
      quantityUsed: "12.5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itemId).toBe(validUuid);
      expect(result.data.quantityUsed).toBe(12.5);
    }
  });

  test("requires quantityUsed when itemId is present", () => {
    const result = medicalRecordSchema.safeParse({
      cageId: validUuid,
      indication: "Lemas",
      medicineName: "Amoksisilin",
      dosageAndDuration: "3 hari",
      applicationMethod: "Minum",
      treatmentDate: "2026-06-25",
      itemId: validUuid,
    });
    expect(result.success).toBe(false);
  });

  test("stays valid free-text only (no item linked)", () => {
    const result = medicalRecordSchema.safeParse({
      cageId: validUuid,
      indication: "Lemas",
      medicineName: "Jamu herbal",
      dosageAndDuration: "3 hari",
      applicationMethod: "Minum",
      treatmentDate: "2026-06-25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itemId).toBeUndefined();
    }
  });
});
