'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import type { Database } from '@/types/supabase';

type BudgetRow = Database['public']['Tables']['budgets']['Row'];
type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];
type BudgetUpdate = Database['public']['Tables']['budgets']['Update'];

export function useBudgets(options?: {
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  initialData?: BudgetRow[];
}) {
  const staleTime = options?.staleTime ?? 5 * 60 * 1000;
  const refetchOnWindowFocus = options?.refetchOnWindowFocus ?? false;

  const [budgets, setBudgets] = useState<BudgetRow[]>(options?.initialData ?? []);
  const [loading, setLoading] = useState(!options?.initialData);
  const { user } = useAuth();

  // Guards y caché de última consulta
  const inFlightRef = useRef<Promise<void> | null>(null);
  const lastFetchedAtRef = useRef<number>(0);
  const lastUserIdRef = useRef<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;

    if (inFlightRef.current) return inFlightRef.current;
    inFlightRef.current = (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id)
          .order('month', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        setBudgets(data || []);
        lastFetchedAtRef.current = Date.now();
        lastUserIdRef.current = user.id;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching budgets:', message);
        setBudgets([]);
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();
    return inFlightRef.current;
  }, [user]);

  // Fetch controlado por usuario + staleness
  useEffect(() => {
    if (!user) return;
    const userChanged = lastUserIdRef.current !== user.id;
    const isStale = Date.now() - lastFetchedAtRef.current > staleTime;
    if (userChanged || isStale || budgets.length === 0) {
      void fetchBudgets();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Opcional: refetch al reenfocar ventana (desactivado por defecto)
  useEffect(() => {
    if (!refetchOnWindowFocus) return;
    const onFocus = () => {
      const isStale = Date.now() - lastFetchedAtRef.current > staleTime;
      if (isStale) void fetchBudgets();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refetchOnWindowFocus, staleTime, fetchBudgets]);

  const createBudget = async (
    budget: Omit<BudgetRow, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
  ) => {
    if (!user) return { error: 'No user authenticated' };

    try {
      const payload: BudgetInsert = {
        ...budget,
        user_id: user.id,
      };
      const { data, error } = await supabase.from('budgets').insert([payload]).select('*').single();

      if (error) throw error;

      setBudgets((prev) => [data as BudgetRow, ...prev]);
      lastFetchedAtRef.current = Date.now();
      return { data: data as BudgetRow, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: message };
    }
  };

  const updateBudget = async (id: string, updates: Partial<BudgetRow>) => {
    if (!user) return { error: 'No user authenticated' };

    try {
      const payload: BudgetUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('budgets')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) throw error;

      setBudgets((prev) => prev.map((b) => (b.id === id ? (data as BudgetRow) : b)));
      return { data: data as BudgetRow, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: message };
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) return { error: 'No user authenticated' };

    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id);

      if (error) throw error;

      setBudgets((prev) => prev.filter((b) => b.id !== id));
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { error: message };
    }
  };

  return {
    budgets,
    loading,
    createBudget,
    updateBudget,
    deleteBudget,
    setBudgets,
    refetch: fetchBudgets,
  };
}
