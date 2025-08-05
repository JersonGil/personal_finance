export type TransactionType = "income" | "expense"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  month: string // Format: YYYY-MM
}

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
