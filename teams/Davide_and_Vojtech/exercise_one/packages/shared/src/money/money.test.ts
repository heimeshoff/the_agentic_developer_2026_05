import { describe, expect, it } from "vitest";
import {
  addMoney,
  allocateByRatios,
  allocateMoney,
  compareMoney,
  formatMoney,
  isNegativeMoney,
  isZeroMoney,
  minorUnitDigits,
  money,
  moneyEquals,
  multiplyMoney,
  negateMoney,
  parseMoney,
  subtractMoney,
  sumMoney,
  toDecimalString,
  zeroMoney,
} from "./money.js";

describe("money construction", () => {
  it("builds a value from integer minor units", () => {
    expect(money(1050, "EUR")).toEqual({ amount: 1050, currency: "EUR" });
  });

  it("allows negative amounts", () => {
    expect(money(-500, "USD")).toEqual({ amount: -500, currency: "USD" });
  });

  it("rejects non-integer amounts (no float money)", () => {
    expect(() => money(10.5, "EUR")).toThrow(/integer/);
  });

  it("rejects amounts outside the safe integer range", () => {
    expect(() => money(Number.MAX_SAFE_INTEGER + 1, "EUR")).toThrow();
  });

  it("rejects invalid currency codes", () => {
    expect(() => money(100, "eur")).toThrow(/ISO-4217/);
    expect(() => money(100, "EURO")).toThrow(/ISO-4217/);
    expect(() => money(100, "E1R")).toThrow(/ISO-4217/);
  });

  it("zeroMoney is a zero amount in the currency", () => {
    expect(zeroMoney("GBP")).toEqual({ amount: 0, currency: "GBP" });
  });
});

describe("minor unit digits", () => {
  it("defaults to 2 decimal places", () => {
    expect(minorUnitDigits("EUR")).toBe(2);
    expect(minorUnitDigits("USD")).toBe(2);
  });

  it("knows zero-decimal currencies", () => {
    expect(minorUnitDigits("JPY")).toBe(0);
  });

  it("knows three-decimal currencies", () => {
    expect(minorUnitDigits("KWD")).toBe(3);
  });
});

describe("addition and subtraction", () => {
  it("adds same-currency amounts", () => {
    expect(addMoney(money(1050, "EUR"), money(250, "EUR"))).toEqual(money(1300, "EUR"));
  });

  it("subtracts same-currency amounts", () => {
    expect(subtractMoney(money(1050, "EUR"), money(250, "EUR"))).toEqual(money(800, "EUR"));
  });

  it("subtraction can go negative", () => {
    expect(subtractMoney(money(100, "EUR"), money(250, "EUR"))).toEqual(money(-150, "EUR"));
  });

  it("throws on currency mismatch when adding", () => {
    expect(() => addMoney(money(100, "EUR"), money(100, "USD"))).toThrow(/Currency mismatch/);
  });

  it("throws on currency mismatch when subtracting", () => {
    expect(() => subtractMoney(money(100, "USD"), money(100, "EUR"))).toThrow(/Currency mismatch/);
  });

  it("negates an amount", () => {
    expect(negateMoney(money(1050, "EUR"))).toEqual(money(-1050, "EUR"));
    expect(negateMoney(money(-1050, "EUR"))).toEqual(money(1050, "EUR"));
  });
});

describe("sum", () => {
  it("sums a list of same-currency amounts", () => {
    const values = [money(1000, "EUR"), money(250, "EUR"), money(75, "EUR")];
    expect(sumMoney(values)).toEqual(money(1325, "EUR"));
  });

  it("sums a single-element list", () => {
    expect(sumMoney([money(500, "USD")])).toEqual(money(500, "USD"));
  });

  it("returns zero for an empty list given an explicit currency", () => {
    expect(sumMoney([], "EUR")).toEqual(money(0, "EUR"));
  });

  it("throws for an empty list without a currency", () => {
    expect(() => sumMoney([])).toThrow(/empty list/);
  });

  it("throws when the list mixes currencies", () => {
    expect(() => sumMoney([money(100, "EUR"), money(100, "USD")])).toThrow(/Currency mismatch/);
  });
});

describe("multiply", () => {
  it("multiplies by an integer factor (e.g. recurring income)", () => {
    expect(multiplyMoney(money(250000, "EUR"), 12)).toEqual(money(3000000, "EUR"));
  });

  it("rejects non-integer factors", () => {
    expect(() => multiplyMoney(money(100, "EUR"), 1.5)).toThrow(/integer factor/);
  });
});

describe("comparison and predicates", () => {
  it("compares same-currency amounts", () => {
    expect(compareMoney(money(100, "EUR"), money(200, "EUR"))).toBe(-1);
    expect(compareMoney(money(200, "EUR"), money(100, "EUR"))).toBe(1);
    expect(compareMoney(money(100, "EUR"), money(100, "EUR"))).toBe(0);
  });

  it("throws when comparing different currencies", () => {
    expect(() => compareMoney(money(100, "EUR"), money(100, "USD"))).toThrow(/Currency mismatch/);
  });

  it("moneyEquals checks amount and currency", () => {
    expect(moneyEquals(money(100, "EUR"), money(100, "EUR"))).toBe(true);
    expect(moneyEquals(money(100, "EUR"), money(100, "USD"))).toBe(false);
    expect(moneyEquals(money(100, "EUR"), money(101, "EUR"))).toBe(false);
  });

  it("isZeroMoney / isNegativeMoney", () => {
    expect(isZeroMoney(money(0, "EUR"))).toBe(true);
    expect(isZeroMoney(money(1, "EUR"))).toBe(false);
    expect(isNegativeMoney(money(-1, "EUR"))).toBe(true);
    expect(isNegativeMoney(money(0, "EUR"))).toBe(false);
  });
});

describe("allocate (even split with remainder)", () => {
  it("splits evenly when divisible", () => {
    const portions = allocateMoney(money(900, "EUR"), 3);
    expect(portions).toEqual([money(300, "EUR"), money(300, "EUR"), money(300, "EUR")]);
  });

  it("distributes the remainder to leading portions", () => {
    const portions = allocateMoney(money(1000, "EUR"), 3);
    expect(portions).toEqual([money(334, "EUR"), money(333, "EUR"), money(333, "EUR")]);
  });

  it("portions always sum back to the original amount", () => {
    const original = money(1000, "EUR");
    const portions = allocateMoney(original, 7);
    expect(sumMoney(portions)).toEqual(original);
  });

  it("handles negative amounts symmetrically", () => {
    const original = money(-1000, "EUR");
    const portions = allocateMoney(original, 3);
    expect(portions).toEqual([money(-334, "EUR"), money(-333, "EUR"), money(-333, "EUR")]);
    expect(sumMoney(portions)).toEqual(original);
  });

  it("rejects a non-positive parts count", () => {
    expect(() => allocateMoney(money(100, "EUR"), 0)).toThrow();
    expect(() => allocateMoney(money(100, "EUR"), -1)).toThrow();
    expect(() => allocateMoney(money(100, "EUR"), 2.5)).toThrow();
  });
});

describe("allocateByRatios (weighted split)", () => {
  it("splits by ratios and sums back exactly", () => {
    const original = money(10000, "EUR");
    const portions = allocateByRatios(original, [30, 15, 20, 25, 10]);
    expect(sumMoney(portions)).toEqual(original);
  });

  it("assigns the remainder to the largest ratio first", () => {
    // 100 cents split 1:1:1 -> 34,33,33 with the extra on the largest (here index 0).
    const portions = allocateByRatios(money(100, "EUR"), [1, 1, 1]);
    expect(portions.map((p) => p.amount)).toEqual([34, 33, 33]);
  });

  it("handles a single ratio", () => {
    expect(allocateByRatios(money(500, "EUR"), [1])).toEqual([money(500, "EUR")]);
  });

  it("rejects empty ratios", () => {
    expect(() => allocateByRatios(money(100, "EUR"), [])).toThrow();
  });

  it("rejects ratios that sum to zero", () => {
    expect(() => allocateByRatios(money(100, "EUR"), [0, 0])).toThrow();
  });

  it("rejects negative or non-integer ratios", () => {
    expect(() => allocateByRatios(money(100, "EUR"), [1, -1])).toThrow();
    expect(() => allocateByRatios(money(100, "EUR"), [1.5, 1])).toThrow();
  });
});

describe("parse", () => {
  it("parses a decimal string to minor units", () => {
    expect(parseMoney("10.50", "EUR")).toEqual(money(1050, "EUR"));
  });

  it("parses an integer string", () => {
    expect(parseMoney("10", "EUR")).toEqual(money(1000, "EUR"));
  });

  it("parses a number", () => {
    expect(parseMoney(10.5, "EUR")).toEqual(money(1050, "EUR"));
  });

  it("pads a single fractional digit", () => {
    expect(parseMoney("10.5", "EUR")).toEqual(money(1050, "EUR"));
  });

  it("parses negative values", () => {
    expect(parseMoney("-10.50", "EUR")).toEqual(money(-1050, "EUR"));
    expect(parseMoney(-10.5, "EUR")).toEqual(money(-1050, "EUR"));
  });

  it("strips currency symbols and thousands separators", () => {
    expect(parseMoney("€1,234.56", "EUR")).toEqual(money(123456, "EUR"));
    expect(parseMoney("$ 1,000.00", "USD")).toEqual(money(100000, "USD"));
  });

  it("parses zero-decimal currencies", () => {
    expect(parseMoney("1000", "JPY")).toEqual(money(1000, "JPY"));
  });

  it("parses three-decimal currencies", () => {
    expect(parseMoney("1.234", "KWD")).toEqual(money(1234, "KWD"));
  });

  it("rejects more precision than the currency allows", () => {
    expect(() => parseMoney("10.555", "EUR")).toThrow(/precision/);
    expect(() => parseMoney("1.5", "JPY")).toThrow(/precision/);
  });

  it("rejects empty or non-numeric input", () => {
    expect(() => parseMoney("", "EUR")).toThrow();
    expect(() => parseMoney("abc", "EUR")).toThrow();
    expect(() => parseMoney("-", "EUR")).toThrow();
  });

  it("rejects multiple decimal points", () => {
    expect(() => parseMoney("1.2.3", "EUR")).toThrow(/decimal point/);
  });

  it("rejects non-finite numbers", () => {
    expect(() => parseMoney(Number.NaN, "EUR")).toThrow();
    expect(() => parseMoney(Number.POSITIVE_INFINITY, "EUR")).toThrow();
  });

  it("rejects invalid currency", () => {
    expect(() => parseMoney("10", "eur")).toThrow(/ISO-4217/);
  });
});

describe("parse/format round-trips through toDecimalString", () => {
  for (const value of ["0.00", "10.50", "1234.56", "-7.25"]) {
    it(`round-trips ${value} (EUR)`, () => {
      const parsed = parseMoney(value, "EUR");
      expect(toDecimalString(parsed)).toBe(value === "0.00" ? "0.00" : value);
    });
  }

  it("round-trips a JPY whole number", () => {
    expect(toDecimalString(parseMoney("1000", "JPY"))).toBe("1000");
  });

  it("round-trips a KWD three-decimal value", () => {
    expect(toDecimalString(parseMoney("1.234", "KWD"))).toBe("1.234");
  });

  it("toDecimalString pads correctly for sub-unit amounts", () => {
    expect(toDecimalString(money(5, "EUR"))).toBe("0.05");
    expect(toDecimalString(money(-5, "EUR"))).toBe("-0.05");
  });
});

describe("format (UI edge)", () => {
  it("formats a 2-decimal currency in en-US", () => {
    expect(formatMoney(money(123456, "USD"), "en-US")).toBe("$1,234.56");
  });

  it("formats a sub-unit amount with correct rounding/padding", () => {
    expect(formatMoney(money(5, "USD"), "en-US")).toBe("$0.05");
  });

  it("formats a zero-decimal currency with no fraction", () => {
    expect(formatMoney(money(1000, "JPY"), "en-US")).toBe("¥1,000");
  });

  it("formats negative amounts", () => {
    expect(formatMoney(money(-1050, "USD"), "en-US")).toBe("-$10.50");
  });

  it("respects the requested locale", () => {
    // de-DE uses a comma decimal separator and a trailing currency symbol.
    const formatted = formatMoney(money(123456, "EUR"), "de-DE");
    expect(formatted).toContain("1.234,56");
    expect(formatted).toContain("€");
  });
});
