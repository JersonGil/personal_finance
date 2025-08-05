"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type BalanceCategory = {
  id: string
  name: string
}

type BalanceEntry = {
  categoryId: string
  amount: number
}

const DEFAULT_CATEGORIES: BalanceCategory[] = [
  { id: "provincial", name: "Provincial" },
  { id: "bancamiga", name: "Bancamiga" },
  { id: "mercantil", name: "Mercantil" },
  { id: "binance", name: "Binance" },
  { id: "zinli", name: "Zinli" },
  { id: "wally", name: "Wally" },
  { id: "meru", name: "Meru" },
  { id: "kontigo", name: "Kontigo" },
]

export default function BalanceView({
  dashboardBalance,
}: {
  dashboardBalance?: number
}) {
  const [categories, setCategories] = useState<BalanceCategory[]>(DEFAULT_CATEGORIES)
  const [balances, setBalances] = useState<BalanceEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBalance, setEditingBalance] = useState<BalanceEntry | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<BalanceCategory | null>(null)
  const [amount, setAmount] = useState("")

  // Abrir modal para agregar/editar balance
  const openBalanceModal = (category: BalanceCategory, entry?: BalanceEntry) => {
    setSelectedCategory(category)
    setEditingBalance(entry || null)
    setAmount(entry ? entry.amount.toString() : "")
    setIsModalOpen(true)
  }

  // Guardar balance
  const handleSaveBalance = () => {
    if (!selectedCategory) return
    const value = Number(amount)
    setBalances((prev) => {
      const exists = prev.find((b) => b.categoryId === selectedCategory.id)
      if (exists) {
        return prev.map((b) =>
          b.categoryId === selectedCategory.id ? { ...b, amount: isNaN(value) ? 0 : value } : b
        )
      } else {
        return [...prev, { categoryId: selectedCategory.id, amount: isNaN(value) ? 0 : value }]
      }
    })
    setIsModalOpen(false)
    setEditingBalance(null)
    setSelectedCategory(null)
    setAmount("")
  }

  // Eliminar balance
  const handleDeleteBalance = (categoryId: string) => {
    setBalances((prev) => prev.filter((b) => b.categoryId !== categoryId))
  }

  const totalBalance = balances.reduce((sum, b) => sum + (isNaN(b.amount) ? 0 : b.amount), 0)

  return (
    <Card className="shadow-md border">
      <CardHeader>
        <CardTitle>Balance Actual por Categoría</CardTitle>
        <CardDescription>
          Registra y visualiza los montos que posees en cada cuenta/categoría.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((cat) => {
            const entry = balances.find((b) => b.categoryId === cat.id)
            return (
              <div key={cat.id} className="flex items-center gap-4 border rounded-lg p-4">
                <div className="flex-1">
                  <span className="font-medium">{cat.name}</span>
                  <span className="ml-4 text-lg font-bold">
                    {entry ? `$${entry.amount.toLocaleString()}` : <span className="text-gray-400">Sin balance</span>}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openBalanceModal(cat, entry)}
                  aria-label={entry ? "Editar balance" : "Agregar balance"}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {entry && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBalance(cat.id)}
                    aria-label="Eliminar balance"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="font-semibold">Balance total actual:</span>{" "}
            <span className="text-lg font-bold">${totalBalance.toLocaleString()}</span>
          </div>
          {dashboardBalance !== undefined && (
            <div>
              <span className="font-semibold">Balance dashboard:</span>{" "}
              <span className="text-lg font-bold">${dashboardBalance.toLocaleString()}</span>
              <span
                className={`ml-4 font-semibold ${
                  totalBalance === dashboardBalance
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {totalBalance === dashboardBalance
                  ? "¡Balances coinciden!"
                  : `Diferencia: $${(totalBalance - dashboardBalance).toLocaleString()}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      {/* Modal para agregar/editar balance */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBalance ? "Editar Balance" : "Registrar Balance"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="balanceAmount">
              {selectedCategory ? selectedCategory.name : "Categoría"}
            </Label>
            <Input
              id="balanceAmount"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveBalance}>
                {editingBalance ? "Actualizar" : "Registrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}