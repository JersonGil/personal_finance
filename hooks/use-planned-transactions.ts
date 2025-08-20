'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import type { Database } from '@/types/supabase';

type PlannedRow = Database['public']['Tables']['planned_transactions']['Row'];
type PlannedInsert = Database['public']['Tables']['planned_transactions']['Insert'];
type PlannedUpdate = Database['public']['Tables']['planned_transactions']['Update'];
type PlannedType = Database['public']['Enums']['planned_transaction_type'];

interface UsePlannedOptions {
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  initialData?: PlannedRow[];
}

export function usePlannedTransactions(options?: UsePlannedOptions) {
  const staleTime = options?.staleTime ?? 5 * 60 * 1000; // 5 min
  const refetchOnWindowFocus = options?.refetchOnWindowFocus ?? false;

  const { user } = useAuth();
  const [planned, setPlanned] = useState<PlannedRow[]>(options?.initialData ?? []);
  const [loading, setLoading] = useState(!options?.initialData);
  const [error, setError] = useState<string | null>(null);

  // cache / concurrency guards
  const inFlightRef = useRef<Promise<void> | null>(null);
  const lastFetchedAtRef = useRef<number>(0);
  const lastUserIdRef = useRef<string | null>(null);

  const fetchPlanned = useCallback(async () => {
    if (!user) return;
    if (inFlightRef.current) return inFlightRef.current;
    inFlightRef.current = (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('planned_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('month', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPlanned(data || []);
        lastFetchedAtRef.current = Date.now();
        lastUserIdRef.current = user.id;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching planned transactions:', message);
        setError(message);
        setPlanned([]);
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();
    return inFlightRef.current;
  }, [user]);

  // initial / user change fetch respecting staleness
  useEffect(() => {
    if (!user) return;
    const userChanged = lastUserIdRef.current !== user.id;
    const isStale = Date.now() - lastFetchedAtRef.current > staleTime;
    if (userChanged || isStale || planned.length === 0) {
      void fetchPlanned();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // optional window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return;
    const onFocus = () => {
      const isStale = Date.now() - lastFetchedAtRef.current > staleTime;
      if (isStale) void fetchPlanned();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refetchOnWindowFocus, staleTime, fetchPlanned]);

  const createPlanned = async (
    data: Omit<PlannedRow, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
  ) => {
    if (!user) return { error: 'No user authenticated', data: null };
    try {
      const payload: PlannedInsert = { ...data, user_id: user.id };
      const { data: inserted, error } = await supabase
        .from('planned_transactions')
        .insert([payload])
        .select('*')
        .single();
      if (error) throw error;
      setPlanned((prev) => [inserted as PlannedRow, ...prev]);
      lastFetchedAtRef.current = Date.now();
      return { data: inserted as PlannedRow, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: message };
    }
  };

  const updatePlanned = async (id: string, updates: Partial<PlannedRow>) => {
    if (!user) return { error: 'No user authenticated', data: null };
    try {
      const payload: PlannedUpdate = { ...updates, updated_at: new Date().toISOString() };
      const { data, error } = await supabase
        .from('planned_transactions')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();
      if (error) throw error;
      setPlanned((prev) => prev.map((p) => (p.id === id ? (data as PlannedRow) : p)));
      return { data: data as PlannedRow, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: message };
    }
  };

  const deletePlanned = async (id: string) => {
    if (!user) return { error: 'No user authenticated' };
    try {
      const { error } = await supabase
        .from('planned_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      setPlanned((prev) => prev.filter((p) => p.id !== id));
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { error: message };
    }
  };

  // Aggregated monthly summary via view
  const fetchMonthlySummary = useCallback(async () => {
    if (!user) return { data: [], error: 'No user authenticated' };
    try {
      const { data, error } = await supabase
        .from('v_planned_monthly_summary')
        .select('month, planned_expenses, planned_income')
        .eq('user_id', user.id)
        .order('month', { ascending: true });
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { data: [], error: message };
    }
  }, [user]);

  // derived helpers
  const getByMonth = useCallback(
    (month: string) => planned.filter((p) => p.month === month),
    [planned],
  );

  const totalsByMonth = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const p of planned) {
      if (!map.has(p.month)) map.set(p.month, { income: 0, expense: 0 });
      const bucket = map.get(p.month)!;
      if (p.type === 'income') bucket.income += p.amount;
      else bucket.expense += p.amount;
    }
    return map;
  }, [planned]);

  return {
    planned,
    loading,
    error,
    createPlanned,
    updatePlanned,
    deletePlanned,
    refetch: fetchPlanned,
    fetchMonthlySummary,
    getByMonth,
    totalsByMonth,
    setPlanned, // expose setter for advanced cases
  };
}

export type { PlannedRow, PlannedType };
