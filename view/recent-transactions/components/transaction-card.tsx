'use client'

import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import React from "react"

type TransactionType = "income" | "expense"

interface TransactionCardProps {
  type: TransactionType // income => verde, expense => rojo
  description: string
  category: string
  date: string
  amount: number
  onEdit?: () => void
  onDelete?: () => void
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  type,
  description,
  category,
  date,
  amount,
  onEdit,
  onDelete,
}) => {
  const isIncome = type === "income"

  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg ${
        isIncome ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${isIncome ? "bg-green-500" : "bg-red-500"}`} />
        <div>
          <p className="font-medium text-sm">{description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {category} • {date}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span
          className={`font-bold text-sm ${isIncome ? "text-green-600" : "text-red-600"}`}
        >
          {isIncome ? "+" : "-"}${amount.toLocaleString()}
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
          <Edit className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export default TransactionCard
