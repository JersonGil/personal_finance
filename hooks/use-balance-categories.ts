import { useEffect, useState } from "react"
import { supabase } from '@/lib/supabase'

export type BalanceCategory = {
  id: string
  name: string
}

export function useBalanceCategories() {
  const [categories, setCategories] = useState<BalanceCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchCategories = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("balance_categories")
        .select("id, name")
        .order("name", { ascending: true })
      if (!error && isMounted) {
        setCategories(data || [])
      }
      setLoading(false)
    }
    fetchCategories()
    return () => {
      isMounted = false
    }
  }, [])

  return {
    categories,
    setCategories,
    loading,
  }
}
