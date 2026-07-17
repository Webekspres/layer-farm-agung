import { describe, expect, test } from "bun:test";
import {
  createVaccineProgramSchema,
  updateVaccineProgramSchema,
} from "./vaccine-program";

const validStep = {
  ageDays: 1,
  itemId: "00000000-0000-4000-8000-000000000301",
};

describe("createVaccineProgramSchema", () => {
  test("accepts program with steps and null strain", () => {
    const parsed = createVaccineProgramSchema.safeParse({
      name: "Default Lohmann",
      strainId: "none",
      steps: [validStep, { ...validStep, ageDays: 6 }],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.strainId).toBeNull();
      expect(parsed.data.steps).toHaveLength(2);
    }
  });

  test("rejects empty steps", () => {
    const parsed = createVaccineProgramSchema.safeParse({
      name: "Kosong",
      strainId: null,
      steps: [],
    });
    expect(parsed.success).toBe(false);
  });

  test("rejects negative ageDays", () => {
    const parsed = createVaccineProgramSchema.safeParse({
      name: "Bad",
      strainId: null,
      steps: [{ ...validStep, ageDays: -1 }],
    });
    expect(parsed.success).toBe(false);
  });
});

describe("updateVaccineProgramSchema", () => {
  test("parses isActive from form string", () => {
    const parsed = updateVaccineProgramSchema.safeParse({
      programId: "00000000-0000-4000-8000-000000000401",
      name: "Update",
      strainId: 1,
      isActive: "true",
      steps: [validStep],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.isActive).toBe(true);
      expect(parsed.data.strainId).toBe(1);
    }
  });
});
