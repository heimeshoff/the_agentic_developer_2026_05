package com.teamtom;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

public class BudgetAccountTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 5, 31);

    private Transaction credit(String id, double amount) {
        return new Transaction(id, Transaction.TransactionType.CREDIT, amount, "credit", TODAY);
    }

    private Transaction debit(String id, double amount) {
        return new Transaction(id, Transaction.TransactionType.DEBIT, amount, "debit", TODAY);
    }

    @Test
    void balanceStartsAtOpeningBalance() {
        BudgetAccount account = new BudgetAccount("Savings", 500.0);
        assertEquals(500.0, account.getBalance());
    }

    @Test
    void creditIncreasesBalance() {
        BudgetAccount account = new BudgetAccount("Savings", 500.0);
        account.addTransaction(credit("t1", 200.0));
        assertEquals(700.0, account.getBalance());
    }

    @Test
    void debitDecreasesBalance() {
        BudgetAccount account = new BudgetAccount("Savings", 500.0);
        account.addTransaction(debit("t1", 100.0));
        assertEquals(400.0, account.getBalance());
    }

    @Test
    void multipleTransactionsAccumulate() {
        BudgetAccount account = new BudgetAccount("Current", 1000.0);
        account.addTransaction(credit("t1", 500.0));
        account.addTransaction(debit("t2", 300.0));
        account.addTransaction(credit("t3", 100.0));
        assertEquals(1300.0, account.getBalance());
    }

    @Test
    void getTransactionsReturnsInInsertionOrder() {
        BudgetAccount account = new BudgetAccount("Current", 1000.0);
        Transaction t1 = credit("t1", 100.0);
        Transaction t2 = debit("t2", 50.0);
        account.addTransaction(t1);
        account.addTransaction(t2);
        assertEquals(2, account.getTransactions().size());
        assertSame(t1, account.getTransactions().get(0));
        assertSame(t2, account.getTransactions().get(1));
    }

    @Test
    void getTransactionsIsUnmodifiable() {
        BudgetAccount account = new BudgetAccount("Current", 100.0);
        assertThrows(UnsupportedOperationException.class,
                () -> account.getTransactions().add(credit("t1", 10.0)));
    }

    @Test
    void throwsOnNullTransaction() {
        BudgetAccount account = new BudgetAccount("Savings", 500.0);
        assertThrows(IllegalArgumentException.class, () -> account.addTransaction(null));
    }

    @Test
    void throwsOnDebitExceedingBalance() {
        BudgetAccount account = new BudgetAccount("Savings", 100.0);
        assertThrows(IllegalStateException.class, () -> account.addTransaction(debit("t1", 200.0)));
    }

    @Test
    void throwsOnNullName() {
        assertThrows(IllegalArgumentException.class, () -> new BudgetAccount(null, 0));
    }

    @Test
    void throwsOnBlankName() {
        assertThrows(IllegalArgumentException.class, () -> new BudgetAccount("  ", 0));
    }

    @Test
    void throwsOnNegativeOpeningBalance() {
        assertThrows(IllegalArgumentException.class, () -> new BudgetAccount("Savings", -1));
    }

    @Test
    void zeroOpeningBalanceIsAllowed() {
        BudgetAccount account = new BudgetAccount("Empty", 0.0);
        assertEquals(0.0, account.getBalance());
    }

    @Test
    void toStringContainsNameBalanceAndCount() {
        BudgetAccount account = new BudgetAccount("Savings", 500.0);
        account.addTransaction(credit("t1", 100.0));
        String s = account.toString();
        assertTrue(s.contains("Savings"));
        assertTrue(s.contains("600.00"));
        assertTrue(s.contains("1"));
    }

    @Test
    void getNameReturnsName() {
        assertEquals("Savings", new BudgetAccount("Savings", 0).getName());
    }

    @Test
    void notificationTransactionDoesNotAffectBalance() {
        BudgetAccount account = new BudgetAccount("Savings", 500.0);
        account.addTransaction(new Transaction("t1", Transaction.TransactionType.NOTIFICATION, 1.0, "Balance alert", TODAY));
        assertEquals(500.0, account.getBalance());
    }
}
