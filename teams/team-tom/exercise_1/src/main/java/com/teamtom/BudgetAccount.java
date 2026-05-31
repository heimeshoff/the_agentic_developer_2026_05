package com.teamtom;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BudgetAccount {

    private final String name;
    private final double openingBalance;
    private final List<Transaction> transactions = new ArrayList<>();

    public BudgetAccount(String name, double openingBalance) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("name must not be null or blank");
        if (openingBalance < 0) throw new IllegalArgumentException("opening balance must not be negative");
        this.name = name;
        this.openingBalance = openingBalance;
    }

    public void addTransaction(Transaction t) {
        if (t == null) throw new IllegalArgumentException("transaction must not be null");
        if (t.getType() == Transaction.TransactionType.DEBIT && t.getAmount() > getBalance()) {
            throw new IllegalStateException("Insufficient funds for debit");
        }
        transactions.add(t);
    }

    public double getBalance() {
        double balance = openingBalance;
        for (Transaction t : transactions) {
            if (t.getType() == Transaction.TransactionType.CREDIT) {
                balance += t.getAmount();
            } else {
                balance -= t.getAmount();
            }
        }
        return balance;
    }

    public List<Transaction> getTransactions() {
        return Collections.unmodifiableList(transactions);
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return String.format("BudgetAccount[name=%s, balance=%.2f, transactions=%d]",
                name, getBalance(), transactions.size());
    }
}
