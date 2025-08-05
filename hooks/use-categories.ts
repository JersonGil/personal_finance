"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

export interface Category {
  id: string
  user_id: string
  name: string
  type: "income" | "expense" | "both"
  color: string
  icon: string
  created_at: string
  updated_at: string
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchCategories = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("categories").select("*").eq("user_id", user.id).order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [user])

  const createCategory = async (category: Omit<Category, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return { error: "No user authenticated" }

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ ...category, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setCategories((prev) => [...prev, data])
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) return { error: "No user authenticated" }

    try {
      const { data, error } = await supabase
        .from("categories")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error

      setCategories((prev) => prev.map((cat) => (cat.id === id ? data : cat)))
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user) return { error: "No user authenticated" }

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error

      setCategories((prev) => prev.filter((cat) => cat.id !== id))
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const getIncomeCategories = () => categories.filter((cat) => cat.type === "income" || cat.type === "both")
  const getExpenseCategories = () => categories.filter((cat) => cat.type === "expense" || cat.type === "both")

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    getIncomeCategories,
    getExpenseCategories,
    refetch: fetchCategories,
  }
}
