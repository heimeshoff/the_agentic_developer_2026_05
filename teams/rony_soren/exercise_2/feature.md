# Feature: Portfolio Rebalancing

## Goal

Given a target allocation and current holdings, calculate the trades needed to rebalance a stock portfolio.

## Core Concepts

- **Target Allocation** — desired percentage split across assets (e.g., 60% stocks, 30% bonds, 10% cash)
- **Current Holdings** — what the user actually holds, with quantities and current prices
- **Rebalance Plan** — the buy/sell orders needed to move from current to target

## User Stories

### 1. Define target allocation
As a user, I can define a target allocation as a set of asset names with percentage weights that sum to 100%.

### 2. Enter current holdings
As a user, I can enter my current holdings — asset name, quantity, and current price per unit.

### 3. Calculate rebalance trades
As a user, I can generate a rebalance plan that shows which assets to buy or sell (and how much) to reach my target allocation.

## Constraints

- Percentages in a target allocation must sum to 100%
- Quantities cannot be negative
- The rebalance plan should minimise the number of trades where possible
