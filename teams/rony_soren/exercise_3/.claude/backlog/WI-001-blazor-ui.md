# WI-001: Build Blazor Server Web UI for Portfolio Rebalancer

**Status:** pending
**Priority:** P1
**Type:** feature

## Decision

Build a web UI using Blazor Server to expose the existing portfolio rebalancing domain logic through three interactive screens.

## Why Blazor Server

- Keeps everything in C#/.NET — no JavaScript framework, no separate API layer
- Reuses domain types (`TargetAllocation`, `Holding`, `Trade`) directly in UI components
- Appropriate for a workshop project where speed of development matters more than scale

## Existing Domain Layer

The following types and logic are already implemented and tested:

- `TargetAllocation(Name, Percentage)` — defines desired asset split
- `Holding(Name, Quantity, PricePerUnit)` — current holdings
- `Trade(Name, Action, Quantity)` — calculated buy/sell trades
- `PortfolioRebalancer.Rebalance()` — core calculation logic
- `PortfolioValidator` — validation (allocations sum to 100%, no negatives, target assets exist in holdings)

## UI Scope (3 screens/sections)

### 1. Target Allocation Editor
- Add/edit/remove asset names with percentage weights
- Show running total of percentages
- Validate that allocations sum to 100%
- Visual indicator when total != 100%

### 2. Current Holdings Editor
- Add/edit/remove holdings (name, quantity, price per unit)
- Show calculated total portfolio value
- Asset names should correspond to target allocation names

### 3. Rebalance Results
- "Rebalance" button calls `PortfolioRebalancer.Rebalance()`
- Display trade list: asset name, action (buy/sell), quantity
- Visually distinguish buys from sells (colour coding)
- Disabled/hidden until both allocation and holdings are valid

## Out of Scope

- Persistence / database
- Authentication / authorization
- Real-time price feeds
- Transaction history

## Acceptance Criteria

- [ ] Blazor Server project added to `Rebalancer.slnx`
- [ ] Target allocation editor with add/edit/remove and running total
- [ ] Allocation validation (sum to 100%) surfaced in UI
- [ ] Holdings editor with add/edit/remove and total value display
- [ ] Rebalance button produces trade list from domain engine
- [ ] Buys and sells are visually distinct
- [ ] All domain validation errors displayed to user
- [ ] Solution builds and runs with `dotnet run`
