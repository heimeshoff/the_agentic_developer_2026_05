export default function SplitEditor({ splits, onChange }) {
  const total = splits.spending + splits.savings + splits.investments
  const valid = total === 100

  function update(key, value) {
    const next = { ...splits, [key]: Number(value) }
    onChange(next)
  }

  return (
    <div className="card">
      <h2>Allocation %</h2>
      {[
        { key: 'spending', label: 'Day-to-day spending' },
        { key: 'savings', label: 'Savings' },
        { key: 'investments', label: 'Investments' },
      ].map(({ key, label }) => (
        <div key={key} className="split-row">
          <label htmlFor={key}>{label}</label>
          <input
            id={key}
            type="number"
            min="0"
            max="100"
            value={splits[key]}
            onChange={e => update(key, e.target.value)}
          />
          <span>%</span>
        </div>
      ))}
      {!valid && (
        <p className="warning">Allocations must sum to 100% (currently {total}%)</p>
      )}
    </div>
  )
}
