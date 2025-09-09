import type { Transaction } from '@/types/finance';
import { supabase } from '@/lib/supabase';
import { getUser } from './auth';

type NewTransactionInput = Pick<
  Transaction,
  'type' | 'amount' | 'category' | 'description' | 'date'
>;

export const createTransaction = async (transaction: NewTransactionInput) => {
  const user = await getUser();
  if (!user) {
    const error = new Error('No authenticated user');
    console.error(error);
    return { data: null, error };
  }

  const now = new Date().toISOString();
  const payload: Omit<Transaction, 'id'> = {
    ...transaction,
    created_at: now,
    updated_at: now,
    user_id: user.user.id,
  };

  const { data, error } = await supabase.from('transactions').insert(payload).select().single();

  if (error) {
    console.error('Error creating transaction:', error);
    return { data: null, error };
  }
  return { data, error: null };
};

export const updateTransaction = async (
  id: string,
  changes: Partial<NewTransactionInput>,
): Promise<{ data: Transaction | null; error: Error | null }> => {
  const user = await getUser();
  if (!user) {
    const error = new Error('No authenticated user');
    console.error(error);
    return { data: null, error };
  }

  const now = new Date().toISOString();
  const payload = {
    ...changes,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    return { data: null, error };
  }
  return { data: data as Transaction, error: null };
};

