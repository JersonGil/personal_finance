"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBalanceCategories } from "@/hooks/use-balance-categories"
import type { BalanceCategory } from "@/hooks/use-balance-categories"

export default function BalanceCategoriesView() {
  // Balance categories state (from hook)
  const { 
    categories: balanceCategories, 
    loading: balanceCategoriesLoading,
    addCategory: addBalanceCategory,
    editCategory: editBalanceCategory,
    deleteCategory: deleteBalanceCategory
  } = useBalanceCategories()
  
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)
  const [editingBalanceCategory, setEditingBalanceCategory] = useState<BalanceCategory | null>(null)
  const [balanceCategoryName, setBalanceCategoryName] = useState("")
  const [balanceCategoryError, setBalanceCategoryError] = useState<string | null>(null)

  // Balance category modal handlers
  const openNewBalanceCategoryModal = () => {
    setEditingBalanceCategory(null)
    setBalanceCategoryName("")
    setBalanceCategoryError(null)
    setIsBalanceModalOpen(true)
  }
  
  const openEditBalanceCategoryModal = (cat: BalanceCategory) => {
    setEditingBalanceCategory(cat)
    setBalanceCategoryName(cat.name)
    setBalanceCategoryError(null)
    setIsBalanceModalOpen(true)
  }
  
  const handleSaveBalanceCategory = async () => {
    if (balanceCategoryName.trim() === "") {
      setBalanceCategoryError("El nombre de la categoría es requerido")
      return
    }
    
    setBalanceCategoryError(null)
    
    let result
    if (editingBalanceCategory) {
      result = await editBalanceCategory(editingBalanceCategory.id, balanceCategoryName.trim())
    } else {
      result = await addBalanceCategory(balanceCategoryName.trim())
    }
    
    if (result.error) {
      setBalanceCategoryError(result.error)
    } else {
      setIsBalanceModalOpen(false)
      setEditingBalanceCategory(null)
      setBalanceCategoryName("")
    }
  }
  
  const handleDeleteBalanceCategory = async (id: string) => {
    const result = await deleteBalanceCategory(id)
    if (result.error) {
      // You could show a toast or alert here
      console.error("Error deleting balance category:", result.error)
    }
  }

  return (
    <>
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
            {balanceCategoriesLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Cargando categorías...</p>
              </div>
            ) : balanceCategories.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No hay categorías de balance. Crea una nueva.</p>
              </div>
            ) : (
              balanceCategories.map((cat) => (
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
              ))
            )}
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
            <div>
              <Label htmlFor="balanceCategoryName">Nombre de la categoría</Label>
              <Input
                id="balanceCategoryName"
                value={balanceCategoryName}
                onChange={(e) => setBalanceCategoryName(e.target.value)}
                placeholder="Ej: Provincial, Binance, etc."
                autoFocus
              />
              {balanceCategoryError && (
                <p className="text-sm text-red-600 mt-1">{balanceCategoryError}</p>
              )}
            </div>
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
    </>
  )
}