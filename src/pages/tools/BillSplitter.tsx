import { useState, useMemo } from 'react';
import { Users, Plus, Trash2, ArrowRight, Receipt, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrencyFixed, type Currency } from '@/lib/currencies';

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  sharedBy: string[]; // member names
}

interface SettlePayment {
  from: string;
  to: string;
  amount: number;
}

export default function BillSplitter() {
  const tool = getToolById('bill-splitter')!;
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  // Members / Participants list
  const [members, setMembers] = useState<string[]>(['Alice', 'Bob', 'Charlie']);
  const [newMemberName, setNewMemberName] = useState('');

  // Expenses list
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', description: 'Group Dinner', amount: 90, paidBy: 'Alice', sharedBy: ['Alice', 'Bob', 'Charlie'] },
    { id: '2', description: 'Uber Ride', amount: 18, paidBy: 'Bob', sharedBy: ['Bob', 'Charlie'] },
  ]);

  // Form states for new expense
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('Alice');
  const [expenseSharedBy, setExpenseSharedBy] = useState<string[]>(['Alice', 'Bob', 'Charlie']);

  // Error/validation messages
  const [memberError, setMemberError] = useState('');
  const [expenseError, setExpenseError] = useState('');

  // Member management
  const addMember = () => {
    const name = newMemberName.trim();
    if (!name) return;
    if (members.map(m => m.toLowerCase()).includes(name.toLowerCase())) {
      setMemberError('This name already exists.');
      return;
    }
    setMembers([...members, name]);
    setNewMemberName('');
    setMemberError('');
    // Auto-select in form
    setExpenseSharedBy([...expenseSharedBy, name]);
  };

  const removeMember = (nameToRemove: string) => {
    if (members.length <= 2) {
      setMemberError('You need at least 2 people to split a bill.');
      return;
    }
    setMembers(members.filter(m => m !== nameToRemove));
    // Remove from form selectors
    setExpenseSharedBy(expenseSharedBy.filter(m => m !== nameToRemove));
    if (expensePaidBy === nameToRemove) {
      const remaining = members.filter(m => m !== nameToRemove);
      setExpensePaidBy(remaining[0] || '');
    }
    // Clean up expenses
    const cleanedExpenses = expenses.map(exp => {
      const nextShared = exp.sharedBy.filter(m => m !== nameToRemove);
      return {
        ...exp,
        paidBy: exp.paidBy === nameToRemove ? (members.filter(m => m !== nameToRemove)[0] || 'Unknown') : exp.paidBy,
        sharedBy: nextShared.length > 0 ? nextShared : [members.filter(m => m !== nameToRemove)[0] || 'Unknown'],
      };
    });
    setExpenses(cleanedExpenses);
    setMemberError('');
  };

  // Expense management
  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const desc = expenseDesc.trim() || 'Unspecified Expense';
    const amt = parseFloat(expenseAmount);

    if (isNaN(amt) || amt <= 0) {
      setExpenseError('Please enter a valid positive amount.');
      return;
    }
    if (expenseSharedBy.length === 0) {
      setExpenseError('Expense must be shared by at least 1 person.');
      return;
    }

    const newExp: Expense = {
      id: Math.random().toString(36).substring(2, 9),
      description: desc,
      amount: amt,
      paidBy: expensePaidBy,
      sharedBy: [...expenseSharedBy],
    };

    setExpenses([...expenses, newExp]);
    setExpenseDesc('');
    setExpenseAmount('');
    setExpenseError('');
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const clearAll = () => {
    setExpenses([]);
    setMembers(['Alice', 'Bob', 'Charlie']);
    setExpensePaidBy('Alice');
    setExpenseSharedBy(['Alice', 'Bob', 'Charlie']);
  };

  const toggleShareCheckbox = (name: string) => {
    if (expenseSharedBy.includes(name)) {
      setExpenseSharedBy(expenseSharedBy.filter(m => m !== name));
    } else {
      setExpenseSharedBy([...expenseSharedBy, name]);
    }
  };

  // calculations: total spent, actual shares, net balances
  const splitSummary = useMemo(() => {
    const spent: Record<string, number> = {};
    const shares: Record<string, number> = {};
    const balance: Record<string, number> = {};

    // Initialize
    members.forEach(m => {
      spent[m] = 0;
      shares[m] = 0;
      balance[m] = 0;
    });

    let totalBill = 0;

    expenses.forEach(exp => {
      totalBill += exp.amount;
      // Add paid amount
      if (spent[exp.paidBy] !== undefined) {
        spent[exp.paidBy] += exp.amount;
      }

      // Add individual shares
      const count = exp.sharedBy.length;
      if (count > 0) {
        const shareAmt = exp.amount / count;
        exp.sharedBy.forEach(p => {
          if (shares[p] !== undefined) {
            shares[p] += shareAmt;
          }
        });
      }
    });

    // Calculate Net Balance: Spent - Shares
    // Positive balance = owed money (paid more than their share)
    // Negative balance = owes money (paid less than their share)
    members.forEach(m => {
      balance[m] = spent[m]! - shares[m]!;
    });

    return { spent, shares, balance, totalBill };
  }, [members, expenses]);

  // Debt simplification greedy algorithm
  const settlementPayments = useMemo<SettlePayment[]>(() => {
    const balances = { ...splitSummary.balance };
    const payments: SettlePayment[] = [];

    // Separate debtors and creditors
    let debtors = Object.keys(balances)
      .map(name => ({ name, bal: balances[name]! }))
      .filter(item => item.bal < -0.01);

    let creditors = Object.keys(balances)
      .map(name => ({ name, bal: balances[name]! }))
      .filter(item => item.bal > 0.01);

    // Greedy solver
    let loops = 0;
    while (debtors.length > 0 && creditors.length > 0 && loops < 100) {
      loops++;
      // Sort to settle largest amounts first
      debtors.sort((a, b) => a.bal - b.bal); // Most negative first (e.g. -50 before -10)
      creditors.sort((a, b) => b.bal - a.bal); // Most positive first

      const debtor = debtors[0]!;
      const creditor = creditors[0]!;

      const amountToSettle = Math.min(Math.abs(debtor.bal), creditor.bal);
      
      if (amountToSettle > 0.01) {
        payments.push({
          from: debtor.name,
          to: creditor.name,
          amount: parseFloat(amountToSettle.toFixed(2)),
        });
      }

      // Adjust balances
      debtor.bal += amountToSettle;
      creditor.bal -= amountToSettle;

      // Filter out completed balances
      debtors = debtors.filter(item => item.bal < -0.01);
      creditors = creditors.filter(item => item.bal > 0.01);
    }

    return payments;
  }, [splitSummary.balance]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Forms */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <CurrencySelector value={currency} onChange={handleCurrencyChange} />
            </CardContent>
          </Card>

          {/* Member List Section */}
          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                1. Group Members
              </CardTitle>
              <CardDescription>
                Add the people splitting these bills. You need at least 2.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter name (e.g. David)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMember()}
                  className="flex-1"
                />
                <Button onClick={addMember} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              {memberError && (
                <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {memberError}
                </p>
              )}

              {/* Badges Grid */}
              <div className="flex flex-wrap gap-2 pt-1">
                {members.map(member => (
                  <span
                    key={member}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 pl-2.5 pr-1 py-1 rounded-full border border-indigo-200/20 shadow-sm"
                  >
                    {member}
                    <button
                      onClick={() => removeMember(member)}
                      className="h-4.5 w-4.5 rounded-full hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px]"
                      title={`Remove ${member}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Expense Section */}
          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-500" />
                2. Add Expense
              </CardTitle>
              <CardDescription>
                Log items, taxis, dinners, or accommodation costs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={addExpense} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="exp-desc">Description</Label>
                    <Input
                      id="exp-desc"
                      placeholder="e.g. Taxi ride or AirBnb"
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="exp-amount">Amount ({sym})</Label>
                    <div className="relative">
                      <span className="w-4 h-4 absolute left-3 top-3 text-muted-foreground flex items-center justify-center font-bold text-xs">{sym}</span>
                      <Input
                        id="exp-amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Paid By */}
                  <div className="space-y-1.5">
                    <Label>Paid By</Label>
                    <Select value={expensePaidBy} onValueChange={setExpensePaidBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payer" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select All / Select None Shortcuts */}
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setExpenseSharedBy([...members])}
                        className="text-[10px] h-7 px-2"
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setExpenseSharedBy([])}
                        className="text-[10px] h-7 px-2 border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Shared By (Checkboxes) */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Split Between</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {members.map(member => (
                      <label
                        key={member}
                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                          expenseSharedBy.includes(member)
                            ? 'bg-indigo-500/5 border-indigo-500/30 text-indigo-900 dark:text-indigo-300 font-semibold'
                            : 'border-muted text-muted-foreground hover:bg-muted/10'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={expenseSharedBy.includes(member)}
                          onChange={() => toggleShareCheckbox(member)}
                          className="rounded border-muted text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="text-xs select-none">{member}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {expenseError && (
                  <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {expenseError}
                  </p>
                )}

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  <Plus className="w-4 h-4 mr-1" /> Add Expense
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results & Debt Settlement */}
        <div className="lg:col-span-5 space-y-6">
          {/* Expenses Log */}
          <Card className="border-muted bg-card/40">
            <CardHeader className="pb-3 border-b flex-row justify-between items-center space-y-0">
              <div>
                <CardTitle className="text-sm font-bold">Expenses List</CardTitle>
                <CardDescription className="text-[11px]">
                  Total added expenses: {expenses.length}
                </CardDescription>
              </div>
              {expenses.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearAll}
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  title="Reset everything"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {expenses.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                  <Receipt className="w-8 h-8 text-muted-foreground/30 mx-auto mb-1" />
                  <p className="font-semibold">No Expenses Logged</p>
                  <p className="max-w-xs mx-auto">Input bills, taxi rides, or shared costs in the left panel.</p>
                </div>
              ) : (
                <div className="divide-y max-h-[200px] overflow-y-auto">
                  {expenses.map(exp => (
                    <div key={exp.id} className="p-3 text-xs flex justify-between items-center hover:bg-muted/10 transition-colors">
                      <div className="space-y-1">
                        <div className="font-bold text-foreground">{exp.description}</div>
                        <div className="text-[10px] text-muted-foreground">
                          Paid by <strong className="text-foreground">{exp.paidBy}</strong> &bull; Split amongst ({exp.sharedBy.join(', ')})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{formatCurrencyFixed(exp.amount, currency, 2)}</span>
                        <Button
                          onClick={() => deleteExpense(exp.id)}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settle Up Calculations */}
          <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm shadow-md">
            <CardHeader className="pb-3 border-b border-indigo-500/10">
              <CardTitle className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                Settle Up Ledger
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5">
              {/* Balances list */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">Individual Balances</span>
                <div className="space-y-1.5">
                  {members.map(m => {
                    const spentAmt = splitSummary.spent[m] || 0;
                    const shareAmt = splitSummary.shares[m] || 0;
                    const balAmt = splitSummary.balance[m] || 0;
                    
                    let balText = `${sym}0.00`;
                    let balColor = 'text-muted-foreground';
                    if (balAmt > 0.01) {
                      balText = `+${formatCurrencyFixed(balAmt, currency, 2)}`;
                      balColor = 'text-emerald-600 dark:text-emerald-400 font-bold';
                    } else if (balAmt < -0.01) {
                      balText = `-${formatCurrencyFixed(Math.abs(balAmt), currency, 2)}`;
                      balColor = 'text-red-600 dark:text-red-400 font-bold';
                    }

                    return (
                      <div key={m} className="p-2.5 bg-background border rounded-lg text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-foreground">{m}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">
                            (Paid: {formatCurrencyFixed(spentAmt, currency, 2)} &bull; Share: {formatCurrencyFixed(shareAmt, currency, 2)})
                          </span>
                        </div>
                        <span className={`font-mono text-xs ${balColor}`}>{balText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transactions to Settle Up */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">Optimized Settle Up Transfers</span>
                {settlementPayments.length === 0 ? (
                  <div className="p-4 bg-background border border-indigo-500/10 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Everything settles cleanly. No transactions needed!
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {settlementPayments.map((p, idx) => (
                      <div key={idx} className="p-3 bg-background border border-indigo-500/15 rounded-lg text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="text-red-500 font-bold">{p.from}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-emerald-500 font-bold">{p.to}</span>
                        </div>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200/20 text-xs">
                          {formatCurrencyFixed(p.amount, currency, 2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}

