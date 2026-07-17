import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  generateVaccineSchedulesForCycle,
  resolveVaccineProgramForCage,
  VACCINE_SCHEDULE_SOURCE,
} from "./generate-vaccine-schedules-for-cycle";
import { ItemType } from "@/generated/prisma/enums";
import { normalizeBusinessDate } from "@/lib/business-date";

type StepRow = {
  id: string;
  age_days: number;
  item_id: string;
  pathogen_label: string | null;
  formulation_type: string | null;
  notes: string | null;
  sort_order: number;
  item: { id: string; type: string; tenant_id: string };
};

type ProgramRow = {
  id: string;
  name: string;
  strain_id: number | null;
  steps: StepRow[];
};

const TENANT = "tenant-1";
const CAGE = "cage-1";
const START = normalizeBusinessDate(new Date("2026-01-01T00:00:00.000Z"));

const step = (
  id: string,
  ageDays: number,
  itemId: string,
  type: string = ItemType.Vaccine,
): StepRow => ({
  id,
  age_days: ageDays,
  item_id: itemId,
  pathogen_label: null,
  formulation_type: null,
  notes: null,
  sort_order: 0,
  item: { id: itemId, type, tenant_id: TENANT },
});

const findFirstCage = mock(() =>
  Promise.resolve({ id: CAGE, strain_id: 1 } as {
    id: string;
    strain_id: number;
  } | null),
);
const findFirstProgram = mock(() => Promise.resolve(null as ProgramRow | null));
const findManySchedules = mock(() =>
  Promise.resolve([] as { program_step_id: string | null }[]),
);
const createMany = mock(() => Promise.resolve({ count: 0 }));

const fakePrisma = {
  cage: { findFirst: findFirstCage },
  vaccineProgram: { findFirst: findFirstProgram },
  vaccineSchedule: {
    findMany: findManySchedules,
    createMany,
  },
};

const deps = { prisma: fakePrisma as never };

describe("resolveVaccineProgramForCage", () => {
  beforeEach(() => {
    findFirstCage.mockReset();
    findFirstCage.mockResolvedValue({ id: CAGE, strain_id: 1 });
    findFirstProgram.mockReset();
  });

  test("prefers strain-matched program over default", async () => {
    const strainProgram: ProgramRow = {
      id: "prog-strain",
      name: "Strain A",
      strain_id: 1,
      steps: [step("s1", 1, "i1")],
    };
    findFirstProgram.mockResolvedValueOnce(strainProgram);

    const result = await resolveVaccineProgramForCage(TENANT, CAGE, deps);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.program?.id).toBe("prog-strain");
    }
    expect(findFirstProgram).toHaveBeenCalledTimes(1);
  });

  test("falls back to strain_id null default", async () => {
    const defaultProgram: ProgramRow = {
      id: "prog-default",
      name: "Default",
      strain_id: null,
      steps: [step("s1", 1, "i1")],
    };
    findFirstProgram
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(defaultProgram);

    const result = await resolveVaccineProgramForCage(TENANT, CAGE, deps);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.program?.id).toBe("prog-default");
    }
    expect(findFirstProgram).toHaveBeenCalledTimes(2);
  });

  test("returns null program when none active", async () => {
    findFirstProgram.mockResolvedValue(null);
    const result = await resolveVaccineProgramForCage(TENANT, CAGE, deps);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.program).toBeNull();
    }
  });
});

describe("generateVaccineSchedulesForCycle", () => {
  beforeEach(() => {
    findFirstCage.mockReset();
    findFirstCage.mockResolvedValue({ id: CAGE, strain_id: 1 });
    findFirstProgram.mockReset();
    findManySchedules.mockReset();
    findManySchedules.mockResolvedValue([]);
    createMany.mockReset();
    createMany.mockResolvedValue({ count: 0 });
  });

  test("creates schedules for multi-step same day with age offset", async () => {
    const program: ProgramRow = {
      id: "prog-1",
      name: "Demo",
      strain_id: null,
      steps: [
        step("s1", 1, "i1"),
        step("s2", 1, "i2"),
        step("s3", 6, "i3", ItemType.Vitamin),
      ],
    };
    findFirstProgram.mockResolvedValueOnce(null).mockResolvedValueOnce(program);

    const result = await generateVaccineSchedulesForCycle(
      TENANT,
      CAGE,
      START,
      deps,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.created).toBe(3);
      expect(result.skipped).toBe(0);
    }
    expect(createMany).toHaveBeenCalledTimes(1);
    const firstCall = createMany.mock.calls[0] as
      | [{ data: Array<{
          scheduled_date: Date;
          source: string;
          program_step_id: string;
          item_id: string;
        }> }]
      | undefined;
    expect(firstCall).toBeDefined();
    const payload = firstCall![0];
    expect(payload.data).toHaveLength(3);
    expect(payload.data[0]?.source).toBe(VACCINE_SCHEDULE_SOURCE.Program);
    expect(payload.data.filter((r) => r.item_id === "i1" || r.item_id === "i2")).toHaveLength(
      2,
    );
    // Day 1 = start + 1
    expect(payload.data[0]?.scheduled_date.toISOString().slice(0, 10)).toBe(
      "2026-01-02",
    );
    // Day 6
    const day6 = payload.data.find((r) => r.program_step_id === "s3");
    expect(day6?.scheduled_date.toISOString().slice(0, 10)).toBe("2026-01-07");
  });

  test("idempotent regenerate skips existing Pending program steps", async () => {
    const program: ProgramRow = {
      id: "prog-1",
      name: "Demo",
      strain_id: null,
      steps: [step("s1", 1, "i1"), step("s2", 6, "i2")],
    };
    findFirstProgram.mockResolvedValueOnce(null).mockResolvedValueOnce(program);
    findManySchedules.mockResolvedValue([{ program_step_id: "s1" }]);

    const result = await generateVaccineSchedulesForCycle(
      TENANT,
      CAGE,
      START,
      deps,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.created).toBe(1);
      expect(result.skipped).toBe(1);
    }
    const firstCall = createMany.mock.calls[0] as
      | [{ data: Array<{ program_step_id: string }> }]
      | undefined;
    expect(firstCall).toBeDefined();
    const payload = firstCall![0];
    expect(payload.data).toHaveLength(1);
    expect(payload.data[0]?.program_step_id).toBe("s2");
  });

  test("skips silently when no program with info", async () => {
    findFirstProgram.mockResolvedValue(null);
    const result = await generateVaccineSchedulesForCycle(
      TENANT,
      CAGE,
      START,
      deps,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.created).toBe(0);
      expect(result.info).toContain("Tidak ada program");
    }
    expect(createMany).not.toHaveBeenCalled();
  });

  test("rejects Feed item type in steps", async () => {
    const program: ProgramRow = {
      id: "prog-1",
      name: "Bad",
      strain_id: null,
      steps: [step("s1", 1, "i1", ItemType.Feed)],
    };
    findFirstProgram.mockResolvedValueOnce(null).mockResolvedValueOnce(program);

    const result = await generateVaccineSchedulesForCycle(
      TENANT,
      CAGE,
      START,
      deps,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Vaccine atau Vitamin");
    }
  });

  test("rejects item from another tenant", async () => {
    const program: ProgramRow = {
      id: "prog-1",
      name: "Leak",
      strain_id: null,
      steps: [
        {
          ...step("s1", 1, "i1"),
          item: { id: "i1", type: ItemType.Vaccine, tenant_id: "other" },
        },
      ],
    };
    findFirstProgram.mockResolvedValueOnce(null).mockResolvedValueOnce(program);

    const result = await generateVaccineSchedulesForCycle(
      TENANT,
      CAGE,
      START,
      deps,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("tenant");
    }
  });
});
