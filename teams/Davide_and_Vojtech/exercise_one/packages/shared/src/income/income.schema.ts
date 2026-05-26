import { z } from "zod";
import { moneySchema } from "../money/index.js";

/**
 * Income domain contract (shared by api and web).
 *
 * The income module's job is *plan + reconcile*: forecast expected income for a period,
 * record actuals (confirmed from an expectation or free-form), and surface the variance.
 * Every money field reuses {@link moneySchema} from the shared money primitive — there is
 * no local money shape. All dates are UTC ISO-8601. Types are inferred from these schemas;
 * no shape is hand-written as a duplicate interface.
 */

/** UTC ISO-8601 datetime string (e.g. "2026-05-25T00:00:00.000Z"). */
const isoDateTime = z
  .string()
  .datetime({ offset: false, message: "Expected a UTC ISO-8601 datetime" });

/** A calendar month that income entries roll up to. */
export const periodSchema = z.object({
  year: z.number().int().gte(1970).lte(9999),
  month: z.number().int().gte(1).lte(12),
});
export type Period = z.infer<typeof periodSchema>;

/** Whether an expected entry is still awaited or has been received. */
export const expectedIncomeStatusSchema = z.enum(["pending", "received"]);
export type ExpectedIncomeStatus = z.infer<typeof expectedIncomeStatusSchema>;

const labelSchema = z.string().trim().min(1, "Label is required").max(120);

/** A forecast income entry for a period. */
export const expectedIncomeSchema = z.object({
  id: z.string().uuid(),
  period: periodSchema,
  label: labelSchema,
  amount: moneySchema,
  expectedDate: isoDateTime,
  status: expectedIncomeStatusSchema,
});
export type ExpectedIncome = z.infer<typeof expectedIncomeSchema>;

/**
 * Money that actually arrived. `expectedIncomeId` links it to the expectation it confirms;
 * its absence means free-form (unexpected) income with no prior expectation.
 */
export const actualIncomeSchema = z.object({
  id: z.string().uuid(),
  period: periodSchema,
  label: labelSchema,
  amount: moneySchema,
  date: isoDateTime,
  expectedIncomeId: z.string().uuid().optional(),
});
export type ActualIncome = z.infer<typeof actualIncomeSchema>;

/**
 * Per-period reconcile summary, always recomputed server-side: planned vs. arrived,
 * the variance between them, and what is still pending.
 */
export const periodSummarySchema = z.object({
  period: periodSchema,
  expectedTotal: moneySchema,
  actualTotal: moneySchema,
  variance: moneySchema,
  pendingCount: z.number().int().gte(0),
  pendingValue: moneySchema,
});
export type PeriodSummary = z.infer<typeof periodSummarySchema>;

/** Payload to create a new expected income entry (server assigns id and status=pending). */
export const createExpectedIncomeSchema = z.object({
  period: periodSchema,
  label: labelSchema,
  amount: moneySchema,
  expectedDate: isoDateTime,
});
export type CreateExpectedIncome = z.infer<typeof createExpectedIncomeSchema>;

/** Payload to edit an existing expected income entry. */
export const editExpectedIncomeSchema = z.object({
  period: periodSchema,
  label: labelSchema,
  amount: moneySchema,
  expectedDate: isoDateTime,
});
export type EditExpectedIncome = z.infer<typeof editExpectedIncomeSchema>;

/**
 * Payload to confirm an expected entry as received, turning it into an actual. The amount
 * and date may be adjusted at confirmation time; omitting them keeps the expected values.
 */
export const confirmExpectedIncomeSchema = z.object({
  amount: moneySchema.optional(),
  date: isoDateTime.optional(),
});
export type ConfirmExpectedIncome = z.infer<typeof confirmExpectedIncomeSchema>;

/** Payload to record a free-form (unexpected) actual income with no prior expectation. */
export const recordActualIncomeSchema = z.object({
  period: periodSchema,
  label: labelSchema,
  amount: moneySchema,
  date: isoDateTime,
});
export type RecordActualIncome = z.infer<typeof recordActualIncomeSchema>;
