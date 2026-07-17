import { describe, expect, test } from "bun:test";
import {
  cancelVaccineScheduleSchema,
  completeVaccinationSchema,
  createVaccineScheduleSchema,
} from "./vaccine-schedule";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";
const otherUuid = "550e8400-e29b-41d4-a716-446655440001";

describe("createVaccineScheduleSchema", () => {
  test("accepts a valid future-dated schedule", () => {
    const result = createVaccineScheduleSchema.safeParse({
      cageId: validUuid,
      itemId: otherUuid,
      scheduledDate: "2099-01-01",
      notes: "Vaksin ND lanjutan",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid cageId", () => {
    const result = createVaccineScheduleSchema.safeParse({
      cageId: "not-a-uuid",
      itemId: otherUuid,
      scheduledDate: "2099-01-01",
    });
    expect(result.success).toBe(false);
  });

  test("rejects malformed date", () => {
    const result = createVaccineScheduleSchema.safeParse({
      cageId: validUuid,
      itemId: otherUuid,
      scheduledDate: "01-01-2099",
    });
    expect(result.success).toBe(false);
  });
});

describe("completeVaccinationSchema", () => {
  test("accepts valid quantityUsed", () => {
    const result = completeVaccinationSchema.safeParse({
      scheduleId: validUuid,
      quantityUsed: "5.5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantityUsed).toBe(5.5);
    }
  });

  test("rejects zero or negative quantityUsed", () => {
    const result = completeVaccinationSchema.safeParse({
      scheduleId: validUuid,
      quantityUsed: 0,
    });
    expect(result.success).toBe(false);
  });

  test("accepts optional clientMutationId/fromSync", () => {
    const result = completeVaccinationSchema.safeParse({
      scheduleId: validUuid,
      quantityUsed: 2,
      clientMutationId: otherUuid,
      fromSync: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("cancelVaccineScheduleSchema", () => {
  test("accepts a valid scheduleId", () => {
    const result = cancelVaccineScheduleSchema.safeParse({
      scheduleId: validUuid,
    });
    expect(result.success).toBe(true);
  });
});
