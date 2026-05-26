import { describe, expect, it } from "vitest";
import { migrationFilename, toSnakeCase, utcStamp } from "./migration-naming.js";

describe("toSnakeCase", () => {
  it("lowercases and snake-cases a description", () => {
    expect(toSnakeCase("Create Budgets Table")).toBe("create_budgets_table");
  });

  it("collapses non-alphanumerics and trims edges", () => {
    expect(toSnakeCase("  add--currency!! column  ")).toBe("add_currency_column");
  });

  it("returns empty string for an empty description", () => {
    expect(toSnakeCase("   ")).toBe("");
  });
});

describe("utcStamp", () => {
  it("formats a UTC timestamp as YYYYMMDDTHHmm", () => {
    const date = new Date(Date.UTC(2026, 4, 26, 9, 5));
    expect(utcStamp(date)).toBe("20260526T0905");
  });
});

describe("migrationFilename", () => {
  it("combines stamp and snake-cased description with a .sql extension", () => {
    const date = new Date(Date.UTC(2026, 4, 26, 12, 0));
    expect(migrationFilename("Create budgets", date)).toBe("20260526T1200_create_budgets.sql");
  });
});
