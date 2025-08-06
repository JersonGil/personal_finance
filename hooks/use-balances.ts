import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase'
import { useAuth } from "@/hooks/use-auth"
import type { Database } from "@/types/supabase"

type Balance = Database["public"]["Tables"]["balances"]["Row"] & {
  category?: {
    id: string
    name: string
  }
}

export function useBalances() {
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchBalances = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("balances")
        .select("*, category:category_id(id, name)")
        .eq("user_id", user.id)

      if (error) throw error
      setBalances(data || [])
    } catch (error) {
      console.error("Error fetching balances:", error)
      setBalances([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalances()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const createBalance = async (balance: Omit<Balance, "id" | "created_at" | "updated_at" | "category">) => {
    if (!user) return { error: "No user authenticated" }

    try {
      const { data, error } = await supabase
        .from("balances")
        .insert([{ ...balance, user_id: user.id }])
        .select("*, category:category_id(id, name)")
        .single()

      if (error) throw error

      setBalances((prev) => [...prev, data])
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  const updateBalance = async (id: string, updates: Partial<Balance>) => {
    if (!user) return { error: "No user authenticated" }

    try {
      const { data, error } = await supabase
        .from("balances")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*, category:category_id(id, name)")
        .single()

      if (error) throw error

      setBalances((prev) => prev.map((bal) => (bal.id === id ? data : bal)))
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  const deleteBalance = async (id: string) => {
    if (!user) return { error: "No user authenticated" }

    try {
      const { error } = await supabase
        .from("balances")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      setBalances((prev) => prev.filter((bal) => bal.id !== id))
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  return {
    balances,
    loading,
    createBalance,
    updateBalance,
    deleteBalance,
    setBalances,
    refetch: fetchBalances,
  }
}

