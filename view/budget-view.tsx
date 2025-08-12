"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import BudgetModal from "@/components/budget-modal"
import type { Database } from "@/types/supabase"
import { useTransactions } from "@/hooks/use-get-transactions"
import NoTransactions from "@/components/no-transactions"
import { useBudgets } from '@/hooks/use-budgets'

type BudgetRow = Database["public"]["Tables"]["budgets"]["Row"]

export default function BudgetView({ initialBudgets }: Readonly<{ initialBudgets?: BudgetRow[] }>) {
  const { transactions } = useTransactions()
  const { budgets } = useBudgets({ initialData: initialBudgets })
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetRow | null>(null)

  const budgetComparison = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return budgets.map((budget) => {
      const spent = transactions
        .filter((t) => t.type === "expense" && t.category === budget.category && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0)
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: Math.min(percentage, 100),
        month: currentMonth,
      }
    })
  }, [budgets, transactions])

  const handleEditBudget = (budget: BudgetRow) => {
    setEditingBudget(budget)
    setIsBudgetModalOpen(true)
  }

  const badgeVariant = (p: number) => {
    if (p > 90) return "destructive"
    if (p > 70) return "secondary"
    return "default"
  }

  const barColor = (p: number) => {
    if (p > 90) return "bg-red-500"
    if (p > 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Presupuestos Mensuales</CardTitle>
          <CardDescription>Controla tus gastos por categoría</CardDescription>
        </div>
        <Button onClick={() => setIsBudgetModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Presupuesto
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgetComparison.length > 0 ? budgetComparison.map((budget) => (
            <div key={budget.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{budget.category}</h3>
                  <p className="text-sm text-gray-500">
                    ${budget.spent.toLocaleString()} de ${budget.amount.toLocaleString()} gastado
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={badgeVariant(budget.percentage)}>
                    {budget.percentage.toFixed(0)}%
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleEditBudget(budget)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${barColor(budget.percentage)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Restante: ${budget.remaining.toLocaleString()}</span>
                <span>{budget.month}</span>
              </div>
            </div>
          )) : (
            <NoTransactions messages="No hay presupuestos registrados aún." />
          )}
        </div>
      </CardContent>
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false)
          setEditingBudget(null)
        }}
        budget={editingBudget}
      />
    </Card>
  )
}
