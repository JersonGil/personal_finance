'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';
import type { Database } from '@/types/supabase';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];

interface RealExpensesCardProps {
  selectedMonth: string;
  transactions: TransactionRow[];
}

export function RealExpensesCard({ selectedMonth, transactions }: Readonly<RealExpensesCardProps>) {
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const realExpenses = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getFullYear() === year && d.getMonth() === month - 1;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Gastos Reales</CardTitle>
        <TrendingDown className="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-600">${realExpenses.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
