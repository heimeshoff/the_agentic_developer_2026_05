package com.teamtom;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

public class TransactionTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 5, 31);

    private Transaction credit(double amount) {
        return new Transaction("t1", Transaction.TransactionType.CREDIT, amount, "Salary", TODAY);
    }

    @Test
    void constructsWithValidFields() {
        Transaction t = credit(100.00);
        assertEquals("t1", t.getId());
        assertEquals(Transaction.TransactionType.CREDIT, t.getType());
        assertEquals(100.00, t.getAmount());
        assertEquals("Salary", t.getDescription());
        assertEquals(TODAY, t.getDate());
    }

    @Test
    void debitTypeIsPreserved() {
        Transaction t = new Transaction("t2", Transaction.TransactionType.DEBIT, 50.0, "Rent", TODAY);
        assertEquals(Transaction.TransactionType.DEBIT, t.getType());
    }

    @Test
    void throwsOnNullId() {
        assertThrows(IllegalArgumentException.class,
                () -> new Transaction(null, Transaction.TransactionType.CREDIT, 10, "desc", TODAY));
    }

    @Test
    void throwsOnBlankId() {
        assertThrows(IllegalArgumentException.class,
                () -> new Transaction("  ", Transaction.TransactionType.CREDIT, 10, "desc", TODAY));
    }

    @Test
    void throwsOnNullDescription() {
        assertThrows(IllegalArgumentException.class,
                () -> new Transaction("t1", Transaction.TransactionType.CREDIT, 10, null, TODAY));
    }

    @Test
    void throwsOnBlankDescription() {
        assertThrows(IllegalArgumentException.class,
                () -> new Transaction("t1", Transaction.TransactionType.CREDIT, 10, "", TODAY));
    }

    @Test
    void throwsOnNullDate() {
        assertThrows(IllegalArgumentException.class,
                () -> new Transaction("t1", Transaction.TransactionType.CREDIT, 10, "desc", null));
    }

    @Test
    void throwsOnZeroAmount() {
        assertThrows(IllegalArgumentException.class,
                () -> new Transaction("t1", Transaction.TransactionType.CREDIT, 0, "desc", TODAY));
    }

    @Test
    void throwsOnNegativeAmount() {
        assertThrows(IllegalArgumentException.class,
                () -> new Transaction("t1", Transaction.TransactionType.CREDIT, -1, "desc", TODAY));
    }

    @Test
    void notificationTypeIsSupported() {
        Transaction t = new Transaction("t1", Transaction.TransactionType.NOTIFICATION, 1.0, "Balance alert", TODAY);
        assertEquals(Transaction.TransactionType.NOTIFICATION, t.getType());
    }

    @Test
    void toStringContainsKeyFields() {
        String s = credit(100.0).toString();
        assertTrue(s.contains("t1"));
        assertTrue(s.contains("CREDIT"));
        assertTrue(s.contains("100.00"));
        assertTrue(s.contains("Salary"));
        assertTrue(s.contains("2026-05-31"));
    }
}
