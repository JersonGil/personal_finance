"use client"

import type React from "react"
import { useCategories } from "@/hooks/use-categories"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Transaction, TransactionType } from "@/types/finance"
import { currencies } from "@/lib/utils"
import CurrencyConverter from '@/components/currency-converter'
import { useDollarPrice } from '@/providers/dollar-price-provider'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Omit<Transaction, "id">) => void
  transaction?: Transaction | null
}

export default function TransactionModal({ isOpen, onClose, onSave, transaction }: Readonly<TransactionModalProps>) {
  const { getIncomeCategories, getExpenseCategories, loading: categoriesLoading } = useCategories()
  const { price } = useDollarPrice()
  const [form, setForm] = useState<{
    type: TransactionType
    amount: string
    category: string
    description: string
    date: string
  }>({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: "",
  })

  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
      })
    } else {
      setForm({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      })
    }
  }, [transaction, isOpen])

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const { type, amount, category, description, date } = form
    if (!amount || !category || !description || !date) {
      return
    }

    onSave({
      type,
      amount: Number.parseFloat(amount),
      category,
      description,
      date,
    })

    setForm({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar Transacción" : "Nueva Transacción"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="mb-4">Tipo de Transacción</Label>
            <RadioGroup className="flex flex-row gap-4" value={form.type} onValueChange={(value: string) => handleChange("type", value as TransactionType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income">Ingreso</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense">Gasto</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={form.category}
              onValueChange={(value: string) => handleChange("category", value)}
              required
              disabled={categoriesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {form.type === "income"
                  ? getIncomeCategories().map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))
                  : getExpenseCategories().map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe la transacción..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <CurrencyConverter
              className="mt-0"
              primaryCurrency={currencies.BS}
              secondaryCurrency={currencies.USD}
              price={price ?? 0}
              onChangeAmount={(primary, secondary) => { handleChange("amount", secondary) }}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{transaction ? "Actualizar" : "Guardar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
