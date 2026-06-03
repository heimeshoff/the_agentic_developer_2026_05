import { formatCurrency } from '../utils/apportion'

const STAT_CARDS = [
  { key: 'spending', label: 'Day-to-day spending', emoji: '🛒' },
  { key: 'savings', label: 'Savings', emoji: '🏦' },
  { key: 'investments', label: 'Investments', emoji: '📈' },
]

function getSavingsHealth(savingsRate) {
  if (savingsRate >= 30) {
    return { color: 'green', message: 'Excellent savings rate' }
  }
  if (savingsRate >= 20) {
    return { color: 'amber', message: 'On track — keep it up' }
  }
  return { color: 'red', message: 'Below target — aim for 20%' }
}

export default function Dashboard({ salary, amounts, splits }) {
  const savingsRate = salary > 0 ? Math.round((amounts.savings / salary) * 100) : 0
  const barWidth = Math.min(savingsRate, 100)
  const health = getSavingsHealth(savingsRate)

  return (
    <div className="dashboard">
      {/* Hero */}
      <div className="dashboard-hero">
        <p className="hero-label">Monthly salary</p>
        <p className="hero-amount">{formatCurrency(salary)}</p>
      </div>

      {/* Stat cards */}
      <div className="stat-cards">
        {STAT_CARDS.map(({ key, label, emoji }) => (
          <div key={key} className={`stat-card stat-card--${key}`}>
            <span className="stat-card__emoji">{emoji}</span>
            <span className="stat-card__label">{label}</span>
            <span className="stat-card__amount">{formatCurrency(amounts[key])}</span>
            <span className="stat-card__pct">{splits[key]}%</span>
          </div>
        ))}
      </div>

      {/* Savings health indicator */}
      <div className="health-card">
        <div className="health-header">
          <span className="health-title">Savings health</span>
          <span className="health-rate">{savingsRate}% savings rate</span>
        </div>
        <div className="health-bar-track">
          <div
            className={`health-bar-fill health-bar-fill--${health.color}`}
            style={{ width: `${barWidth}%` }}
          />
          <div className="health-bar-target" title="20% target" />
        </div>
        <p className={`health-message health-message--${health.color}`}>{health.message}</p>
      </div>
    </div>
  )
}
