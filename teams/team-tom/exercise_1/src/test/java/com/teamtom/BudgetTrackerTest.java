package com.teamtom;

import org.junit.jupiter.api.Test;
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
