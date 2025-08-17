"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

export function useCategories(options?: { staleTime?: number; refetchOnWindowFocus?: boolean }) {
  const staleTime = options?.staleTime ?? 5 * 60 * 1000 // 5 min por defecto
  const refetchOnWindowFocus = options?.refetchOnWindowFocus ?? false

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Guards y caché
  const inFlightRef = useRef<Promise<void> | null>(null)
  const lastFetchedAtRef = useRef<number>(0)
  const lastUserIdRef = useRef<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!user) return

    if (inFlightRef.current) return inFlightRef.current
    inFlightRef.current = (async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("name")

        if (error) throw error
        setCategories(
          (data || []).map((cat) => ({
            ...cat,
            type: cat.type as "income" | "expense" | "both",
            color: cat.color ?? "",
            icon: cat.icon ?? "",
          })),
        )
        lastFetchedAtRef.current = Date.now()
        lastUserIdRef.current = user.id
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        console.error("Error fetching categories:", message)
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
    if (userChanged || isStale || categories.length === 0) {
      void fetchCategories()
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
      if (isStale) void fetchCategories()
    }
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onFocus)
    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onFocus)
    }
  }, [refetchOnWindowFocus, staleTime, fetchCategories])

  const createCategory = async (category: Omit<Category, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return { error: "No user authenticated" }

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ ...category, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      const normalizedData: Category = {
        ...data,
        type: data.type as "income" | "expense" | "both",
        color: data.color ?? "",
        icon: data.icon ?? "",
      }
      setCategories((prev) => [...prev, normalizedData])
      return { data: normalizedData, error: null }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      return { data: null, error: message }
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

      const normalizedData: Category = {
        ...data,
        type: data.type as "income" | "expense" | "both",
        color: data.color ?? "",
        icon: data.icon ?? "",
      }
      setCategories((prev) => prev.map((cat) => (cat.id === id ? normalizedData : cat)))
      return { data, error: null }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      return { data: null, error: message }
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user) return { error: "No user authenticated" }

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error

      setCategories((prev) => prev.filter((cat) => cat.id !== id))
      return { error: null }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      return { error: message }
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
    refetch: fetchCategories, // manual y sin depender del foco
  }
}
