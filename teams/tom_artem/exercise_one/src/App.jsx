import { useState } from 'react'
import SalaryInput from './components/SalaryInput'
import ApportionmentBreakdown from './components/ApportionmentBreakdown'
import SplitEditor from './components/SplitEditor'
import Dashboard from './components/Dashboard'
import { apportion, DEFAULT_SPLITS } from './utils/apportion'
import './App.css'

export default function App() {
  const [salary, setSalary] = useState('')
  const [splits, setSplits] = useState(DEFAULT_SPLITS)

  const amounts = salary ? apportion(parseFloat(salary), splits) : null

  return (
    <div className="app">
      <h1>Personal Finance Planner</h1>
      <SalaryInput salary={salary} onChange={setSalary} />
      <SplitEditor splits={splits} onChange={setSplits} />
      {amounts && (
        <>
          <Dashboard salary={parseFloat(salary)} amounts={amounts} splits={splits} />
          <ApportionmentBreakdown amounts={amounts} />
        </>
      )}
    </div>
  )
}
