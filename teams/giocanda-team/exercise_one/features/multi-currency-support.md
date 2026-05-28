# Multi-Currency Support Feature Specification

## 1. Feature Overview

- **Feature Name:** Multi-Currency Support
- **Category:** International Finance
- **Priority:** Medium (Optional - important for international users)
- **One-Sentence Description:** Support multiple currencies for accounts, transactions, and reporting with automatic conversion and exchange rate tracking.

## 2. Business Value

### What problem does this solve?
- International users have accounts in different currencies
- Travelers need to track expenses in foreign currencies
- Expatriates manage income and expenses across currencies
- Global freelancers receive payments in multiple currencies
- Without multi-currency, users must manually convert everything

### Who benefits?
- Expatriates living abroad
- International travelers
- Global freelancers and remote workers
- Import/export businesses
- Immigrants supporting families in home countries
- Cryptocurrency holders

### Workflow Integration
- Enables accurate net worth calculation across currencies
- Supports international expense tracking
- Allows foreign investment tracking
- Provides exchange rate historical tracking
- Enables currency-aware reporting

## 3. Detailed Requirements

### Functional Requirements

1. **Currency Management**
   - Set primary/base currency (for reporting)
   - Support 150+ world currencies (ISO 4217)
   - Add custom currencies (e.g., cryptocurrency)
   - Currency symbol and formatting per locale

2. **Account Currency**
   - Each account has native currency
   - Display account balance in native currency
   - Convert to base currency for aggregation
   - Multi-currency accounts (e.g., forex trading accounts)

3. **Transaction Currency**
   - Record transaction in original currency
   - Auto-convert to base currency for reporting
   - Store both original and converted amounts
   - Manual exchange rate override option

4. **Exchange Rate Management**
   - Auto-fetch daily exchange rates from API
   - Historical rate lookup for past transactions
   - Manual rate entry option
   - Rate source transparency
   - Cache rates for offline use

5. **Currency Conversion**
   - Real-time conversion in UI
   - Batch conversion for reports
   - Conversion with historical rates (date-specific)
   - Rounding rules per currency

6. **Reporting**
   - All reports in base currency by default
   - Option to view in specific currency
   - Show both original and converted amounts
   - Exchange gain/loss tracking

7. **Budget Multi-Currency**
   - Budgets in base currency or specific currency
   - Cross-currency expense tracking against budget
   - Handle rate fluctuations in budget tracking

8. **Exchange Rate Alerts**
   - Notify when rate changes significantly
   - Favorable rate notifications
   - Rate threshold alerts

### Non-Functional Requirements

**Accuracy:** Exchange rates accurate to 4 decimal places  
**Reliability:** Rate API 99% uptime, fallback sources  
**Performance:** Currency conversion < 100ms  

### Business Rules

- Primary currency required for all users
- Cannot delete primary currency
- All conversions use mid-market rates (no spread)
- Historical transactions use historical rates (immutable)
- Today's transactions use today's rate (may update until EOD)
- Cryptocurrency rates update every 15 minutes (more volatile)

### Edge Cases

- Exchange rate API downtime (use cached rates)
- Historical rates unavailable (use closest available date)
- Currency devaluation / redenomination
- Account balance in multiple sub-currencies
- Split transaction across multiple currencies
- Refund in different currency than purchase
- Transfer between different currency accounts

## 4. User Stories

### Story 1: Track Foreign Expenses
**As a** traveler in Japan  
**I want** to record expenses in JPY and see them converted to USD  
**So that** I know total trip cost in my home currency

**Acceptance Criteria:**
- User can select JPY for expense
- Amount entered in JPY
- System auto-converts to USD using current rate
- Both amounts visible (JPY original, USD converted)
- Exchange rate shown and source cited

### Story 2: Manage Multi-Currency Accounts
**As an** expatriate  
**I want** to have separate accounts in EUR and USD  
**So that** I can track both without manual conversion

**Acceptance Criteria:**
- User creates EUR checking account
- User creates USD savings account
- Dashboard shows both native balances
- Net worth shows total in base currency (USD)
- Conversion rate visible on dashboard

### Story 3: Track Exchange Rate Impact
**As a** forex-aware user  
**I want** to see how exchange rate changes affect my net worth  
**So that** I can understand currency exposure

**Acceptance Criteria:**
- Report shows net worth over time
- Separate line for exchange rate impact vs real changes
- User can see gain/loss from currency movements
- Historical rates used for past calculations

## 5. Data Model

```
Currency {
  code: String(3) PRIMARY KEY (ISO 4217, e.g., USD, EUR, JPY)
  name: String(50)
  symbol: String(5)
  decimal_places: Integer (usually 2, but 0 for JPY, 8 for BTC)
  is_active: Boolean
  is_crypto: Boolean
}

ExchangeRate {
  id: UUID
  base_currency: String(3) (FK to Currency)
  target_currency: String(3) (FK to Currency)
  rate: Decimal(18, 8)
  rate_date: Date
  source: String(50) (e.g., "European Central Bank", "CoinGecko")
  created_at: DateTime
  
  UNIQUE(base_currency, target_currency, rate_date)
}

UserCurrencyPreference {
  id: UUID
  user_id: UUID
  primary_currency: String(3) (FK to Currency)
  favorite_currencies: JSON (array of currency codes)
  rate_alert_threshold: Decimal(5, 2) (percentage)
  created_at: DateTime
  updated_at: DateTime
}

Account {
  -- existing fields plus:
  currency: String(3) (FK to Currency)
}

Transaction {
  -- existing fields plus:
  original_currency: String(3)
  original_amount: Decimal(15, 2)
  converted_currency: String(3)
  converted_amount: Decimal(15, 2)
  exchange_rate: Decimal(18, 8)
  exchange_rate_date: Date
}
```

## 6. User Interface Considerations

### Currency Selection

- **Dropdown:** Currency selector with search, flags, symbols
- **Favorites:** Recently used currencies at top
- **Popular:** Common currencies prioritized
- **Flag Icons:** Visual identification
- **Search:** By name or code

### Amount Display

- **Native:** Show amount in original currency
- **Converted:** Show converted amount in parentheses or below
- **Symbol:** Currency symbol (not code) for brevity
- **Formatting:** Locale-appropriate (commas, decimals, symbol position)

### Exchange Rate Display

- **Inline:** "1 USD = 0.85 EUR" near amounts
- **Icon:** Small indicator showing conversion occurred
- **Tooltip:** Hover for rate details and source
- **Updated:** Show rate freshness ("Updated 2 hours ago")

### Settings

- **Primary Currency:** Prominent setting
- **Favorite Currencies:** Quick-select list
- **Rate Source:** Choice of provider (if multiple)
- **Alert Thresholds:** Configure rate change alerts

**Mobile:** Currency flags, simplified display, quick currency toggle  
**Desktop:** Side-by-side native and converted, rate charts  

## 7. Accessibility Requirements (WCAG 2.1 AA)

- Screen reader announces both original and converted amounts
- Currency codes announced (USD, EUR, not just symbols)
- Exchange rate information accessible
- Currency selector keyboard navigable
- Flag icons have text alternatives
- Conversion indicator not color-only

## 8. Technical Considerations

**API Endpoints:**  
GET /api/currencies (list supported currencies)  
GET /api/exchange-rates?base=USD&target=EUR&date=2026-05-26  
POST /api/user/currency-preferences  
GET /api/conversions/amount?from=USD&to=EUR&amount=100  

**External Integrations:**  
- **Exchange Rate APIs:**
  - European Central Bank (free, daily updates, fiat only)
  - exchangerate-api.com (free tier, multiple updates daily)
  - XE.com API (paid, high accuracy, real-time)
  - CoinGecko / CoinMarketCap (crypto rates)
  
- **Fallback Strategy:**
  - Primary API fails → Secondary API
  - All APIs fail → Use last cached rates (warn user)

**Performance:**
- Cache today's rates (refresh hourly)
- Cache historical rates (never expire)
- Index on (base_currency, target_currency, rate_date)
- Bulk conversion API for reports
- Background job to fetch daily rates

**Conversion Logic:**
```
converted_amount = original_amount × exchange_rate
exchange_rate = target_currency_value / base_currency_value

Example: 100 USD to EUR
If 1 USD = 0.85 EUR, then 100 USD × 0.85 = 85 EUR
```

**Rounding:**
- Store full precision (8 decimal places)
- Display per currency standard (JPY 0, USD 2, BTC 8)
- Round calculations only at display time

## 9. Testing Strategy

**Unit Tests:**
- Currency conversion calculations
- Rounding rules per currency
- Historical rate lookups
- Edge cases (missing rates, zero amounts)

**Integration Tests:**
- Exchange rate API integration
- Transaction conversion end-to-end
- Report aggregation across currencies
- Account balance conversions

**Accessibility Tests:**
- [ ] Screen reader announces currencies correctly
- [ ] Currency selector keyboard accessible
- [ ] Conversion information clear
- [ ] Flag icons have text alternatives

**Manual Tests:**
- Create multi-currency accounts
- Record transactions in various currencies
- Verify conversion accuracy
- Test reports with mixed currencies
- Verify historical rate usage

## 10. Dependencies

**Must Exist First:**  
- Account Management (accounts have currency)
- Transaction History (transactions have currency)

**Depends on This:**  
- All financial features benefit from multi-currency

## 11. Open Questions

1. Support for cryptocurrency (BTC, ETH)? Rates are volatile.
2. Allow user to set custom exchange rates (e.g., company-specific rates)?
3. Track forex trading gains/losses separately?
4. Support historical currency (discontinued currencies)?
5. Notification when favorable rate for planned conversion?
6. Currency conversion calculator tool?
7. Automatic optimal conversion suggestions?
8. Support for precious metals (gold, silver as currency)?
9. Multi-currency cash wallet (physical cash in different currencies)?
10. Integration with forex trading platforms?
