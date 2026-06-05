# PROJECT_STATE.md — Personal Finance App

> Maintained by agents. Updated after each feature build. Read at the start of every session.
> Last updated: <!-- agents: overwrite this line with the feature name and date when appending -->

---

## Features

_No features implemented yet. This section grows as features are built._

<!--
Each entry follows this template (agents: copy-paste and fill in):

### [Feature Name]
- **Status:** implemented
- **Built:** YYYY-MM-DD
- **Problem solved:** one sentence
- **Approach:** one sentence
- **Files created:** comma-separated list, or "none"
- **Files modified:** comma-separated list
- **How to verify:** 1–2 steps to see it working in the browser
-->

---

## Component Inventory

_Components that exist in `src/components/` and what they do._

| Component | File | Purpose |
|---|---|---|
| SalaryInput | `src/components/SalaryInput.jsx` | Controlled number input for net monthly salary |
| SplitEditor | `src/components/SplitEditor.jsx` | Editable allocation percentages (spending/savings/investments) with sum-to-100 validation |
| ApportionmentBreakdown | `src/components/ApportionmentBreakdown.jsx` | Displays the three monetary amounts computed from the current salary and splits |
| Dashboard | `src/components/Dashboard.jsx` | Hero salary display, stat cards, and savings health bar |

---

## Established Patterns

_Architectural decisions and conventions discovered during implementation — do not re-invent these._

- **State ownership:** All app state lives in `App.jsx`. Pass down via props; lift state to `App.jsx` if two siblings share it. Avoid prop drilling beyond 2 levels.
- **Currency formatting:** Always use `formatCurrency()` from `src/utils/apportion.js`. Never render raw numbers in the UI.
- **Allocation invariant:** Splits must sum to 100% before the breakdown renders. `SplitEditor` enforces this with a visible warning; respect the same rule in any new code that touches splits.
- **Pure utilities:** New business logic goes in `src/utils/` as pure, side-effect-free functions. Components import from there — they do not compute money inline.
- **No TypeScript:** The project is JavaScript only. Do not introduce TypeScript unless explicitly decided.
- **CSS approach:** Plain CSS in `App.css` for shared tokens and layout; no CSS frameworks or CSS-in-JS.
- **Functional components only:** No class components. Hooks for all stateful behaviour.
- **Financial framework:** 50/30/20 rule (spending/savings/investments) is the baseline. `DEFAULT_SPLITS` in `src/utils/apportion.js` drives it. Use `finance-expert` agent to validate any change to financial logic.
- **Locale:** EUR currency, `en-IE` locale (Irish context).

---

## Open Questions / Tech Debt

_Known issues, deferred decisions, and things the next session should address._

_Nothing recorded yet._

<!--
Template for an entry (agents: copy-paste and fill in):

- **[Topic]:** description of the question or debt. Source: <brainstorm/feature name>. Priority: low/medium/high.
-->

---

## Resolved Questions

_Decisions that were open questions and have been settled — kept here so agents don't re-open them._

_Nothing recorded yet._

<!--
Template (agents: copy-paste and fill in):

- **[Topic]:** what was decided and why. Settled during: <feature name>.
-->
