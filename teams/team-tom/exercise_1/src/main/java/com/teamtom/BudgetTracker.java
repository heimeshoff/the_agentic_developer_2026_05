package com.teamtom;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BudgetTracker {

    private final List<BudgetAccount> accounts = new ArrayList<>();

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
