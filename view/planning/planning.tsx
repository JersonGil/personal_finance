'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { PlanningModal } from './components/planning-modal';
import type { Database } from '@/types/supabase';
import { usePlannedTransactions, PlannedRow } from '@/hooks/use-planned-transactions';
import { useBudgets } from '@/hooks/use-budgets';
import { useTransactions } from '@/hooks/use-get-transactions';
import type { TransactionType } from '@/types/finance';
import { useCategories } from '@/hooks/use-categories';
import { TotalBudgetCard } from './components/total-budget-card';
import { RealExpensesCard } from './components/real-expenses-card';
import { PlannedExpensesCard } from './components/planned-expenses-card';
import { AvailableCard } from './components/available-card';
import { BudgetProgressCard } from './components/budget-progress-card';

// PlannedRow imported from hook
type BudgetRow = Database['public']['Tables']['budgets']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];

interface PlanningViewProps {
  initialPlanned?: PlannedRow[];
  initialBudgets?: BudgetRow[];
  initialTransactions?: TransactionRow[];
}

export function PlanningView({
  initialPlanned,
  initialBudgets,
  initialTransactions,
}: Readonly<PlanningViewProps>) {
  const { planned, createPlanned, updatePlanned, deletePlanned } = usePlannedTransactions({
    initialData: initialPlanned,
  });
  const { budgets } = useBudgets({ initialData: initialBudgets });
  // Normalize transaction type to expected union (income|expense)
  const { transactions } = useTransactions({
    initialData: initialTransactions?.map((t) => ({ ...t, type: t.type as TransactionType })),
  });
  const { categories } = useCategories();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanned, setEditingPlanned] = useState<PlannedRow | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
  });

  // Métricas se calculan ahora dentro de cada card para reducir acoplamiento aquí.

  const currentMonthPlanned = planned?.filter((p) => p.month === selectedMonth);

  const handleSavePlanned = () => {
    if (!formData.description || !formData.amount || !formData.category) return;

    if (editingPlanned) {
      void updatePlanned(editingPlanned.id, {
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
      });
    } else {
      void createPlanned({
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
        month: selectedMonth,
      });
    }

    setIsModalOpen(false);
    setEditingPlanned(null);
    setFormData({ description: '', amount: '', category: '', type: 'expense' });
  };

  const handleEditPlanned = (plannedItem: PlannedRow) => {
    setEditingPlanned(plannedItem);
    setFormData({
      description: plannedItem.description,
      amount: plannedItem.amount.toString(),
      category: plannedItem.category,
      type: plannedItem.type,
    });
    setIsModalOpen(true);
  };

  const handleDeletePlanned = (id: string) => {
    void deletePlanned(id);
  };

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planificación</h1>
          <p className="text-muted-foreground">Planifica tus gastos e ingresos futuros</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() + i);
                const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                return (
                  <SelectItem key={value} value={value}>
                    {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas del mes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TotalBudgetCard selectedMonth={selectedMonth} budgets={budgets} />
        <RealExpensesCard selectedMonth={selectedMonth} transactions={transactions} />
        <PlannedExpensesCard selectedMonth={selectedMonth} planned={planned} />
        <AvailableCard
          selectedMonth={selectedMonth}
          transactions={transactions}
          planned={planned}
        />
      </div>

      {/* Progreso del presupuesto */}
      <BudgetProgressCard
        selectedMonth={selectedMonth}
        budgets={budgets}
        transactions={transactions}
        planned={planned}
      />

      {/* Transacciones planificadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transacciones Planificadas</CardTitle>
            <CardDescription>
              Gastos e ingresos planificados para {getMonthName(selectedMonth)}
            </CardDescription>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingPlanned(null);
                  setFormData({ description: '', amount: '', category: '', type: 'expense' });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Planificado
              </Button>
            </DialogTrigger>
            <PlanningModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              editingPlanned={editingPlanned}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSavePlanned}
              categories={categories}
            />
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentMonthPlanned?.map((planned) => (
              <div
                key={planned.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  planned.type === 'income'
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${planned.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <div>
                    <p className="font-medium">{planned.description}</p>
                    <p className="text-sm text-muted-foreground">{planned.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-bold ${planned.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {planned.type === 'income' ? '+' : '-'}${planned.amount}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditPlanned(planned)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeletePlanned(planned.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {currentMonthPlanned?.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay transacciones planificadas para este mes
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
