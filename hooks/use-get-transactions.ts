"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { Transaction } from "@/types/finance"

export function useTransactions(options?: { staleTime?: number; refetchOnWindowFocus?: boolean }) {
  const staleTime = options?.staleTime ?? 5 * 60 * 1000 // 5 min por defecto
  const refetchOnWindowFocus = options?.refetchOnWindowFocus ?? false

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Guards y caché
  const inFlightRef = useRef<Promise<void> | null>(null)
  const lastFetchedAtRef = useRef<number>(0)
  const lastUserIdRef = useRef<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!user) return

    if (inFlightRef.current) return inFlightRef.current
    inFlightRef.current = (async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })

        if (error) throw error

        setTransactions(
          (data || []).map((item) => ({
            ...item,
            type: item.type as Transaction["type"],
          })),
        )
        lastFetchedAtRef.current = Date.now()
        lastUserIdRef.current = user.id
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoading(false)
        inFlightRef.current = null
      }
    })()
    return inFlightRef.current
  }, [user])

  // Fetch controlado por usuario + staleness
  useEffect(() => {
    if (!user) return
    const userChanged = lastUserIdRef.current !== user.id
    const isStale = Date.now() - lastFetchedAtRef.current > staleTime
    if (userChanged || isStale || transactions.length === 0) {
      void fetchTransactions()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Opcional: refetch al enfocar ventana (desactivado por defecto)
  useEffect(() => {
    if (!refetchOnWindowFocus) return
    const onFocus = () => {
      const isStale = Date.now() - lastFetchedAtRef.current > staleTime
      if (isStale) void fetchTransactions()
    }
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onFocus)
    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onFocus)
    }
  }, [refetchOnWindowFocus, staleTime, fetchTransactions])

  const createTransaction = async (transaction: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return { error: "No user authenticated" }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setTransactions((prev) => [
        ...prev,
        {
          ...data,
          type: data.type as Transaction["type"],
        },
      ])
      // Actualiza caché de última consulta
      lastFetchedAtRef.current = Date.now()
      return { data, error: null }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { data: null, error: error.message }
      }
      return { data: null, error: "An unknown error occurred" }
    }
  }

  return {
    transactions,
    loading,
    createTransaction,
    refetch: fetchTransactions,
  }
}
