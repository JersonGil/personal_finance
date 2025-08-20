'use client';
import { useEffect } from 'react';
import { useTransactionsStore } from '@/store/transactions-store';
import type { Transaction } from '@/types/finance';

export default function HydrateTransactions({
  initialTransactions,
}: {
  initialTransactions: Transaction[];
}) {
  const setTransactions = useTransactionsStore((s) => s.setTransactions);
  const hasData = useTransactionsStore((s) => s.transactions.length > 0);
  useEffect(() => {
    if (!hasData && initialTransactions.length) {
      setTransactions(initialTransactions);
    }
  }, [initialTransactions, hasData, setTransactions]);
  return null;
}
