"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import AuthLayout from "@/components/auth/auth-layout"
import Header from "@/components/layout/header"
import { useAuth } from "@/hooks/use-auth"
import type { Category } from "@/types/finance"
import CategoryModal from "@/components/category-modal"
import { useCategories } from "@/hooks/use-categories"
import { useTransactions } from "@/hooks/use-get-transactions"
import DashboardView from "@/view/dashboard-view"
import BudgetView from "@/view/budget-view"
import BalanceView from "@/view/balance-view"
import SettingsView from "@/view/settings-view"

export default function PersonalFinanceApp() {
  const { user, loading } = useAuth()
  const { createCategory, updateCategory } = useCategories()
  const { transactions, refetch } = useTransactions()

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Calculate balance for BalanceView
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

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
              <DashboardView refetch={refetch} />
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