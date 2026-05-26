/**
 * The money primitive for the whole app.
 *
 * A {@link Money} is an integer amount of the currency's *minor unit* (e.g. cents
 * for EUR/USD) paired with an ISO-4217 currency code. Floating-point money is never
 * allowed: all arithmetic happens on the integer `amount`, and a decimal string is
 * produced only by {@link formatMoney} at the UI edge.
 */
export type Money = {
  /** Integer number of minor units (cents). Always an integer; may be negative. */
  readonly amount: number;
  /** ISO-4217 currency code, uppercase (e.g. "EUR", "USD", "JPY"). */
  readonly currency: string;
};

/**
 * Number of decimal places (minor-unit exponent) per ISO-4217 currency.
 * Most currencies use 2; a few common exceptions are listed explicitly. Anything not
 * listed defaults to 2.
 */
const CURRENCY_MINOR_UNITS: Readonly<Record<string, number>> = {
  JPY: 0,
  KRW: 0,
  CLP: 0,
  ISK: 0,
  HUF: 0,
  BHD: 3,
  KWD: 3,
  OMR: 3,
  TND: 3,
};

const ISO_4217_CODE = /^[A-Z]{3}$/;

/** Minor-unit exponent for a currency (2 unless the currency is a known exception). */
export function minorUnitDigits(currency: string): number {
  return CURRENCY_MINOR_UNITS[currency] ?? 2;
}

function assertValidCurrency(currency: string): void {
  if (!ISO_4217_CODE.test(currency)) {
    throw new Error(`Invalid ISO-4217 currency code: ${JSON.stringify(currency)}`);
  }
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

/** Construct a {@link Money} from raw minor units, validating the amount and currency. */
export function money(amount: number, currency: string): Money {
  assertValidCurrency(currency);
  if (!Number.isInteger(amount)) {
    throw new Error(`Money amount must be an integer number of minor units, got ${amount}`);
  }
  if (!Number.isSafeInteger(amount)) {
    throw new Error(`Money amount exceeds the safe integer range: ${amount}`);
  }
  return { amount, currency };
}

/** A zero-valued {@link Money} in the given currency. */
export function zeroMoney(currency: string): Money {
  return money(0, currency);
}

/** `a + b`. Throws if the currencies differ. */
export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

/** `a - b`. Throws if the currencies differ. */
export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

/** Negate an amount (`-m`). */
export function negateMoney(m: Money): Money {
  return money(-m.amount, m.currency);
}

/**
 * Sum a list of {@link Money}. All entries must share a currency.
 * An empty list requires an explicit `currency` so the result is unambiguous.
 */
export function sumMoney(values: readonly Money[], currency?: string): Money {
  if (values.length === 0) {
    if (currency === undefined) {
      throw new Error("Cannot sum an empty list without an explicit currency");
    }
    return zeroMoney(currency);
  }
  return values.reduce((total, next) => addMoney(total, next));
}

/**
 * Multiply an amount by an integer factor (e.g. for recurring income over N periods).
 * Kept integer-only on purpose; proportional splits use {@link allocateMoney}.
 */
export function multiplyMoney(m: Money, factor: number): Money {
  if (!Number.isInteger(factor)) {
    throw new Error(`Money can only be multiplied by an integer factor, got ${factor}`);
  }
  return money(m.amount * factor, m.currency);
}

/** True when amounts and currencies are equal. */
export function moneyEquals(a: Money, b: Money): boolean {
  return a.currency === b.currency && a.amount === b.amount;
}

export type MoneyComparison = -1 | 0 | 1;

/** Compare two same-currency amounts: -1 if a<b, 0 if equal, 1 if a>b. */
export function compareMoney(a: Money, b: Money): MoneyComparison {
  assertSameCurrency(a, b);
  if (a.amount < b.amount) return -1;
  if (a.amount > b.amount) return 1;
  return 0;
}

export function isZeroMoney(m: Money): boolean {
  return m.amount === 0;
}

export function isNegativeMoney(m: Money): boolean {
  return m.amount < 0;
}

/**
 * Split an amount into `parts` portions as evenly as possible without losing or
 * inventing minor units. The remainder is distributed one minor unit at a time to the
 * leading portions, so the returned portions always sum back to the original amount.
 *
 * Example: allocate(€10.00, 3) -> [334, 333, 333] cents.
 * Negative amounts allocate symmetrically (remainder spread to leading portions).
 */
export function allocateMoney(m: Money, parts: number): Money[] {
  if (!Number.isInteger(parts) || parts <= 0) {
    throw new Error(`allocateMoney requires a positive integer parts count, got ${parts}`);
  }
  const base = Math.trunc(m.amount / parts);
  let remainder = m.amount - base * parts;
  const step = remainder >= 0 ? 1 : -1;
  const portions: Money[] = [];
  for (let i = 0; i < parts; i += 1) {
    const extra = remainder !== 0 ? step : 0;
    portions.push(money(base + extra, m.currency));
    remainder -= extra;
  }
  return portions;
}

/**
 * Split an amount by integer `ratios` (e.g. budget weights), distributing any
 * rounding remainder to the largest ratios first. Portions sum back to the original.
 */
export function allocateByRatios(m: Money, ratios: readonly number[]): Money[] {
  if (ratios.length === 0) {
    throw new Error("allocateByRatios requires at least one ratio");
  }
  if (!ratios.every((r) => Number.isInteger(r) && r >= 0)) {
    throw new Error("allocateByRatios requires non-negative integer ratios");
  }
  const total = ratios.reduce((sum, r) => sum + r, 0);
  if (total === 0) {
    throw new Error("allocateByRatios requires the ratios to sum to a positive value");
  }
  let remainder = m.amount;
  const portions = ratios.map((ratio) => {
    const share = Math.trunc((m.amount * ratio) / total);
    remainder -= share;
    return share;
  });
  // Distribute the leftover minor units to the largest ratios first for stable results.
  const order = ratios.map((ratio, index) => ({ ratio, index })).sort((a, b) => b.ratio - a.ratio);
  const step = remainder >= 0 ? 1 : -1;
  let cursor = 0;
  while (remainder !== 0) {
    const target = order[cursor % order.length];
    if (target !== undefined) {
      portions[target.index] = (portions[target.index] ?? 0) + step;
      remainder -= step;
    }
    cursor += 1;
  }
  return portions.map((amount) => money(amount, m.currency));
}

/**
 * Parse a human/decimal value into {@link Money} for the given currency.
 *
 * Accepts a number (e.g. `10.5`) or a string (e.g. `"10.50"`, `"1,234.56"`, `"-€10"`).
 * The decimal value is scaled to minor units by the currency's exponent and must land
 * exactly on a minor unit (no sub-cent precision) — otherwise it throws. This is the
 * only place a decimal is turned into integer minor units.
 */
export function parseMoney(input: string | number, currency: string): Money {
  assertValidCurrency(currency);
  const digits = minorUnitDigits(currency);
  const factor = 10 ** digits;

  let decimalString: string;
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new Error(`Cannot parse non-finite money value: ${input}`);
    }
    decimalString = input.toString();
  } else {
    decimalString = input.trim();
  }

  // Strip everything that is not a digit, sign, or decimal separator (currency
  // symbols, spaces, thousands separators).
  const cleaned = decimalString.replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") {
    throw new Error(`Cannot parse money from ${JSON.stringify(input)}`);
  }

  const negative = cleaned.startsWith("-");
  const unsigned = negative ? cleaned.slice(1) : cleaned;
  const parts = unsigned.split(".");
  if (parts.length > 2) {
    throw new Error(`Cannot parse money from ${JSON.stringify(input)}: multiple decimal points`);
  }

  const wholePart = parts[0] ?? "";
  const fractionPart = parts[1] ?? "";
  if (!/^[0-9]*$/.test(wholePart) || !/^[0-9]*$/.test(fractionPart)) {
    throw new Error(`Cannot parse money from ${JSON.stringify(input)}`);
  }
  if (fractionPart.length > digits) {
    throw new Error(
      `Value ${JSON.stringify(input)} has more precision than ${currency} supports (${digits} digits)`,
    );
  }

  const whole = wholePart === "" ? 0 : Number.parseInt(wholePart, 10);
  const paddedFraction = fractionPart.padEnd(digits, "0");
  const fraction = paddedFraction === "" ? 0 : Number.parseInt(paddedFraction, 10);
  const magnitude = whole * factor + fraction;
  return money(negative ? -magnitude : magnitude, currency);
}

/**
 * Format {@link Money} as a localized human-readable string for display.
 *
 * Uses `Intl.NumberFormat` with the currency's minor-unit precision. The integer
 * minor units are divided by the scale *only here*, at the UI edge — never in domain
 * arithmetic. A `locale` may be supplied; otherwise the runtime default is used.
 */
export function formatMoney(m: Money, locale?: string): string {
  assertValidCurrency(m.currency);
  const digits = minorUnitDigits(m.currency);
  const major = m.amount / 10 ** digits;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: m.currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(major);
}

/**
 * Render {@link Money} as a plain decimal string (no currency symbol/grouping),
 * e.g. `{ amount: 1050, currency: "EUR" } -> "10.50"`. Useful for form inputs.
 */
export function toDecimalString(m: Money): string {
  const digits = minorUnitDigits(m.currency);
  const negative = m.amount < 0;
  const abs = Math.abs(m.amount)
    .toString()
    .padStart(digits + 1, "0");
  if (digits === 0) {
    return `${negative ? "-" : ""}${abs}`;
  }
  const whole = abs.slice(0, abs.length - digits);
  const fraction = abs.slice(abs.length - digits);
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}
