package com.teamtom;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

public class BudgetTrackerTest {

    private BudgetAccount account(String name, double balance) {
        return new BudgetAccount(name, balance);
    }

    @Test
    void startsEmpty() {
        BudgetTracker tracker = new BudgetTracker();
        assertTrue(tracker.getAccounts().isEmpty());
        assertEquals(0.0, tracker.getTotalBalance());
    }

    @Test
    void addAccountAndRetrieve() {
        BudgetTracker tracker = new BudgetTracker();
        BudgetAccount savings = account("Savings", 1000.0);
        tracker.addAccount(savings);
        assertSame(savings, tracker.getAccount("Savings"));
    }

    @Test
    void totalBalanceSumsAllAccounts() {
        BudgetTracker tracker = new BudgetTracker();
        tracker.addAccount(account("Savings", 1000.0));
        tracker.addAccount(account("Current", 500.0));
        assertEquals(1500.0, tracker.getTotalBalance());
    }

    @Test
    void getAccountsIsUnmodifiable() {
        BudgetTracker tracker = new BudgetTracker();
        assertThrows(UnsupportedOperationException.class,
                () -> tracker.getAccounts().add(account("X", 0)));
    }

    @Test
    void throwsOnNullAccount() {
        BudgetTracker tracker = new BudgetTracker();
        assertThrows(IllegalArgumentException.class, () -> tracker.addAccount(null));
    }

    @Test
    void throwsOnDuplicateAccountName() {
        BudgetTracker tracker = new BudgetTracker();
        tracker.addAccount(account("Savings", 100.0));
        assertThrows(IllegalArgumentException.class, () -> tracker.addAccount(account("Savings", 200.0)));
    }

    @Test
    void throwsOnAccountNotFound() {
        BudgetTracker tracker = new BudgetTracker();
        assertThrows(IllegalArgumentException.class, () -> tracker.getAccount("Missing"));
    }

    @Test
    void totalSpendingByCategory() {
        BudgetTracker tracker = new BudgetTracker();
        BudgetAccount checking = new BudgetAccount("Checking", 2000.0);
        LocalDate today = LocalDate.now();
        checking.addTransaction(new Transaction("t1", Transaction.TransactionType.DEBIT, 50.0, "Groceries run", today, "Food"));
        checking.addTransaction(new Transaction("t2", Transaction.TransactionType.DEBIT, 30.0, "Bus pass", today, "Transport"));
        checking.addTransaction(new Transaction("t3", Transaction.TransactionType.DEBIT, 20.0, "Lunch", today, "Food"));
        checking.addTransaction(new Transaction("t4", Transaction.TransactionType.CREDIT, 100.0, "Salary", today, "Income"));
        tracker.addAccount(checking);

        Map<String, Double> spending = tracker.getSpendingByCategory();

        assertEquals(70.0, spending.get("Food"));
        assertEquals(30.0, spending.get("Transport"));
        assertFalse(spending.containsKey("Income"));
    }

    @Test
    void throwsWhenTransactionWouldExceedMonthlyLimit() {
        BudgetTracker tracker = new BudgetTracker();
        tracker.setMonthlySpendingLimit(100.0);
        tracker.addAccount(new BudgetAccount("Checking", 2000.0));
        LocalDate today = LocalDate.now();
        tracker.addTransaction("Checking", new Transaction("t1", Transaction.TransactionType.DEBIT, 60.0, "Groceries", today, "Food"));
        assertThrows(IllegalStateException.class, () ->
            tracker.addTransaction("Checking", new Transaction("t2", Transaction.TransactionType.DEBIT, 50.0, "Dinner", today, "Food"))
        );
    }

    @Test
    void spendingByCategoryExcludesNotificationTransactions() {
        BudgetTracker tracker = new BudgetTracker();
        BudgetAccount checking = new BudgetAccount("Checking", 2000.0);
        LocalDate today = LocalDate.now();
        checking.addTransaction(new Transaction("t1", Transaction.TransactionType.DEBIT, 50.0, "Groceries", today, "Food"));
        checking.addTransaction(new Transaction("t2", Transaction.TransactionType.NOTIFICATION, 99.0, "Low balance alert", today, "Alerts"));
        tracker.addAccount(checking);

        Map<String, Double> spending = tracker.getSpendingByCategory();

        assertEquals(50.0, spending.get("Food"));
        assertFalse(spending.containsKey("Alerts"));
    }

    @Test
    void getSummaryContainsAllAccountsAndTotal() {
        BudgetTracker tracker = new BudgetTracker();
        tracker.addAccount(account("Savings", 1000.0));
        tracker.addAccount(account("Current", 250.0));
        String summary = tracker.getSummary();
        assertTrue(summary.contains("Savings"));
        assertTrue(summary.contains("1000.00"));
        assertTrue(summary.contains("Current"));
        assertTrue(summary.contains("250.00"));
        assertTrue(summary.contains("TOTAL"));
        assertTrue(summary.contains("1250.00"));
    }
}
