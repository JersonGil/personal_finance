"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { Category } from "@/hooks/use-categories"

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    category: Omit<Category, "id" | "user_id" | "created_at" | "updated_at">,
  ) => Promise<{ error: string | null }>
  category?: Category | null
}

const COLORS = [
  { name: "Rojo", value: "#EF4444" },
  { name: "Naranja", value: "#F97316" },
  { name: "Amarillo", value: "#F59E0B" },
  { name: "Verde", value: "#10B981" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Púrpura", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Gris", value: "#6B7280" },
]

const ICONS = [
  "DollarSign",
  "TrendingUp",
  "TrendingDown",
  "Home",
  "Car",
  "UtensilsCrossed",
  "Gamepad2",
  "Heart",
  "GraduationCap",
  "Briefcase",
  "Laptop",
  "ShoppingBag",
  "Zap",
  "Gift",
  "Plus",
  "MoreHorizontal",
]

export default function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"income" | "expense" | "both">("expense")
  const [color, setColor] = useState("#6B7280")
  const [icon, setIcon] = useState("DollarSign")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (category) {
      setName(category.name)
      setType(category.type)
      setColor(category.color)
      setIcon(category.icon)
    } else {
      setName("")
      setType("expense")
      setColor("#6B7280")
      setIcon("DollarSign")
    }
    setError("")
  }, [category, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!name.trim()) {
      setError("El nombre de la categoría es requerido")
      setLoading(false)
      return
    }

    const result = await onSave({
      name: name.trim(),
      type,
      color,
      icon,
    })

    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }

    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Categoría</Label>
            <Input
              id="name"
              placeholder="Ej: Alimentación, Salario..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Categoría</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as typeof type)} disabled={loading}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense">Gastos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income">Ingresos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Ambos</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  className={`w-full h-10 rounded-md border-2 ${
                    color === colorOption.value ? "border-gray-900" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  onClick={() => setColor(colorOption.value)}
                  disabled={loading}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icono</Label>
            <Select value={icon} onValueChange={setIcon} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un icono" />
              </SelectTrigger>
              <SelectContent>
                {ICONS.map((iconName) => (
                  <SelectItem key={iconName} value={iconName}>
                    {iconName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
