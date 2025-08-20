'use client';

import { create } from 'zustand';
import type { Transaction } from '@/types/finance';

interface TransactionsState {
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, partial: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  replaceTemp: (tempId: string, real: Transaction) => void;
  totals: {
    income: number;
    expenses: number;
    balance: number;
  };
  recompute: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  totals: { income: 0, expenses: 0, balance: 0 },
  setTransactions: (txs: Transaction[]) => {
    set((state) => ({ ...state, transactions: txs }));
    get().recompute();
  },
  addTransaction: (tx: Transaction) => {
    set((state) => ({ ...state, transactions: [tx, ...state.transactions] }));
    get().recompute();
  },
  updateTransaction: (id: string, partial: Partial<Transaction>) => {
    set((state) => ({
      ...state,
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...partial } : t)),
    }));
    get().recompute();
  },
  removeTransaction: (id: string) => {
    set((state) => ({
      ...state,
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
    get().recompute();
  },
  replaceTemp: (tempId: string, real: Transaction) => {
    set((state) => ({
      ...state,
      transactions: state.transactions.map((t) => (t.id === tempId ? real : t)),
    }));
    get().recompute();
  },
  recompute: () => {
    const { transactions } = get();
    const income = transactions
      .filter((t: Transaction) => t.type === 'income')
      .reduce((s: number, t: Transaction) => s + (isNaN(t.amount) ? 0 : t.amount), 0);
    const expenses = transactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((s: number, t: Transaction) => s + (isNaN(t.amount) ? 0 : t.amount), 0);
    set({ totals: { income, expenses, balance: income - expenses } });
  },
}));
