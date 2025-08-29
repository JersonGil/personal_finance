'use client';

import type React from 'react';
import { useCategories } from '@/hooks/use-categories';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CurrencyConverter from './currency-converter';
import type { Budget } from '@/types/finance';
import { currencies } from '@/lib/utils';
import { useDollarPrice } from '@/providers/dollar-price-provider';
import { useBudgets } from '@/hooks/use-budgets';
import { toast } from 'sonner';

interface BudgetModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly budget?: Budget | null;
}

export default function BudgetModal({ isOpen, onClose, budget }: Readonly<BudgetModalProps>) {
  const { getExpenseCategories, loading: categoriesLoading } = useCategories();
  const { createBudget, refetch } = useBudgets();
  const { price } = useDollarPrice();
  const [isPending, setIsPending] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState('');

  useEffect(() => {
    if (budget) {
      setCategory(budget.category);
      setAmount(budget.amount.toString());
      setMonth(budget.month);
    } else {
      // Reset form
      setCategory('');
      setAmount('');
      setMonth(new Date().toISOString().slice(0, 7)); // Current month
    }
  }, [budget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !amount || !month) {
      return;
    }

    setIsPending(true);

    createBudget({
      category,
      amount: Number.parseFloat(amount),
      month,
    })
      .then(async () => {
        toast.success('Presupuesto creado exitosamente');
        await refetch();
        setCategory('');
        setAmount('');
        setMonth('');
        onClose();
      })
      .catch((error) => {
        toast.error('Error al crear presupuesto');
        console.error(error);
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  // Generate month options (current month and next 11 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const value = date.toISOString().slice(0, 7);
    const label = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
    return { value, label };
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              required
              disabled={categoriesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {getExpenseCategories().map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto Presupuestado</Label>
            <CurrencyConverter
              className="mt-0"
              primaryCurrency={currencies.BS}
              secondaryCurrency={currencies.USD}
              price={price ?? 0}
              onChangeAmount={(primary, secondary) => {
                setAmount(secondary);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Mes</Label>
            <Select value={month} onValueChange={setMonth} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un mes" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button disabled={isPending} type="submit">
              {budget ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
