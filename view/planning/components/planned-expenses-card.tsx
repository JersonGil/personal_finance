'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import type { Database } from '@/types/supabase';

type PlannedRow = Database['public']['Tables']['planned_transactions']['Row'];

interface PlannedExpensesCardProps {
  selectedMonth: string;
  planned: PlannedRow[];
}

export function PlannedExpensesCard({
  selectedMonth,
  planned,
}: Readonly<PlannedExpensesCardProps>) {
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const plannedExpenses = planned
    .filter((p) => {
      const [pYearStr, pMonthStr] = p.month.split('-');
      return p.type === 'expense' && Number(pYearStr) === year && Number(pMonthStr) === month;
    })
    .reduce((sum, p) => sum + p.amount, 0);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Gastos Planificados</CardTitle>
        <Calendar className="h-4 w-4 text-orange-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">${plannedExpenses.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
