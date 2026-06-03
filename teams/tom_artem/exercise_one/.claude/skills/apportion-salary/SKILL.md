---
name: apportion-salary
description: Given a net monthly salary, suggest a personalised spending/savings/investments split and explain the reasoning. Use this skill when the user asks how to divide, allocate, or split their salary, or wants advice on financial apportionment.
---

# Apportion Salary

The user wants to split their net monthly salary across three buckets:
- **Day-to-day spending** — rent, food, transport, subscriptions, leisure
- **Savings** — emergency fund, short-term goals (holiday, car, home deposit)
- **Investments** — long-term wealth building (index funds, pension top-up, etc.)

## Step 1 — understand context

Ask (or infer from the conversation) the following before producing numbers:
- What is the net monthly salary?
- Does the user have any existing financial obligations that dominate spending (e.g. high rent, loan repayments)?
- Do they have an emergency fund already (3–6 months expenses)? If not, savings rate should be higher.
- Any short-term savings goal with a deadline?

If the salary was already provided in the conversation, use it directly — do not ask again.

## Step 2 — produce a split

Start from the **50/30/20 rule** as a baseline:
- 50% spending
- 30% savings
- 20% investments

Adjust based on context:
- No emergency fund → shift 10% from investments to savings until fund is built
- High fixed costs (>40% of salary) → acknowledge the constraint, suggest a tighter spending envelope and explain trade-offs
- Specific savings goal with deadline → calculate the required monthly saving and back it into the split

Always ensure the three percentages sum to 100%.

## Step 3 — present results

Show a clear table:

| Category | % | Monthly amount |
|---|---|---|
| Day-to-day spending | X% | €Y |
| Savings | X% | €Y |
| Investments | X% | €Y |
| **Total** | **100%** | **€salary** |

Then add 2–3 sentences of plain-English rationale for the chosen split.

## Step 4 — offer to update the app

Ask: "Would you like me to update the default splits in the app to match these percentages?"

If yes, edit `src/utils/apportion.js` — update `DEFAULT_SPLITS` with the new values. Do not change any other logic.
