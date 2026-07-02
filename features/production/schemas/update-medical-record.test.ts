import { describe, expect, test } from "bun:test";
import { updateMedicalRecordSchema } from "./update-medical-record";

describe("updateMedicalRecordSchema", () => {
  test("accepts a valid update without an item", () => {
    const result = updateMedicalRecordSchema.safeParse({
      indication: "Lemas dan kurang nafsu makan",
      sickPopulation: 8,
      mortalityCount: 1,
      medicineName: "Vitamin B Complex",
      dosageAndDuration: "2ml per liter air minum selama 3 hari",
      applicationMethod: "Minum",
      treatmentNotes: "Dipantau perkembangannya",
    });
    expect(result.success).toBe(true);
  });

  test("accepts a valid update with quantityUsed", () => {
    const result = updateMedicalRecordSchema.safeParse({
      indication: "Lemas",
      medicineName: "Amoksisilin",
      dosageAndDuration: "3 hari",
      applicationMethod: "Minum",
      quantityUsed: "25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantityUsed).toBe(25);
    }
  });

  test("rejects invalid application method", () => {
    const result = updateMedicalRecordSchema.safeParse({
      indication: "Lemas",
      medicineName: "Vitamin",
      dosageAndDuration: "1 hari",
      applicationMethod: "Makan",
    });
    expect(result.success).toBe(false);
  });
});
