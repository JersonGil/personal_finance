import type { Transaction } from "@/types/finance"
import { supabase } from "@/lib/supabase"
import { getUser } from "./auth"

export const createTransaction = async (transaction: Omit<Transaction, "id">) => {
  const user = await getUser()
  if (!user) {
    const error = new Error("No authenticated user")
    console.error(error)
    return { data: null, error }
  }

  const payload = { ...transaction, user_id: user.user.id }

  const { data, error } = await supabase
    .from("transactions")
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error("Error creating transaction:", error)
    return { data: null, error }
  }
  return { data, error: null }
}