package com.teamtom;

import java.time.LocalDate;

public class Transaction {

    public enum TransactionType {
        CREDIT, DEBIT, NOTIFICATION
    }

    private final String id;
    private final TransactionType type;
    private final double amount;
    private final String description;
    private final LocalDate date;
    private final String category;

    public Transaction(String id, TransactionType type, double amount, String description, LocalDate date) {
        this(id, type, amount, description, date, "Uncategorized");
    }

    public Transaction(String id, TransactionType type, double amount, String description, LocalDate date, String category) {
        if (id == null || id.isBlank()) throw new IllegalArgumentException("id must not be null or blank");
        if (description == null || description.isBlank()) throw new IllegalArgumentException("description must not be null or blank");
        if (date == null) throw new IllegalArgumentException("date must not be null");
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
        if (category == null || category.isBlank()) throw new IllegalArgumentException("category must not be null or blank");
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.category = category;
    }

    public String getId() { return id; }
    public TransactionType getType() { return type; }
    public double getAmount() { return amount; }
    public String getDescription() { return description; }
    public LocalDate getDate() { return date; }
    public String getCategory() { return category; }

    @Override
    public String toString() {
        return String.format("Transaction[id=%s, type=%s, amount=%.2f, description=%s, date=%s]",
                id, type, amount, description, date);
    }
}
