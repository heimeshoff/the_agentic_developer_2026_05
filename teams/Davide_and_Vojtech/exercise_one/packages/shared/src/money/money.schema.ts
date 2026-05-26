import { z } from "zod";
import { type Money, money } from "./money.js";

/**
 * The canonical Zod schema for {@link Money}: the single validator every boundary uses
 * for a money value. It does not re-define money validation — it delegates to the
 * {@link money} constructor (integer minor units + ISO-4217 currency, no floats), so the
 * schema and the runtime helpers can never drift apart.
 */
export const moneySchema: z.ZodType<Money> = z
  .object({
    amount: z.number(),
    currency: z.string(),
  })
  .transform((value: { amount: number; currency: string }, ctx: z.RefinementCtx) => {
    try {
      return money(value.amount, value.currency);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : "Invalid money value",
      });
      return z.NEVER;
    }
  });
