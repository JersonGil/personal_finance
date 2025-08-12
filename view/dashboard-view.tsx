import FinancialSummaryCards from "@/components/financial-summary-cards"
import MoneyMovementChart from "@/components/money-movement-chart"
import ExpensesByCategoryChart from "@/components/expenses-by-category-chart"
import RecentTransactions from "@/view/recent-transactions/recent-transactions"
import HydrateTransactions from "@/view/recent-transactions/transactions-hydrator"
import TransactionsRealtime from "@/view/recent-transactions/transactions-realtime"
import type { Transaction } from "@/types/finance"
import { createClient } from "@/lib/server"

export default async function DashboardView() {
  const sb = await createClient()
  let transactions: Transaction[] = []
  let userId: string | null = null
  try {
    const { data: { user } } = await sb.auth.getUser()
    if (user) {
      userId = user.id
      const { data, error } = await sb
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
      if (!error && data) transactions = data
    }
  } catch {
    // ignore
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (isNaN(t.amount) ? 0 : t.amount), 0)
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (isNaN(t.amount) ? 0 : t.amount), 0)
  const balance = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <FinancialSummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
      />
  <HydrateTransactions initialTransactions={transactions} />
  <TransactionsRealtime userId={userId} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoneyMovementChart />
        <ExpensesByCategoryChart />
      </div>
      <RecentTransactions />
    </div>
  )
}