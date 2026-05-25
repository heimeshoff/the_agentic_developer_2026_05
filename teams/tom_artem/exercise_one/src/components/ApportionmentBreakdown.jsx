import { formatCurrency } from '../utils/apportion'

const CATEGORIES = [
  { key: 'spending', label: 'Day-to-day spending', emoji: '🛒' },
  { key: 'savings', label: 'Savings', emoji: '🏦' },
  { key: 'investments', label: 'Investments', emoji: '📈' },
]

export default function ApportionmentBreakdown({ amounts }) {
  return (
    <div className="card breakdown">
      <h2>Monthly breakdown</h2>
      <div className="breakdown-grid">
        {CATEGORIES.map(({ key, label, emoji }) => (
          <div key={key} className={`breakdown-item ${key}`}>
            <span className="breakdown-emoji">{emoji}</span>
            <span className="breakdown-label">{label}</span>
            <span className="breakdown-amount">{formatCurrency(amounts[key])}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
