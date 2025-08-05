"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, Loader2 } from "lucide-react"
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
import TransactionModal from "@/components/transaction-modal"
import BudgetModal from "@/components/budget-modal"
import AuthLayout from "@/components/auth/auth-layout"
import Header from "@/components/layout/header"
import { useAuth } from "@/hooks/use-auth"
import type { Transaction, Budget, Category } from "@/types/finance"
import CategoryModal from "@/components/category-modal"
import { useCategories } from "@/hooks/use-categories"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export default function PersonalFinanceApp() {
  const { user, loading } = useAuth()
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories()

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "income",
      amount: 3000,
      category: "Salario",
      description: "Salario mensual",
      date: "2024-01-15",
    },
    {
      id: "2",
      type: "expense",
      amount: 800,
      category: "Alimentación",
      description: "Supermercado",
      date: "2024-01-16",
    },
    {
      id: "3",
      type: "expense",
      amount: 200,
      category: "Transporte",
      description: "Gasolina",
      date: "2024-01-17",
    },
  ])

  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: "1",
      category: "Alimentación",
      amount: 1000,
      month: "2024-01",
    },
    {
      id: "2",
      category: "Transporte",
      amount: 500,
      month: "2024-01",
    },
  ])

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
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
      }
    })
  }, [budgets, transactions])

  const handleSaveTransaction = (transaction: Omit<Transaction, "id">) => {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTransaction.id ? { ...transaction, id: editingTransaction.id } : t)),
      )
      setEditingTransaction(null)
    } else {
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
      }
      setTransactions((prev) => [...prev, newTransaction])
    }
    setIsTransactionModalOpen(false)
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsTransactionModalOpen(true)
  }

  const handleSaveBudget = (budget: Omit<Budget, "id">) => {
    if (editingBudget) {
      setBudgets((prev) => prev.map((b) => (b.id === editingBudget.id ? { ...budget, id: editingBudget.id } : b)))
      setEditingBudget(null)
    } else {
      const newBudget: Budget = {
        ...budget,
        id: Date.now().toString(),
      }
      setBudgets((prev) => [...prev, newBudget])
    }
    setIsBudgetModalOpen(false)
  }

  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setIsBudgetModalOpen(true)
  }

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

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsCategoryModalOpen(true)
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="budget">Presupuestos</TabsTrigger>
              <TabsTrigger value="categories">Categorías</TabsTrigger>
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
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Transacciones Recientes</CardTitle>
                    <CardDescription>Tus últimos movimientos financieros</CardDescription>
                  </div>
                  <Button onClick={() => setIsTransactionModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Transacción
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions
                      .slice(-10)
                      .reverse()
                      .map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                transaction.type === "income" ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-500">
                                {transaction.category} • {transaction.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                            >
                              {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => handleEditTransaction(transaction)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
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
                    {budgetComparison.map((budget) => (
                      <div key={budget.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{budget.category}</h3>
                            <p className="text-sm text-gray-500">
                              ${budget.spent.toLocaleString()} de ${budget.amount.toLocaleString()} gastado
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                budget.percentage > 90
                                  ? "destructive"
                                  : budget.percentage > 70
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {budget.percentage.toFixed(0)}%
                            </Badge>
                            <Button variant="ghost" size="icon" onClick={() => handleEditBudget(budget)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              budget.percentage > 90
                                ? "bg-red-500"
                                : budget.percentage > 70
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Restante: ${budget.remaining.toLocaleString()}</span>
                          <span>{budget.month}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gestionar Categorías</CardTitle>
                    <CardDescription>Personaliza tus categorías de ingresos y gastos</CardDescription>
                  </div>
                  <Button onClick={() => setIsCategoryModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Categoría
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{category.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Modales */}
          <TransactionModal
            isOpen={isTransactionModalOpen}
            onClose={() => {
              setIsTransactionModalOpen(false)
              setEditingTransaction(null)
            }}
            onSave={handleSaveTransaction}
            categories={categories.map((c) => c.name)}
            transaction={editingTransaction}
          />

          <BudgetModal
            isOpen={isBudgetModalOpen}
            onClose={() => {
              setIsBudgetModalOpen(false)
              setEditingBudget(null)
            }}
            onSave={handleSaveBudget}
            categories={categories.map((c) => c.name)}
            budget={editingBudget}
          />

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
