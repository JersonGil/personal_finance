import { supabase } from "@/lib/supabase"

export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error("Error fetching user (client):", error)
      return null
    }
    return data
  } catch (e) {
    console.error("Unexpected error fetching user:", e)
    return null
  }
}