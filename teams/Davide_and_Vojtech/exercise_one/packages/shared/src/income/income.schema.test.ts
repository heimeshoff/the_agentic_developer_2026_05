import { describe, expect, it } from "vitest";
import { money } from "../money/index.js";
import {
  actualIncomeSchema,
  confirmExpectedIncomeSchema,
  createExpectedIncomeSchema,
  editExpectedIncomeSchema,
  expectedIncomeSchema,
  expectedIncomeStatusSchema,
  periodSchema,
  periodSummarySchema,
  recordActualIncomeSchema,
} from "./income.schema.js";

const UUID = "11111111-1111-4111-8111-111111111111";
const validPeriod = { year: 2026, month: 5 };
const validMoney = { amount: 250000, currency: "EUR" };
const utcDate = "2026-05-25T00:00:00.000Z";

describe("periodSchema", () => {
  it("accepts a valid calendar month", () => {
    expect(periodSchema.parse(validPeriod)).toEqual(validPeriod);
  });

  it("rejects a month outside 1..12", () => {
    expect(periodSchema.safeParse({ year: 2026, month: 0 }).success).toBe(false);
    expect(periodSchema.safeParse({ year: 2026, month: 13 }).success).toBe(false);
  });

  it("rejects a non-integer month", () => {
    expect(periodSchema.safeParse({ year: 2026, month: 5.5 }).success).toBe(false);
  });
});

describe("expectedIncomeStatusSchema", () => {
  it("accepts the known statuses", () => {
    expect(expectedIncomeStatusSchema.parse("pending")).toBe("pending");
    expect(expectedIncomeStatusSchema.parse("received")).toBe("received");
  });

  it("rejects an unknown status value", () => {
    expect(expectedIncomeStatusSchema.safeParse("cancelled").success).toBe(false);
  });
});

describe("expectedIncomeSchema", () => {
  const valid = {
    id: UUID,
    period: validPeriod,
    label: "Salary",
    amount: validMoney,
    expectedDate: utcDate,
    status: "pending",
  };

  it("parses a valid expected income and runs amount through moneySchema", () => {
    const parsed = expectedIncomeSchema.parse(valid);
    expect(parsed.amount).toEqual(money(250000, "EUR"));
    expect(parsed.status).toBe("pending");
  });

  it("rejects a missing currency", () => {
    expect(expectedIncomeSchema.safeParse({ ...valid, amount: { amount: 250000 } }).success).toBe(
      false,
    );
  });

  it("rejects an invalid (non ISO-4217) currency", () => {
    expect(
      expectedIncomeSchema.safeParse({ ...valid, amount: { amount: 250000, currency: "eur" } })
        .success,
    ).toBe(false);
    expect(
      expectedIncomeSchema.safeParse({ ...valid, amount: { amount: 250000, currency: "EURO" } })
        .success,
    ).toBe(false);
  });

  it("rejects a non-integer (float) amount via moneySchema", () => {
    expect(
      expectedIncomeSchema.safeParse({ ...valid, amount: { amount: 250000.5, currency: "EUR" } })
        .success,
    ).toBe(false);
  });

  it("rejects a non-UTC (offset) datetime", () => {
    expect(
      expectedIncomeSchema.safeParse({ ...valid, expectedDate: "2026-05-25T00:00:00+02:00" })
        .success,
    ).toBe(false);
  });

  it("rejects a malformed (non ISO-8601) date", () => {
    expect(expectedIncomeSchema.safeParse({ ...valid, expectedDate: "25/05/2026" }).success).toBe(
      false,
    );
  });

  it("rejects an empty label", () => {
    expect(expectedIncomeSchema.safeParse({ ...valid, label: "   " }).success).toBe(false);
  });

  it("rejects a non-uuid id", () => {
    expect(expectedIncomeSchema.safeParse({ ...valid, id: "not-a-uuid" }).success).toBe(false);
  });
});

describe("actualIncomeSchema", () => {
  const valid = {
    id: UUID,
    period: validPeriod,
    label: "Salary",
    amount: validMoney,
    date: utcDate,
  };

  it("parses a free-form actual income with no expectation link", () => {
    const parsed = actualIncomeSchema.parse(valid);
    expect(parsed.expectedIncomeId).toBeUndefined();
    expect(parsed.amount).toEqual(money(250000, "EUR"));
  });

  it("parses an actual income confirmed from an expectation", () => {
    const parsed = actualIncomeSchema.parse({ ...valid, expectedIncomeId: UUID });
    expect(parsed.expectedIncomeId).toBe(UUID);
  });

  it("rejects an invalid expectedIncomeId", () => {
    expect(actualIncomeSchema.safeParse({ ...valid, expectedIncomeId: "nope" }).success).toBe(
      false,
    );
  });

  it("rejects a non-UTC datetime", () => {
    expect(
      actualIncomeSchema.safeParse({ ...valid, date: "2026-05-25T00:00:00-05:00" }).success,
    ).toBe(false);
  });
});

describe("createExpectedIncomeSchema", () => {
  const valid = {
    period: validPeriod,
    label: "Bonus",
    amount: validMoney,
    expectedDate: utcDate,
  };

  it("parses a valid create payload (server assigns id and status)", () => {
    const parsed = createExpectedIncomeSchema.parse(valid);
    expect(parsed.amount).toEqual(money(250000, "EUR"));
    expect("id" in parsed).toBe(false);
    expect("status" in parsed).toBe(false);
  });

  it("rejects an invalid currency through the shared money schema", () => {
    expect(
      createExpectedIncomeSchema.safeParse({ ...valid, amount: { amount: 1, currency: "E1R" } })
        .success,
    ).toBe(false);
  });

  it("rejects a missing required field", () => {
    expect(createExpectedIncomeSchema.safeParse({ ...valid, label: undefined }).success).toBe(
      false,
    );
  });
});

describe("editExpectedIncomeSchema", () => {
  it("parses a valid edit payload", () => {
    const parsed = editExpectedIncomeSchema.parse({
      period: validPeriod,
      label: "Salary (adjusted)",
      amount: validMoney,
      expectedDate: utcDate,
    });
    expect(parsed.label).toBe("Salary (adjusted)");
  });
});

describe("confirmExpectedIncomeSchema", () => {
  it("parses an empty payload (keeps expected values)", () => {
    expect(confirmExpectedIncomeSchema.parse({})).toEqual({});
  });

  it("parses an adjusted amount and date", () => {
    const parsed = confirmExpectedIncomeSchema.parse({ amount: validMoney, date: utcDate });
    expect(parsed.amount).toEqual(money(250000, "EUR"));
    expect(parsed.date).toBe(utcDate);
  });

  it("rejects an adjusted amount with a bad currency", () => {
    expect(
      confirmExpectedIncomeSchema.safeParse({ amount: { amount: 1, currency: "us" } }).success,
    ).toBe(false);
  });

  it("rejects an adjusted non-UTC date", () => {
    expect(
      confirmExpectedIncomeSchema.safeParse({ date: "2026-05-25T00:00:00+01:00" }).success,
    ).toBe(false);
  });
});

describe("recordActualIncomeSchema", () => {
  const valid = {
    period: validPeriod,
    label: "Freelance",
    amount: validMoney,
    date: utcDate,
  };

  it("parses a valid free-form actual income payload", () => {
    const parsed = recordActualIncomeSchema.parse(valid);
    expect(parsed.amount).toEqual(money(250000, "EUR"));
  });

  it("rejects a non-integer amount", () => {
    expect(
      recordActualIncomeSchema.safeParse({ ...valid, amount: { amount: 1.25, currency: "EUR" } })
        .success,
    ).toBe(false);
  });

  it("rejects a malformed date", () => {
    expect(recordActualIncomeSchema.safeParse({ ...valid, date: "yesterday" }).success).toBe(false);
  });
});

describe("periodSummarySchema", () => {
  it("parses a summary whose money totals all go through moneySchema", () => {
    const parsed = periodSummarySchema.parse({
      period: validPeriod,
      expectedTotal: { amount: 300000, currency: "EUR" },
      actualTotal: { amount: 250000, currency: "EUR" },
      variance: { amount: -50000, currency: "EUR" },
      pendingCount: 1,
      pendingValue: { amount: 50000, currency: "EUR" },
    });
    expect(parsed.variance).toEqual(money(-50000, "EUR"));
    expect(parsed.pendingCount).toBe(1);
  });

  it("rejects a negative pending count", () => {
    expect(
      periodSummarySchema.safeParse({
        period: validPeriod,
        expectedTotal: validMoney,
        actualTotal: validMoney,
        variance: validMoney,
        pendingCount: -1,
        pendingValue: validMoney,
      }).success,
    ).toBe(false);
  });
});
