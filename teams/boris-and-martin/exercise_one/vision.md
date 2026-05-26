# Vision — Ledger

> A web-first personal finance app where your financial life is a ledger of events, not a spreadsheet of balances.

## What We're Building

A browser app where users record financial events — income arriving, money allocated to a category, a savings deposit, an investment contribution — and immediately see an accurate picture of where they stand. State is never stored directly; it emerges from replaying the event log. The UI feels like a live financial journal, not a form to fill in.

## Why

Personal finance is a domain where correctness is non-negotiable and the event-sourced model maps naturally — money moves are facts, not edits. We chose it because it creates real pressure to get the architecture right, which forces us to work deliberately with Claude rather than just vibe and hope. The exercise succeeds if we end up with a genuine opinion on where AI-assisted development earns its keep — and where you still need a human with a clear head in the loop.

## Architecture

- **Flutter (web-first)**: One codebase, web as the primary form factor. Every layout decision, input affordance, and navigation choice is tuned for the browser. When Flutter offers a mobile/web trade-off, we pick web.
- **Event sourcing**: The app persists an append-only log of domain events (`IncomeReceived`, `BudgetAllocated`, `SavingsDeposited`). Current state is always a projection — derived by replaying events, never stored as mutable state. New features mean new event types and new projections, not schema migrations.
- **Test-driven**: Every function has a failing test before it has an implementation. This is the only way to trust the numbers when correctness is the primary quality bar.

## Quality Bar

Calculations must be exact — not "close enough for a demo", not "probably right". Every running total, allocation check, and balance projection is covered by a unit test. The web build loads fast, navigates without jank, and feels native to a browser tab. Mobile and desktop should work but are not where we tune.

## Guiding Principles

1. **Name the event before you write the widget.** Every feature starts as "what happened?" — `IncomeReceived`, not "add income form". If you can't name the event cleanly, the feature isn't understood yet.

2. **Red before green, always.** Watch the test fail for a behavioural reason before writing implementation. A compiler error is not a failing test.

3. **Correct beats fast; fast beats pretty.** If two approaches exist, pick the one whose output is easier to verify. Only optimise after the numbers are proven right.

4. **Web is the contract.** When layout or interaction patterns are ambiguous, ask "does this feel right in a browser tab?" — not "what does Material Design say?" or "how does it feel on a phone?"

5. **Projections are disposable; events are permanent.** You can delete and rewrite a read model at any time. Think carefully before adding an event type — its semantics are frozen the moment real data is written against it.
