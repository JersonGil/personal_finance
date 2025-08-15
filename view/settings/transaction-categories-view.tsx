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

export default function TransactionCategoriesView() {
  // Transaction categories state (from hook)
  const { categories, createCategory, updateCategory, deleteCategory: deleteTransactionCategory } = useCategories()
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")

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
    <>
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
                    <p className="text-sm text-muted-foreground capitalize">{category.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditCategoryModal(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteTransactionCategory(category.id)}>
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
                name: categoryName, 
                type: editingCategory?.type ?? "expense", 
                color: editingCategory?.color ?? "#8884d8",
                icon: ""
              })
            }}
          >
            <div>
              <Label htmlFor="categoryName">Nombre de la categoría</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ej: Alimentos, Entretenimiento, etc."
                autoFocus
              />
            </div>
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
    </>
  )
}