import { expect, test, describe } from "bun:test";
import { isNavItemActive } from "@/features/dashboard/config/navigation";

const stockSiblings = [
  "/dashboard/inventory",
  "/dashboard/inventory/mutations",
  "/dashboard/purchase-orders",
];

describe("isNavItemActive", () => {
  test("dashboard only exact", () => {
    expect(isNavItemActive("/dashboard", "/dashboard", ["/dashboard"])).toBe(
      true,
    );
    expect(
      isNavItemActive("/dashboard/production", "/dashboard", ["/dashboard"]),
    ).toBe(false);
  });

  test("inventory detail activates inventori, not mutations", () => {
    expect(
      isNavItemActive(
        "/dashboard/inventory/abc-uuid",
        "/dashboard/inventory",
        stockSiblings,
      ),
    ).toBe(true);
    expect(
      isNavItemActive(
        "/dashboard/inventory/abc-uuid",
        "/dashboard/inventory/mutations",
        stockSiblings,
      ),
    ).toBe(false);
  });

  test("mutations page activates only mutasi stok", () => {
    expect(
      isNavItemActive(
        "/dashboard/inventory/mutations",
        "/dashboard/inventory",
        stockSiblings,
      ),
    ).toBe(false);
    expect(
      isNavItemActive(
        "/dashboard/inventory/mutations",
        "/dashboard/inventory/mutations",
        stockSiblings,
      ),
    ).toBe(true);
  });
});
