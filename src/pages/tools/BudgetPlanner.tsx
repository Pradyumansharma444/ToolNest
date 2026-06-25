/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Info, Plus, Trash2, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrency, type Currency } from '@/lib/currencies';

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  type: 'needs' | 'wants' | 'savings';
}

export default function BudgetPlanner() {
  const tool = getToolById('budget-planner') || {
    id: 'budget-planner',
    name: 'Budget Planner & Analyzer',
    description: 'Track your income and expenses, and analyze your spending using the 50/30/20 budget rule.',
    metaTitle: 'Free Budget Planner & 50/30/20 Analyzer | ToolNest',
    metaDescription: 'Manage your monthly budget. Log custom expenses, categorize as Needs/Wants/Savings, and export budgets as CSV sheets.',
    category: 'finance',
  };

  const [income, setIncome] = useState(() => localStorage.getItem('budget-income') || '3000');
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseType, setExpenseType] = useState<'needs' | 'wants' | 'savings'>('needs');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const cachedExpenses = localStorage.getItem('budget-expenses');
    if (cachedExpenses) {
      try {
        return JSON.parse(cachedExpenses);
      } catch { /* empty */ }
    }
    return [
      { id: '1', name: 'Rent & Housing', amount: 1000, type: 'needs' },
      { id: '2', name: 'Groceries', amount: 300, type: 'needs' },
      { id: '3', name: 'Streaming & Subs', amount: 50, type: 'wants' },
      { id: '4', name: 'Retirement Savings', amount: 400, type: 'savings' },
    ];
  });

  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  const saveToCache = (newIncome: string, newExpenses: ExpenseItem[]) => {
    localStorage.setItem('budget-income', newIncome);
    localStorage.setItem('budget-expenses', JSON.stringify(newExpenses));
  };

  const handleIncomeChange = (val: string) => {
    setIncome(val);
    saveToCache(val, expenses);
  };

  const addExpense = () => {
    const amt = Number(expenseAmount);
    if (!expenseName || !amt || amt <= 0) return;

    const newItem: ExpenseItem = {
      id: crypto.randomUUID(),
      name: expenseName.trim(),
      amount: amt,
      type: expenseType,
    };

    const updated = [...expenses, newItem];
    setExpenses(updated);
    saveToCache(income, updated);

    // Clear inputs
    setExpenseName('');
    setExpenseAmount('');
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveToCache(income, updated);
  };

  const analysis = useMemo(() => {
    const inc = Number(income) || 0;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const needs = expenses.filter((e) => e.type === 'needs').reduce((sum, e) => sum + e.amount, 0);
    const wants = expenses.filter((e) => e.type === 'wants').reduce((sum, e) => sum + e.amount, 0);
    const savings = expenses.filter((e) => e.type === 'savings').reduce((sum, e) => sum + e.amount, 0);

    const balance = inc - totalExpenses;

    const getPercent = (amount: number) => {
      if (inc === 0) return 0;
      return Math.round((amount / inc) * 100);
    };

    return {
      totalExpenses,
      balance,
      needs,
      wants,
      savings,
      needsPercent: getPercent(needs),
      wantsPercent: getPercent(wants),
      savingsPercent: getPercent(savings),
      netSavingsPercent: getPercent(balance > 0 ? balance : 0),
    };
  }, [income, expenses]);

  const exportCSV = () => {
    let csvContent = 'Item,Amount,Category (50/30/20)\n';
    csvContent += `Monthly Income,${income},Income\n`;
    expenses.forEach((e) => {
      csvContent += `"${e.name}",${e.amount},${e.type.toUpperCase()}\n`;
    });
    csvContent += `Total Expenses,${analysis.totalExpenses},Summary\n`;
    csvContent += `Remaining Balance,${analysis.balance},Summary\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'monthly_budget.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ToolLayout tool={tool as any} resultVisible={true}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="md:col-span-1 space-y-4">
          {/* Currency selector */}
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <CurrencySelector value={currency} onChange={handleCurrencyChange} />
          </div>

          {/* Income card */}
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="font-semibold text-sm">Monthly Net Income ({sym})</h3>
            <div>
              <Input
                type="number"
                placeholder="3000"
                value={income}
                onChange={(e) => handleIncomeChange(e.target.value)}
                min="0"
                className="text-lg font-bold text-primary"
              />
            </div>
          </div>

          {/* Add Expense Form */}
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="font-semibold text-sm">Log New Expense</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Expense Item Name</label>
                <Input
                  type="text"
                  placeholder="Grocery store, Gym, Electric bill..."
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Amount ({sym})</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Type (50/30/20)</label>
                  <Select value={expenseType} onValueChange={(v) => setExpenseType(v as 'needs' | 'wants' | 'savings')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="needs">Need (50%)</SelectItem>
                      <SelectItem value="wants">Want (30%)</SelectItem>
                      <SelectItem value="savings">Saving / Debt (20%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addExpense} className="w-full gap-1.5 mt-2">
                <Plus className="w-4 h-4" /> Add Expense
              </Button>
            </div>
          </div>
        </div>

        {/* Breakdown & Analysis Dashboard */}
        <div className="md:col-span-2 space-y-6">
          {/* Main Budget Health Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Total Expenses
              </span>
              <p className="text-lg md:text-xl font-extrabold mt-1 text-red-500">
                {formatCurrency(analysis.totalExpenses, currency)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Net Balance
              </span>
              <p
                className={`text-lg md:text-xl font-extrabold mt-1 ${
                  analysis.balance >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-500'
                }`}
              >
                {formatCurrency(analysis.balance, currency)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center shadow-sm flex items-center justify-center">
              <Button variant="outline" size="sm" onClick={exportCSV} className="w-full h-9 gap-1 text-xs">
                <Download className="w-3.5 h-3.5" /> CSV Export
              </Button>
            </div>
          </div>

          {/* 50/30/20 Rule Analysis */}
          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h4 className="font-semibold text-sm">50/30/20 Budget Rule Breakdown</h4>
            <div className="space-y-4">
              {/* Needs */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-blue-600">Needs (Target: 50%)</span>
                  <span>
                    {formatCurrency(analysis.needs, currency)} ({analysis.needsPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, analysis.needsPercent)}%` }}
                  />
                </div>
              </div>

              {/* Wants */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-500">Wants (Target: 30%)</span>
                  <span>
                    {formatCurrency(analysis.wants, currency)} ({analysis.wantsPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, analysis.wantsPercent)}%` }}
                  />
                </div>
              </div>

              {/* Savings */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-500">Savings & Debt (Target: 20%)</span>
                  <span>
                    {formatCurrency(analysis.savings, currency)} ({analysis.savingsPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, analysis.savingsPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h4 className="font-semibold text-sm">Logged Budget Items</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {expenses.length > 0 ? (
                expenses.map((e) => (
                  <div
                    key={e.id}
                    className="flex justify-between items-center text-xs p-3 rounded-lg border bg-muted/20"
                  >
                    <div>
                      <p className="font-bold text-foreground">{e.name}</p>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Category:{' '}
                        <span
                          className={
                            e.type === 'needs'
                              ? 'text-blue-500'
                              : e.type === 'wants'
                              ? 'text-amber-500'
                              : 'text-emerald-500'
                          }
                        >
                          {e.type}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">{formatCurrency(e.amount, currency)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExpense(e.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No logged expenses. Add some using the side form.</p>
              )}
            </div>
          </div>

          {/* Rule explanation */}
          <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">What is the 50/30/20 Budgeting Rule?</p>
              <p>
                The 50/30/20 rule is a simple, intuitive budgeting framework for allocating your monthly income:
              </p>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>
                  <span className="font-semibold text-foreground">50% Needs</span>: Mandatory costs required to survive (Rent, utilities, minimal grocery budgets, essential transportation).
                </li>
                <li>
                  <span className="font-semibold text-foreground">30% Wants</span>: Discretionary expenses for lifestyle upgrades (Dining out, streaming, clothing shopping, concerts).
                </li>
                <li>
                  <span className="font-semibold text-foreground">20% Savings</span>: Allocations towards financial health (Retirement accounts, stock portfolios, cash savings, additional debt payoff).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
