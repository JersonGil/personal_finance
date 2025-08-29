'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import type { Database } from '@/types/supabase';

type BudgetRow = Database['public']['Tables']['budgets']['Row'];

interface TotalBudgetCardProps {
  selectedMonth: string;
  budgets: BudgetRow[];
}

export function TotalBudgetCard({ selectedMonth, budgets }: Readonly<TotalBudgetCardProps>) {
  const totalBudget = budgets
    .filter((b) => b.month === selectedMonth)
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
        <DollarSign className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600">${totalBudget.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
