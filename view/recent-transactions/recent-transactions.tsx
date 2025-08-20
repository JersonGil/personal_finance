'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import type { Transaction } from '@/types/finance';
import TransactionModal from '@/components/transaction-modal';
import React, { useState } from 'react';
import { toast } from 'sonner';
import NoTransactions from '@/components/no-transactions';
import TransactionCard from './components/transaction-card';
import { createTransaction } from '@/service/transactions';

import { useTransactionsStore } from '@/store/transactions-store';

const RecentTransactions: React.FC = () => {
  const transactions = useTransactionsStore((s) => s.transactions);
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const replaceTemp = useTransactionsStore((s) => s.replaceTemp);
  const removeTransaction = useTransactionsStore((s) => s.removeTransaction);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const PAGE_SIZE = 5;
  const [incomePage, setIncomePage] = useState(0);
  const [expensePage, setExpensePage] = useState(0);

  const handleSaveTransaction = async (
    transaction: Pick<Transaction, 'type' | 'amount' | 'category' | 'description' | 'date'>,
  ) => {
    // Optimistic placeholder id
    const tempId = `temp-${Date.now()}`;
    const optimistic: Transaction = {
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'optimistic',
      ...transaction,
    };
    addTransaction(optimistic);
    const { error, data } = await createTransaction(transaction);
    if (error) {
      toast.error('Hubo un error al guardar la transacción.');
      console.error('Error saving transaction:', error);
      // Rollback optimistic placeholder
      removeTransaction(tempId);
    } else {
      setIsTransactionModalOpen(false);
      toast.success('Transacción guardada correctamente.');
      if (data) {
        // Replace temp with actual row to avoid double counting
        replaceTemp(tempId, data as unknown as Transaction);
      }
    }
  };

  // Filtrar ingresos y egresos desde props
  const incomeTransactionsAll = (transactions ?? []).filter((t) => t.type === 'income');
  const expenseTransactionsAll = (transactions ?? []).filter((t) => t.type === 'expense');
  const totalIncomePages = Math.max(1, Math.ceil(incomeTransactionsAll.length / PAGE_SIZE));
  const totalExpensePages = Math.max(1, Math.ceil(expenseTransactionsAll.length / PAGE_SIZE));
  const clampedIncomePage = Math.min(incomePage, totalIncomePages - 1);
  const clampedExpensePage = Math.min(expensePage, totalExpensePages - 1);
  const incomeSliceStart = clampedIncomePage * PAGE_SIZE;
  const expenseSliceStart = clampedExpensePage * PAGE_SIZE;
  const incomeTransactions = incomeTransactionsAll.slice(
    incomeSliceStart,
    incomeSliceStart + PAGE_SIZE,
  );
  const expenseTransactions = expenseTransactionsAll.slice(
    expenseSliceStart,
    expenseSliceStart + PAGE_SIZE,
  );

  return (
    <>
      <Card className="shadow-md border">
        <CardContent className="p-6">
          {/* Contenedor de título, subtítulo y botón */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold">Transacciones Recientes</h2>
              <p className="text-muted-foreground">Tus últimos movimientos financieros</p>
            </div>
            <Button onClick={() => setIsTransactionModalOpen(true)} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Transacción
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-auto max-h-[500px]">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <h3 className="font-semibold text-green-600">Entradas</h3>
              </div>
              {incomeTransactions.length > 0 ? (
                incomeTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    type="income"
                    description={transaction.description}
                    category={transaction.category}
                    date={transaction.date}
                    amount={transaction.amount}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))
              ) : (
                <NoTransactions messages="No hay ingresos registrados aún." />
              )}
              {incomeTransactionsAll.length > PAGE_SIZE && (
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={clampedIncomePage === 0}
                    onClick={() => setIncomePage((p) => Math.max(0, p - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Página {clampedIncomePage + 1} de {totalIncomePages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={clampedIncomePage >= totalIncomePages - 1}
                    onClick={() => setIncomePage((p) => Math.min(totalIncomePages - 1, p + 1))}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>

            {/* Columna Egresos */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <h3 className="font-semibold text-red-600">Salidas</h3>
              </div>
              {expenseTransactions.length > 0 ? (
                expenseTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    type="expense"
                    description={transaction.description}
                    category={transaction.category}
                    date={transaction.date}
                    amount={transaction.amount}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))
              ) : (
                <NoTransactions messages="No hay egresos registrados aún." />
              )}
              {expenseTransactionsAll.length > PAGE_SIZE && (
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={clampedExpensePage === 0}
                    onClick={() => setExpensePage((p) => Math.max(0, p - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Página {clampedExpensePage + 1} de {totalExpensePages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={clampedExpensePage >= totalExpensePages - 1}
                    onClick={() => setExpensePage((p) => Math.min(totalExpensePages - 1, p + 1))}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
      />
    </>
  );
};

export default RecentTransactions;
