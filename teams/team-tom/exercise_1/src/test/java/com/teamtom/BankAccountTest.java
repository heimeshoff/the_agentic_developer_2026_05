package com.teamtom;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BankAccountTest {

    private BankAccount account;

    @BeforeEach
    void setUp() {
        account = new BankAccount("Tom", 100.0);
    }

    // Constructor
    @Test
    void constructor_validInitialBalance_setsBalance() {
        assertEquals(100.0, account.getBalance());
    }

    @Test
    void constructor_setsOwner() {
        assertEquals("Tom", account.getOwner());
    }

    @Test
    void constructor_zeroInitialBalance_allowed() {
        BankAccount empty = new BankAccount("Tom", 0.0);
        assertEquals(0.0, empty.getBalance());
    }

    @Test
    void constructor_negativeInitialBalance_throws() {
        assertThrows(IllegalArgumentException.class, () -> new BankAccount("Tom", -1.0));
    }

    // Deposit
    @Test
    void deposit_positiveAmount_increasesBalance() {
        account.deposit(50.0);
        assertEquals(150.0, account.getBalance());
    }

    @Test
    void deposit_zero_throws() {
        assertThrows(IllegalArgumentException.class, () -> account.deposit(0));
    }

    @Test
    void deposit_negativeAmount_throws() {
        assertThrows(IllegalArgumentException.class, () -> account.deposit(-10.0));
    }

    // Withdraw
    @Test
    void withdraw_validAmount_decreasesBalance() {
        account.withdraw(40.0);
        assertEquals(60.0, account.getBalance());
    }

    @Test
    void withdraw_exactBalance_succeeds() {
        // Should be able to withdraw the full balance, leaving zero
        account.withdraw(100.0);
        assertEquals(0.0, account.getBalance());
    }

    @Test
    void withdraw_moreThanBalance_throws() {
        assertThrows(IllegalStateException.class, () -> account.withdraw(200.0));
    }

    @Test
    void withdraw_zero_throws() {
        assertThrows(IllegalArgumentException.class, () -> account.withdraw(0));
    }

    @Test
    void withdraw_negativeAmount_throws() {
        assertThrows(IllegalArgumentException.class, () -> account.withdraw(-10.0));
    }
}
