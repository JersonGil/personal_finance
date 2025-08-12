import FinancialSummaryCards from "@/components/financial-summary-cards"
import MoneyMovementChart from "@/components/money-movement-chart"
import ExpensesByCategoryChart from "@/components/expenses-by-category-chart"
import RecentTransactions from "@/view/recent-transactions/recent-transactions"
import { Fragment, Suspense } from "react"
import { createClient } from "@/lib/server"

export default async function DashboardView() {
  const totalIncome = 500

  const totalExpenses = 400

  const balance = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      {/* Resumen financiero */}
      <FinancialSummaryCards 
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
      />

      {/* Lista de transacciones */}
      <Suspense
        fallback={
          <div className="rounded-md border p-6">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mb-4" />
            <div className="space-y-2">
              <div className="h-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
              <div className="h-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
              <div className="h-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
            </div>
          </div>
        }
      >
        <RecentTransactionsSection />
      </Suspense>
    </div>
  )
}

// Sección que carga en el servidor y se “streamea” con Suspense
async function RecentTransactionsSection() {
  const sb = await createClient()

  const { data: { user }, error: userError } = await sb.auth.getUser()

  if (userError || !user) {
    return <RecentTransactions transactions={[]} />
  }

  const { data: transactions, error } = await sb
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
  }

  return (
    <Fragment>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoneyMovementChart transactions={transactions ?? []} />
        <ExpensesByCategoryChart transactions={transactions ?? []} />
      </div>
      <RecentTransactions transactions={transactions ?? []} />
    </Fragment>
  )
}