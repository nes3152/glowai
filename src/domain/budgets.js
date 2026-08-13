export const BUDGETS = [
  { id: 'budget1', label: 'Under $30', sub: 'Drugstore picks', emoji: '💰', max: 30 },
  { id: 'budget2', label: '$30 – $60', sub: 'Mid-range essentials', emoji: '💳', max: 60 },
  { id: 'budget3', label: '$60 – $100', sub: 'Premium K-Beauty', emoji: '✨', max: 100 },
  { id: 'budget4', label: '$100 – $200', sub: 'Luxury routine', emoji: '💎', max: 200 },
  { id: 'budget5', label: '$200+', sub: 'All the best', emoji: '👑', max: Infinity },
];

/**
 * Spending cap for a budget id. Unknown ids fall back to the widest range so a
 * bad id degrades into "show everything" instead of an empty routine.
 */
export function budgetCap(budgetId) {
  const budget = BUDGETS.find((b) => b.id === budgetId);
  return budget ? budget.max : Infinity;
}

export function budgetLabel(budgetId) {
  const budget = BUDGETS.find((b) => b.id === budgetId);
  return budget ? budget.label : 'Any budget';
}
