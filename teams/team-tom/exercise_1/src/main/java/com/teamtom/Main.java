package com.teamtom;

import java.time.LocalDate;

public class Main {

    public static void main(String[] args) {
        BudgetTracker tracker = new BudgetTracker();

        BudgetAccount savings = new BudgetAccount("Savings", 1000.00);
        BudgetAccount current = new BudgetAccount("Current", 500.00);
        BudgetAccount holiday = new BudgetAccount("Holiday Fund", 0.00);

        savings.addTransaction(new Transaction("t1", Transaction.TransactionType.CREDIT, 2500.00, "Monthly salary", LocalDate.of(2026, 5, 1)));
        savings.addTransaction(new Transaction("t2", Transaction.TransactionType.DEBIT,  850.00, "Rent",           LocalDate.of(2026, 5, 2)));
        savings.addTransaction(new Transaction("t3", Transaction.TransactionType.DEBIT,  120.00, "Groceries",      LocalDate.of(2026, 5, 10)));

        current.addTransaction(new Transaction("t4", Transaction.TransactionType.CREDIT, 200.00, "Freelance work", LocalDate.of(2026, 5, 15)));
        current.addTransaction(new Transaction("t5", Transaction.TransactionType.DEBIT,   60.00, "Electricity bill", LocalDate.of(2026, 5, 18)));

        holiday.addTransaction(new Transaction("t6", Transaction.TransactionType.CREDIT, 300.00, "Holiday savings transfer", LocalDate.of(2026, 5, 20)));

        tracker.addAccount(savings);
        tracker.addAccount(current);
        tracker.addAccount(holiday);

        System.out.println("=== Budget Tracker ===");
        System.out.println();
        System.out.println(tracker.getSummary());
        System.out.println();

        System.out.println("--- Transaction history: Savings ---");
        for (Transaction t : tracker.getAccount("Savings").getTransactions()) {
            System.out.println("  " + t);
        }
    }
}
