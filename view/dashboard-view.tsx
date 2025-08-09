import { useMemo } from "react"
import { useTransactions } from "@/hooks/use-get-transactions"
import FinancialSummaryCards from "@/components/financial-summary-cards"
import MoneyMovementChart from "@/components/money-movement-chart"
import ExpensesByCategoryChart from "@/components/expenses-by-category-chart"
import RecentTransactions from "@/view/recent-transactions/recent-transactions"

interface DashboardViewProps {
  readonly refetch: () => Promise<void>
}

export default function DashboardView({ refetch }: DashboardViewProps) {
  const { transactions } = useTransactions()

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  )

  const totalExpenses = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  )

  const balance = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      {/* Resumen financiero */}
      <FinancialSummaryCards 
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
      />

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoneyMovementChart transactions={transactions} />
        <ExpensesByCategoryChart transactions={transactions} />
      </div>

      {/* Lista de transacciones */}
      <RecentTransactions refetch={refetch} />
    </div>
  )
}