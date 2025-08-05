'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2 } from "lucide-react"
import type { Transaction } from "@/types/finance"
import TransactionModal from "@/components/transaction-modal"
import { useTransactions } from "@/hooks/use-get-transactions"
import React, { useState } from "react"
import { toast } from "sonner"
import NoTransactions from "@/components/no-transactions"

const RecentTransactions: React.FC<{ refetch: () => Promise<void> }> = ({ refetch }) => {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const { transactions, createTransaction } = useTransactions()

  const handleSaveTransaction = async (transaction: Omit<Transaction, "id">) => {
    const { error } = await createTransaction(transaction)
    if (error) {
      toast.error("Hubo un error al guardar la transacción.")
      console.error("Error saving transaction:", error)
    } else {
      setIsTransactionModalOpen(false)
      toast.success("Transacción guardada correctamente.")
      await refetch()
    }
  }

  // Filtrar ingresos y egresos
  const incomeTransactions = transactions.filter((t) => t.type === "income").slice(-10).reverse()
  const expenseTransactions = transactions.filter((t) => t.type === "expense").slice(-10).reverse()

  return (
    <>
      <Card className="shadow-md border">
        <CardContent className="p-6">
          {/* Contenedor de título, subtítulo y botón */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold">Transacciones Recientes</h2>
              <p className="text-gray-500">Tus últimos movimientos financieros</p>
            </div>
            <Button onClick={() => setIsTransactionModalOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Transacción
            </Button>
          </div>
          {/* Dos columnas: Ingresos y Egresos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna Ingresos */}
            <div>
              <h3 className="font-semibold mb-2">Ingresos</h3>
              {incomeTransactions.length > 0 ? (
                incomeTransactions.map((transaction) => (
                  <Card key={transaction.id} className="mb-4">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.category} • {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-auto">
                        <span className="font-bold text-green-600">
                          +${transaction.amount.toLocaleString()}
                        </span>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <NoTransactions messages="No hay ingresos registrados aún." />
              )}
            </div>
            {/* Columna Egresos */}
            <div>
              <h3 className="font-semibold mb-2">Egresos</h3>
              {expenseTransactions.length > 0 ? (
                expenseTransactions.map((transaction) => (
                  <Card key={transaction.id} className="mb-4">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.category} • {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-auto">
                        <span className="font-bold text-red-600">
                          -${transaction.amount.toLocaleString()}
                        </span>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <NoTransactions messages="No hay egresos registrados aún." />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
      />
    </>
  )
}

export default RecentTransactions
