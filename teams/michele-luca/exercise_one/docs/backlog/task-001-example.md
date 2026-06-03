---
id: task-001
title: Add basic transaction input form
status: pending
priority: high
created: 2026-05-26
assignee: orchestrator
---

# Task: Add basic transaction input form

Create a simple form that allows users to input a new transaction with amount, category, and date. Store it in localStorage using the storage layer.

## Acceptance criteria

- Create a `Transaction` type in `src/types/transaction.ts` with fields:
  - `id: string` (unique identifier)
  - `amount: number` (in cents, integer)
  - `category: string`
  - `date: string` (ISO format)
  - `description?: string` (optional)

- Create a storage module `src/lib/storage.ts` that:
  - Exports `saveTransaction(transaction: Transaction): void`
  - Exports `getTransactions(): Transaction[]`
  - Uses `localStorage` under the key `budget-app-transactions`
  - Serializes/deserializes JSON safely

- Create a component `src/components/TransactionForm.tsx` that:
  - Has input fields for amount (in euros, converted to cents), category, and date
  - Has a submit button
  - On submit: creates a Transaction object (with a generated ID), saves via storage layer, clears the form
  - Uses controlled inputs (React state)

- Create a component `src/components/TransactionList.tsx` that:
  - Reads transactions from storage on mount
  - Displays them in a list (date, category, amount in euros)
  - Re-renders when new transactions are added

- Update `src/App.tsx` to include both components

## Implementation notes

- Money handling: user enters euros (e.g., "12.50"), convert to cents (1250) before storing
- Use `crypto.randomUUID()` for transaction IDs
- Date default: current date in ISO format (`new Date().toISOString().split('T')[0]`)
- No validation required for this first version (keep it simple)

## Definition of Done

- Code compiles (`npm run build` passes)
- Lint passes (`npm run lint`)
- Dev server runs and form is visible (`npm run dev`)
- Screenshot shows the form and list
- Adding a transaction updates the list immediately
- localStorage contains the transaction in JSON format
