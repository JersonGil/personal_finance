'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTransactionsStore } from '@/store/transactions-store';
import type { Transaction } from '@/types/finance';

// Subscribes to realtime changes for current user's transactions and updates the store.
export default function TransactionsRealtime({ userId }: { userId: string | null }) {
  const add = useTransactionsStore((s) => s.addTransaction);
  const update = useTransactionsStore((s) => s.updateTransaction);
  const remove = useTransactionsStore((s) => s.removeTransaction);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('realtime-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newTx = payload.new as Transaction;
          add(newTx);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newTx = payload.new as Transaction;
          update(newTx.id, newTx);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const oldTx = payload.old as Transaction;
          remove(oldTx.id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, add, update, remove]);

  return null;
}
