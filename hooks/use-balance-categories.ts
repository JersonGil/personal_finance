import { useEffect, useState } from "react"
import { supabase } from '@/lib/supabase'
import { useAuth } from "@/hooks/use-auth"

export type BalanceCategory = {
  id: string
  name: string
  user_id?: string
  created_at?: string
  updated_at?: string
}

export function useBalanceCategories() {
  const [categories, setCategories] = useState<BalanceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchCategories = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("balance_categories")
        .select("id, name, user_id, created_at, updated_at")
        .eq("user_id", user.id)
        .order("name", { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching balance categories:", error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const addCategory = async (name: string) => {
    if (!user) return { data: null, error: "No user authenticated" }
    
    if (!name || name.trim().length === 0) {
      return { data: null, error: "Category name is required" }
    }

    try {
      const { data, error } = await supabase
        .from("balance_categories")
        .insert([{ name: name.trim(), user_id: user.id }])
        .select("id, name, user_id, created_at, updated_at")
        .single()

      if (error) throw error

      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      return { data: null, error: errorMessage }
    }
  }

  const editCategory = async (id: string, name: string) => {
    if (!user) return { data: null, error: "No user authenticated" }
    
    if (!name || name.trim().length === 0) {
      return { data: null, error: "Category name is required" }
    }

    if (!id) {
      return { data: null, error: "Category ID is required" }
    }

    try {
      const { data, error } = await supabase
        .from("balance_categories")
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id, name, user_id, created_at, updated_at")
        .single()

      if (error) throw error

      setCategories((prev) => 
        prev.map((cat) => (cat.id === id ? data : cat))
           .sort((a, b) => a.name.localeCompare(b.name))
      )
      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      return { data: null, error: errorMessage }
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user) return { error: "No user authenticated" }
    
    if (!id) {
      return { error: "Category ID is required" }
    }

    try {
      const { error } = await supabase
        .from("balance_categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      setCategories((prev) => prev.filter((cat) => cat.id !== id))
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      return { error: errorMessage }
    }
  }

  const searchCategories = (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return categories
    }

    const term = searchTerm.trim().toLowerCase()
    return categories.filter((category) =>
      category.name.toLowerCase().includes(term)
    )
  }

  return {
    categories,
    loading,
    addCategory,
    editCategory,
    deleteCategory,
    searchCategories,
    refetch: fetchCategories,
    setCategories,
  }
}