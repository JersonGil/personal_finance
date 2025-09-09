'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import BudgetModal from '@/components/budget-modal';
import DeleteBudgetModal from '@/components/delete-budget-modal';
import type { Database } from '@/types/supabase';
import { useTransactions } from '@/hooks/use-get-transactions';
import NoTransactions from '@/components/no-transactions';
import { useBudgets } from '@/hooks/use-budgets';
import { Skeleton } from '@/components/ui/skeleton';

type BudgetRow = Database['public']['Tables']['budgets']['Row'];

export default function BudgetView({ initialBudgets }: Readonly<{ initialBudgets?: BudgetRow[] }>) {
  const { transactions } = useTransactions();
  const { budgets, createBudget, updateBudget, deleteBudget, refetch, loading } = useBudgets({ initialData: initialBudgets });
  const [mutating, setMutating] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetRow | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetRow | null>(null);

  const budgetComparison = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return budgets.filter((b) => b.month === currentMonth).map((budget) => {
      const spent = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            t.category === budget.category &&
            t.date.startsWith(currentMonth),
        )
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: Math.min(percentage, 100),
        month: currentMonth,
      };
    });
  }, [budgets, transactions]);

  const handleEditBudget = (budget: BudgetRow) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const badgeVariant = (p: number) => {
    if (p > 90) return 'destructive';
    if (p > 70) return 'secondary';
    return 'default';
  };

  const barColor = (p: number) => {
    if (p > 90) return 'bg-red-500';
    if (p > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Presupuestos Mensuales</CardTitle>
          <CardDescription>Controla tus gastos por categoría</CardDescription>
        </div>
        <Button onClick={() => setIsBudgetModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Presupuesto
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {(() => {
            if ((loading || mutating) && budgetComparison.length === 0) {
              return (
                <div className="space-y-4">
                  {['a','b','c'].map((k) => (
                    <div key={`skeleton-${k}`} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 w-full">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              );
            }
            if (budgetComparison.length > 0) {
              return budgetComparison.map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{budget.category}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${budget.spent.toLocaleString()} de ${budget.amount.toLocaleString()} gastado
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={badgeVariant(budget.percentage)}>
                      {budget.percentage.toFixed(0)}%
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEditBudget(budget)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setBudgetToDelete(budget);
                        setDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${barColor(budget.percentage)}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Restante: ${budget.remaining.toLocaleString()}</span>
                  <span>{budget.month}</span>
                </div>
              </div>
              ));
            }
            return <NoTransactions messages="No hay presupuestos registrados aún." />;
          })()}
        </div>
      </CardContent>
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        budget={editingBudget}
        onCreate={async (input) => {
          setMutating(true);
          try {
            const { error } = await createBudget({
              category: input.category,
              amount: input.amount,
              month: input.month,
            });
            if (error) return { error };
            await refetch();
          } finally {
            setMutating(false);
          }
        }}
        onUpdate={async (id, input) => {
          setMutating(true);
          try {
            const { error } = await updateBudget(id, {
              category: input.category,
              amount: input.amount,
              month: input.month,
            });
            if (error) return { error };
            await refetch();
          } finally {
            setMutating(false);
          }
        }}
        onAfterChange={refetch}
      />
      <DeleteBudgetModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBudgetToDelete(null);
        }}
        budgetId={budgetToDelete?.id}
        onDelete={async (id) => {
          setMutating(true);
          try {
            const { error } = await deleteBudget(id);
            if (error) return { error };
            await refetch();
          } finally {
            setMutating(false);
          }
        }}
        onAfterChange={refetch}
      />
    </Card>
  );
}
