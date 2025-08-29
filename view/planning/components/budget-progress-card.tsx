'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Database } from '@/types/supabase';

type PlannedRow = Database['public']['Tables']['planned_transactions']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type BudgetRow = Database['public']['Tables']['budgets']['Row'];

interface BudgetProgressCardProps {
  selectedMonth: string;
  budgets: BudgetRow[];
  transactions: TransactionRow[];
  planned: PlannedRow[];
}

export function BudgetProgressCard({
  selectedMonth,
  budgets,
  transactions,
  planned,
}: Readonly<BudgetProgressCardProps>) {
  const [y, m] = selectedMonth.split('-');
  const year = Number(y);
  const month = Number(m);

  const totalBudget = budgets
    .filter((b) => b.month === selectedMonth)
    .reduce((s, b) => s + b.amount, 0);

  const realExpenses = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getFullYear() === year && d.getMonth() === month - 1;
    })
    .reduce((s, t) => s + t.amount, 0);

  const plannedExpenses = planned
    .filter((p) => {
      const [py, pm] = p.month.split('-');
      return p.type === 'expense' && Number(py) === year && Number(pm) === month;
    })
    .reduce((s, p) => s + p.amount, 0);

  const totalPlannedExpenses = realExpenses + plannedExpenses;
  const budgetUsagePercentage = totalBudget > 0 ? (totalPlannedExpenses / totalBudget) * 100 : 0;
  const monthLabel = new Date(year, month - 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso del Presupuesto - {monthLabel}</CardTitle>
        <CardDescription>
          Progreso de gastos reales y planificados vs presupuesto total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress
            value={Math.min(budgetUsagePercentage, 100)}
            className={budgetUsagePercentage > 100 ? 'bg-red-100' : ''}
          />
          <div className="flex justify-between text-sm">
            <span>
              ${totalPlannedExpenses.toFixed(2)} de ${totalBudget.toFixed(2)}
            </span>
            <span className={budgetUsagePercentage > 100 ? 'text-red-600' : ''}>
              {budgetUsagePercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
