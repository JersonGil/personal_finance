'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import type { Database } from '@/types/supabase';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
interface AvailableCardProps {
  transactions: TransactionRow[];
}

export function AvailableCard({
  transactions,
}: Readonly<AvailableCardProps>) {
  const globalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const globalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const totalIncome = globalIncome - globalExpenses
  const color = totalIncome >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Disponible</CardTitle>
        <TrendingUp className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>${totalIncome.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
