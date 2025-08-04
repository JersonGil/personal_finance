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
