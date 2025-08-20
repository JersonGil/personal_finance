'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import type { Database } from '@/types/supabase';

type PlannedRow = Database['public']['Tables']['planned_transactions']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];
interface AvailableCardProps {
  selectedMonth: string;
  transactions: TransactionRow[];
  planned: PlannedRow[];
}

export function AvailableCard({
  selectedMonth,
  transactions,
  planned,
}: Readonly<AvailableCardProps>) {
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);

  const totalIncome = transactions
    .filter((t) => {
      if (t.type !== 'income') return false;

      const d = new Date(t.date);

      if (isNaN(d.getTime())) return false;

      return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
    })
    .reduce((s, t) => s + t.amount, 0);

  const plannedExpenses = planned
    .filter((p) => {
      const [py, pm] = p.month.split('-');
      return p.type === 'expense' && Number(py) === year && Number(pm) === month;
    })
    .reduce((s, p) => s + p.amount, 0);

  const realExpenses = transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return false;
      return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
    })
    .reduce((s, t) => s + t.amount, 0);

  const available = totalIncome - realExpenses - plannedExpenses;
  const color = available >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Disponible</CardTitle>
        <TrendingUp className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>${available.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
