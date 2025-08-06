"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useBalanceCategories } from "@/hooks/use-balance-categories"
import { useBalances } from "@/hooks/use-balances"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import CurrencyConverter from '@/components/currency-converter'
import { currencies, formatBs } from "@/lib/utils"
import capitalize from 'lodash/capitalize'

const getDollarPrice = async () => {
  const res = await fetch('/api/get-dollar-price');
  if (!res.ok) throw new Error('Error al obtener el precio del dólar');
  const data = await res.json();
  return data.price;
}

export default function BalanceView({
  dashboardBalance,
}: Readonly<{
  dashboardBalance?: number
}>) {
  const { categories, loading: loadingCategories } = useBalanceCategories()
  const { balances, setBalances, loading: loadingBalances, createBalance, refetch, updateBalance } = useBalances()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBalance, setEditingBalance] = useState<{ categoryId: string; amount: number, balanceId: string } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null)
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState<number>(0);
  const { user } = useAuth()

  useEffect(() => {
    getDollarPrice().then(setPrice).catch(() => setPrice(0));
  }, []);

  // Abrir modal para agregar/editar balance
  const openBalanceModal = (category: { id: string; name: string }, entry?: { amount: number, id: string }) => {
    setSelectedCategory(category)
    setEditingBalance(entry ? { categoryId: category.id, amount: entry.amount, balanceId: entry.id } : null)
    setAmount(entry ? entry.amount.toString() : "")
    setIsModalOpen(true)
  }

  const editBalance = (balanceId: string, amount: number) => {
    if (!user) {
      toast.error("Debes iniciar sesión para editar balances")
      return
    }

    updateBalance(balanceId, { amount }).then(({ error }) => {
      if (error) {
        toast.error("Error al actualizar balance")
        console.error("Error updating balance:", error)
      } else {
        toast.success("Balance actualizado exitosamente")
        setIsModalOpen(false)
        setEditingBalance(null)
        setSelectedCategory(null)
        setAmount("")
        refetch()
      }
    })
  }

  // Guardar balance (solo local, deberías implementar persistencia en supabase)
  const handleSaveBalance = () => {
    if (!selectedCategory) return
    const value = Number(amount)
    createBalance({
      category_id: selectedCategory.id,
      amount: isNaN(value) ? 0 : value,
      user_id: user?.id ?? ''
    }).then(({ error }) => {
      if (error) {
        toast.error("Error al agregar balance")
        console.error("Error inserting balance:", error)
      } else {
        toast.success("Balance agregado exitosamente")
        setIsModalOpen(false)
        setEditingBalance(null)
        setSelectedCategory(null)
        setAmount("")
        refetch()
      }
    })
    setIsModalOpen(false)
    setEditingBalance(null)
    setSelectedCategory(null)
    setAmount("")
  }

  // Eliminar balance (solo local, deberías implementar persistencia en supabase)
  const handleDeleteBalance = (categoryId: string) => {
    setBalances((prev) => prev.filter((b) => b.category_id !== categoryId))
  }

  const totalBalance = balances.reduce((sum, b) => sum + (isNaN(b.amount) ? 0 : b.amount), 0)
  const totalBalanceBs = price ? totalBalance * price : 0

  if (loadingCategories || loadingBalances) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="shadow-md border">
      <CardHeader>
        <CardTitle>Balance Actual por Categoría</CardTitle>
        <CardDescription>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            Registra y visualiza los montos que posees en cada cuenta/categoría.
            <p>
              1 Bs = ${Number(price).toFixed(2)}
            </p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((cat) => {
            const entry = balances.find((b) => b.category_id === cat.id)
            const amountUsd = entry ? entry.amount : 0
            const amountBs = price ? amountUsd * price : 0
            return (
              <div
                key={cat.id}
                className="flex items-center border rounded-lg p-4 gap-4"
              >
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-2xl">{capitalize(cat.name)}</span>
                  <div className="flex flex-row items-center gap-2 mt-2">
                    <span className="text-2xl font-bold">${amountUsd.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 mb-1">Bs {formatBs(amountBs)}</span>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-2 self-center">
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
              </div>
            )
          })}
        </div>
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="font-semibold">Balance total actual:</span>{" "}
            <span className="text-lg font-bold">${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span className="ml-2 text-gray-500">/ Bs {totalBalanceBs.toLocaleString("es-VE", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          {dashboardBalance !== undefined && (
            <div>
              <span className="font-semibold">Balance dashboard:</span>{" "}
              <span className="text-lg font-bold">${dashboardBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              <span
                className={`ml-4 font-semibold ${
                  totalBalance === dashboardBalance
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {totalBalance === dashboardBalance
                  ? "¡Balances coinciden!"
                  : `Diferencia: $${Number(totalBalance - dashboardBalance).toFixed(2)}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBalance ? "Editar Balance" : "Registrar Balance"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <CurrencyConverter
              primaryCurrency={currencies.BS}
              secondaryCurrency={currencies.USD}
              title={selectedCategory ? selectedCategory.name : "Categoría"}
              price={price}
              onChangeAmount={(primary, secondary) => { setAmount(secondary) }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              {editingBalance ? (
                <Button onClick={() => editBalance(editingBalance.balanceId, Number(amount))}>
                  Actualizar
                </Button>
              ) : (
                <Button onClick={handleSaveBalance}>
                  Registrar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}