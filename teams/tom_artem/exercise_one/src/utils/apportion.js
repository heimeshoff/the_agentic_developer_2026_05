export const DEFAULT_SPLITS = {
  spending: 50,
  savings: 30,
  investments: 20,
}

export function apportion(salary, splits = DEFAULT_SPLITS) {
  return {
    spending: (salary * splits.spending) / 100,
    savings: (salary * splits.savings) / 100,
    investments: (salary * splits.investments) / 100,
  }
}

export function formatCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(amount)
}
