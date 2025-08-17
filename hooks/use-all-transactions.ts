"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import type { Transaction } from "@/types/finance"
import type { Category } from "@/hooks/use-categories"

export interface EnrichedTransaction extends Transaction {
  categoryMeta?: {
    id?: string
    color?: string
    icon?: string
    type?: Category["type"]
  }
}

interface UseAllTransactionsOptions {
  realtime?: boolean
  staleTime?: number
}

// Helper to enrich a transaction with category meta
function enrichTransactions(raw: Transaction[], categories: Category[]): EnrichedTransaction[] {
  if (!raw.length) return []
  return raw.map(t => {
    const match = categories.find(c => c.name === t.category)
    return match ? { ...t, categoryMeta: { id: match.id, color: match.color, icon: match.icon, type: match.type } } : t
  })
}

type TxEventPayload = { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: unknown; old: unknown }
function applyRealtimeChange(prev: EnrichedTransaction[], payload: TxEventPayload): EnrichedTransaction[] {
  const newRow = payload.new as Transaction | null
  const oldRow = payload.old as Transaction | null
  switch (payload.eventType) {
    case 'INSERT':
      if (!newRow) return prev
      if (prev.some(t => t.id === newRow.id)) return prev
      return [{ ...newRow }, ...prev]
    case 'UPDATE':
      if (!newRow) return prev
      return prev.map(t => t.id === newRow.id ? { ...newRow } : t)
    case 'DELETE':
      if (!oldRow) return prev
      return prev.filter(t => t.id !== oldRow.id)
    default:
      return prev
  }
}

export function useAllTransactions(options?: UseAllTransactionsOptions) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<EnrichedTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const staleTime = options?.staleTime ?? 5 * 60 * 1000
  const enableRealtime = options?.realtime ?? true

  const inFlightRef = useRef<Promise<void> | null>(null)
  const lastFetchedAtRef = useRef<number>(0)
  const lastUserIdRef = useRef<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!user) return
    if (inFlightRef.current) return inFlightRef.current
    inFlightRef.current = (async () => {
      try {
        setLoading(true)
        setError(null)
        const [txRes, catRes] = await Promise.all([
          supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }),
          supabase.from("categories").select("*").eq("user_id", user.id)
        ])
        if (txRes.error) throw txRes.error
        if (catRes.error) throw catRes.error
        const categories: Category[] = (catRes.data || []).map(c => ({
          ...c,
          type: c.type as Category["type"],
          color: c.color ?? "",
          icon: c.icon ?? ""
        }))
        const rawTx: Transaction[] = (txRes.data || []).map(t => ({
          ...t,
          type: t.type as Transaction['type']
        }))
  const enriched: EnrichedTransaction[] = enrichTransactions(rawTx, categories)
        setTransactions(enriched)
        lastFetchedAtRef.current = Date.now()
        lastUserIdRef.current = user.id
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error"
        setError(msg)
        console.error("useAllTransactions fetch error", msg)
      } finally {
        setLoading(false)
        inFlightRef.current = null
      }
    })()
    return inFlightRef.current
  }, [user])

  // initial + staleness
  useEffect(() => {
    if (!user) return
    const userChanged = lastUserIdRef.current !== user.id
    const isStale = Date.now() - lastFetchedAtRef.current > staleTime
    if (userChanged || isStale || transactions.length === 0) {
      void fetchAll()
    } else {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // realtime subscription
  useEffect(() => {
    if (!user || !enableRealtime) return
    const channel = supabase.channel('all-transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, (payload) => {
        setTransactions(prev => applyRealtimeChange(prev, payload as TxEventPayload))
      }).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [user, enableRealtime])

  const createTransaction = async (input: Pick<Transaction, 'type' | 'amount' | 'category' | 'description' | 'date'>) => {
    if (!user) return { data: null, error: 'No user' }
    const now = new Date().toISOString()
    const payload = { ...input, user_id: user.id, created_at: now, updated_at: now }
    const { data, error } = await supabase.from('transactions').insert(payload).select().single()
    if (error) {
      console.error('Create transaction error', error)
      return { data: null, error }
    }
    if (data) {
      const normalized: Transaction = { ...data, type: data.type as Transaction['type'] }
      setTransactions(prev => [normalized, ...prev])
    }
    return { data, error: null }
  }

  const setInitial = (initial: Transaction[]) => {
    if (!initial || initial.length === 0) return
    // Treat as fresh data; no categories enrichment (will enrich on next fetch) or fetch categories for color
    setTransactions(initial.map(t => ({ ...t })))
    lastFetchedAtRef.current = Date.now()
  }

  return {
    transactions,
    loading,
    error,
    refetch: fetchAll,
    createTransaction,
    setInitial
  }
}
