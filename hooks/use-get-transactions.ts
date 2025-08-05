"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { Transaction } from "@/types/finance"

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchTransactions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const createTransaction = async (transaction: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return { error: "No user authenticated" }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setTransactions((prev) => [...prev, data])
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
