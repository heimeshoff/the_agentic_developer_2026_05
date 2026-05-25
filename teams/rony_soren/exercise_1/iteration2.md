# Iteration 2: Portfolio Rebalancing Core Implementation

## Interaction patterns

We followed the agent strategy from CLAUDE.md closely:

1. **Main thread did planning** — read `feature.md`, surveyed the codebase (solution file, test project, missing class library), and understood the full scope before writing any code.
2. **Single sub-agent delegation** — composed one self-contained prompt with everything the sub-agent needed: file paths, types to create, algorithm spec, test scenarios, and build/test commands. The sub-agent did all 25 tool calls (create files, edit projects, build, test).
3. **Main thread verified** — after the sub-agent reported success, re-ran `dotnet test` independently and read all three `.cs` files to confirm the implementation was correct.

**What worked well:** Context stayed lean — only ~55k tokens at 27% capacity despite implementing a full feature. The sub-agent's ~49k token budget was isolated.

**What could improve:** Everything was sent in one big prompt rather than breaking it into smaller, iterative sub-agent calls. For a larger feature, incremental delegation (domain types first, verify, logic next, verify) would catch issues earlier and keep each sub-agent focused.

## What we built

Implemented the full portfolio rebalancing feature as specified in `feature.md`. Starting from an empty scaffold (blank test project, no class library), we built the complete domain model and rebalance algorithm.

## Files created

- **`src/Rebalancer/Rebalancer.csproj`** — new class library project (net10.0)
- **`src/Rebalancer/Portfolio.cs`** — domain types: `TargetAllocation`, `Holding`, `Trade` records, `TradeAction` enum, and `PortfolioValidator`
- **`src/Rebalancer/PortfolioRebalancer.cs`** — static `Rebalance()` method computing buy/sell trades

## Files modified

- **`Rebalancer.slnx`** — added Rebalancer project to solution
- **`src/Rebalancer.Tests/Rebalancer.Tests.csproj`** — added project reference to Rebalancer
- **`src/Rebalancer.Tests/UnitTest1.cs`** — replaced empty test with 12 comprehensive tests

## Architecture

```
Portfolio.cs
├── TargetAllocation(Asset, Percentage)
├── Holding(Asset, Quantity, PricePerUnit) + computed Value
├── Trade(Asset, Action, Quantity)
├── TradeAction { Buy, Sell }
└── PortfolioValidator (static)
    ├── ValidateTargetAllocations — sum=100%, no negatives, no duplicates
    └── ValidateHoldings — no negative quantities or prices

PortfolioRebalancer.cs
└── Rebalance(targets, holdings) → trades
    1. Validate inputs
    2. Compute total portfolio value
    3. For each target: compare desired vs actual value → buy/sell delta
    4. Sell all holdings not in target
    5. Skip balanced assets (minimize trades)
```

## Test coverage (12 tests, all passing)

| Category | Test | Status |
|----------|------|--------|
| Validation | Percentages must sum to 100% | Pass |
| Validation | Negative percentage throws | Pass |
| Validation | Duplicate asset names throw | Pass |
| Validation | Negative quantity throws | Pass |
| Validation | Negative price throws | Pass |
| Rebalance | Empty portfolio, no targets → no trades | Pass |
| Rebalance | Already balanced → no trades | Pass |
| Rebalance | Simple 2-asset rebalance → 1 sell + 1 buy | Pass |
| Rebalance | New asset in target, not in holdings → sell only (no price for buy) | Pass |
| Rebalance | Asset in holdings, not in target → sell all | Pass |
| Rebalance | Zero total value with targets → empty list | Pass |
| Rebalance | Multi-asset scenario → correct mixed trades | Pass |

## Approach

Used the agent strategy from CLAUDE.md: delegated implementation to a sub-agent with a self-contained prompt specifying file paths, expected types, algorithm, and test scenarios. Main thread handled planning and verification.

## Context usage

- Model: claude-opus-4-6
- Tokens used: ~55k / 200k (27%)
- Sub-agent token usage: ~49k (25 tool calls)
