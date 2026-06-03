package com.teamtom;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BudgetTracker {

    private final List<BudgetAccount> accounts = new ArrayList<>();
    private double monthlySpendingLimit = 0;

    public void addAccount(BudgetAccount account) {
        if (account == null) throw new IllegalArgumentException("account must not be null");
        for (BudgetAccount existing : accounts) {
            if (existing.getName().equals(account.getName())) {
                throw new IllegalArgumentException("An account with name '" + account.getName() + "' already exists");
            }
        }
        accounts.add(account);
    }

    public BudgetAccount getAccount(String name) {
        for (BudgetAccount account : accounts) {
            if (account.getName().equals(name)) {
                return account;
            }
        }
        throw new IllegalArgumentException("No account found with name: " + name);
    }

    public List<BudgetAccount> getAccounts() {
        return Collections.unmodifiableList(accounts);
    }

    public double getTotalBalance() {
        double total = 0;
        for (BudgetAccount account : accounts) {
            total += account.getBalance();
        }
        return total;
    }

    public void setMonthlySpendingLimit(double limit) {
        if (limit <= 0) throw new IllegalArgumentException("limit must be positive");
        this.monthlySpendingLimit = limit;
    }

    public void addTransaction(String accountName, Transaction t) {
        BudgetAccount account = getAccount(accountName);
        if (monthlySpendingLimit > 0 && t.getType() == Transaction.TransactionType.DEBIT) {
            YearMonth month = YearMonth.from(t.getDate());
            double monthTotal = 0;
            for (BudgetAccount a : accounts) {
                for (Transaction existing : a.getTransactions()) {
                    if (existing.getType() == Transaction.TransactionType.DEBIT
                            && YearMonth.from(existing.getDate()).equals(month)) {
                        monthTotal += existing.getAmount();
                    }
                }
            }
            if (monthTotal + t.getAmount() > monthlySpendingLimit) {
                throw new IllegalStateException(
                    "Adding this transaction would exceed the monthly spending limit of " + monthlySpendingLimit);
            }
        }
        account.addTransaction(t);
    }

    public Map<String, Double> getSpendingByCategory() {
        Map<String, Double> totals = new HashMap<>();
        for (BudgetAccount account : accounts) {
            for (Transaction t : account.getTransactions()) {
                if (t.getType() == Transaction.TransactionType.DEBIT) {
                    totals.merge(t.getCategory(), t.getAmount(), Double::sum);
                }
            }
        }
        return totals;
    }

    public String getSummary() {
        StringBuilder sb = new StringBuilder();
        for (BudgetAccount account : accounts) {
            sb.append(String.format("  %-20s %.2f%n", account.getName(), account.getBalance()));
        }
        sb.append(String.format("  %-20s %.2f", "TOTAL", getTotalBalance()));
        return sb.toString();
    }
}
