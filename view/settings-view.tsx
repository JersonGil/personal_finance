"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCategories } from "@/hooks/use-categories"
import type { Category } from "@/types/finance"

type BalanceCategory = {
  id: string
  name: string
}

const DEFAULT_BALANCE_CATEGORIES: BalanceCategory[] = [
  { id: "provincial", name: "Provincial" },
  { id: "bancamiga", name: "Bancamiga" },
  { id: "mercantil", name: "Mercantil" },
  { id: "binance", name: "Binance" },
  { id: "zinli", name: "Zinli" },
  { id: "wally", name: "Wally" },
  { id: "meru", name: "Meru" },
  { id: "kontigo", name: "Kontigo" },
]

export default function SettingsView() {
  // Balance categories state
  const [balanceCategories, setBalanceCategories] = useState<BalanceCategory[]>(DEFAULT_BALANCE_CATEGORIES)
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)
  const [editingBalanceCategory, setEditingBalanceCategory] = useState<BalanceCategory | null>(null)
  const [balanceCategoryName, setBalanceCategoryName] = useState("")

  // Transaction categories state (from hook)
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories()
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")

  // Balance category modal handlers
  const openNewBalanceCategoryModal = () => {
    setEditingBalanceCategory(null)
    setBalanceCategoryName("")
    setIsBalanceModalOpen(true)
  }
  const openEditBalanceCategoryModal = (cat: BalanceCategory) => {
    setEditingBalanceCategory(cat)
    setBalanceCategoryName(cat.name)
    setIsBalanceModalOpen(true)
  }
  const handleSaveBalanceCategory = () => {
    if (balanceCategoryName.trim() === "") return
    if (editingBalanceCategory) {
      setBalanceCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingBalanceCategory.id ? { ...cat, name: balanceCategoryName } : cat
        )
      )
    } else {
      setBalanceCategories((prev) => [
        ...prev,
        { id: Date.now().toString(), name: balanceCategoryName },
      ])
    }
    setIsBalanceModalOpen(false)
    setEditingBalanceCategory(null)
    setBalanceCategoryName("")
  }
  const handleDeleteBalanceCategory = (id: string) => {
    setBalanceCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  // Transaction category modal handlers
  const openNewCategoryModal = () => {
    setEditingCategory(null)
    setCategoryName("")
    setIsCategoryModalOpen(true)
  }
  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat)
    setCategoryName(cat.name)
    setIsCategoryModalOpen(true)
  }
  const handleSaveCategory = async (data: Omit<Category, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data)
      setEditingCategory(null)
    } else {
      await createCategory(data)
    }
    setIsCategoryModalOpen(false)
  }

  return (
    <div className="space-y-8">
      {/* Balance categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categorías de Balance</CardTitle>
            <CardDescription>Gestiona las categorías para tus balances.</CardDescription>
          </div>
          <Button onClick={openNewBalanceCategoryModal}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {balanceCategories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">{cat.name}</span>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditBalanceCategoryModal(cat)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteBalanceCategory(cat.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Modal para balance category */}
      <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBalanceCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="balanceCategoryName">Nombre de la categoría</Label>
            <Input
              id="balanceCategoryName"
              value={balanceCategoryName}
              onChange={(e) => setBalanceCategoryName(e.target.value)}
              placeholder="Ej: Provincial, Binance, etc."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBalanceModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveBalanceCategory}>
                {editingBalanceCategory ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Transaction categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categorías de Transacciones</CardTitle>
            <CardDescription>Gestiona las categorías de ingresos y gastos.</CardDescription>
          </div>
          <Button onClick={openNewCategoryModal}>
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
                  <Button variant="ghost" size="icon" onClick={() => openEditCategoryModal(category)}>
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
      {/* Modal para transacción category */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              await handleSaveCategory({
                name: categoryName, type: editingCategory?.type ?? "expense", color: editingCategory?.color ?? "#8884d8",
                icon: ""
              })
            }}
          >
            <Label htmlFor="categoryName">Nombre de la categoría</Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ej: Alimentos, Entretenimiento, etc."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setIsCategoryModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCategory ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
