export default function SalaryInput({ salary, onChange }) {
  return (
    <div className="card">
      <label htmlFor="salary">Net monthly salary</label>
      <div className="input-row">
        <span className="currency-symbol">€</span>
        <input
          id="salary"
          type="number"
          min="0"
          step="100"
          placeholder="3000"
          value={salary}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
