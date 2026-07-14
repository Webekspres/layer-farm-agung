import { describe, expect, test } from "bun:test";
import { ItemType } from "@/generated/prisma/enums";
import {
  isEggLedgerItemType,
  isSaprodiItemType,
  SAPRODI_ITEM_TYPES,
} from "./saprodi-item-types";

describe("saprodi-item-types", () => {
  test("Egg is not saprodi", () => {
    expect(isSaprodiItemType(ItemType.Egg)).toBe(false);
    expect(isEggLedgerItemType(ItemType.Egg)).toBe(true);
  });

  test("Feed/Medicine/Vaccine/Vitamin/Other are saprodi", () => {
    for (const type of SAPRODI_ITEM_TYPES) {
      expect(isSaprodiItemType(type)).toBe(true);
      expect(isEggLedgerItemType(type)).toBe(false);
    }
  });

  test("Egg is excluded from SAPRODI_ITEM_TYPES", () => {
    expect(SAPRODI_ITEM_TYPES).not.toContain(ItemType.Egg);
  });
});
