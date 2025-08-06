"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import AuthLayout from "@/components/auth/auth-layout"
import Header from "@/components/layout/header"
import { useAuth } from "@/hooks/use-auth"
import type { Category } from "@/types/finance"
import CategoryModal from "@/components/category-modal"
import { useCategories } from "@/hooks/use-categories"
import RecentTransactions from "@/view/recent-transactions"
import { useTransactions } from "@/hooks/use-get-transactions"
import BudgetView from "@/view/budget-view"
import BalanceView from "@/view/balance-view"
import SettingsView from "@/view/settings-view"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export default function PersonalFinanceApp() {
  const { user, loading } = useAuth()
  const { createCategory, updateCategory } = useCategories()
  const { transactions, refetch } = useTransactions()

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  )

  const totalExpenses = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  )

  const balance = totalIncome - totalExpenses

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split("T")[0]
    })

    return last7Days.map((date) => {
      const dayTransactions = transactions.filter((t) => t.date === date)
      const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const expenses = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      return {
        date: new Date(date).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
        ingresos: income,
        gastos: expenses,
        balance: income - expenses,
      }
    })
  }, [transactions])

  const expensesByCategory = useMemo(() => {
    const categoryTotals = transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
  }, [transactions])


  const handleSaveCategory = async (categoryData: Omit<Category, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (editingCategory) {
      const result = await updateCategory(editingCategory.id, categoryData)
      if (!result.error) {
        setEditingCategory(null)
        setIsCategoryModalOpen(false)
      }
      return result
    } else {
      const result = await createCategory(categoryData)
      if (!result.error) {
        setIsCategoryModalOpen(false)
      }
      return result
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show auth layout if user is not authenticated
  if (!user) {
    return <AuthLayout />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="budget">Presupuestos</TabsTrigger>
              <TabsTrigger value="balance">Balance</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Resumen financiero */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Balance</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${balance.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Movimiento de Dinero (Últimos 7 días)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, ""]} />
                        <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gastos por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, "Monto"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de transacciones */}
              <RecentTransactions refetch={refetch} />
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <BudgetView />
            </TabsContent>

            <TabsContent value="balance" className="space-y-6">
              <BalanceView dashboardBalance={balance} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <SettingsView />
            </TabsContent>
          </Tabs>

          {/* Modales */}
          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => {
              setIsCategoryModalOpen(false)
              setEditingCategory(null)
            }}
            onSave={handleSaveCategory}
            category={editingCategory}
          />
        </div>
      </div>
    </div>
  )
}