"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import type { Transaction } from "@/types/finance"
import TransactionModal from "@/components/transaction-modal"
import React, { useState } from "react"
import { toast } from "sonner"
import NoTransactions from "@/components/no-transactions"
import TransactionCard from "./components/transaction-card"
import { createTransaction } from "@/service/transactions"

import { useTransactionsStore } from "@/store/transactions-store"

const RecentTransactions: React.FC = () => {
  const transactions = useTransactionsStore(s => s.transactions)
  const addTransaction = useTransactionsStore(s => s.addTransaction)
  const replaceTemp = useTransactionsStore(s => s.replaceTemp)
  const removeTransaction = useTransactionsStore(s => s.removeTransaction)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)

  const handleSaveTransaction = async (transaction: Pick<Transaction, "type" | "amount" | "category" | "description" | "date">) => {
    // Optimistic placeholder id
    const tempId = `temp-${Date.now()}`
    const optimistic: Transaction = {
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "optimistic",
      ...transaction,
    }
    addTransaction(optimistic)
  const { error, data } = await createTransaction(transaction)
    if (error) {
      toast.error("Hubo un error al guardar la transacción.")
      console.error("Error saving transaction:", error)
      // Rollback optimistic placeholder
      removeTransaction(tempId)
    } else {
      setIsTransactionModalOpen(false)
      toast.success("Transacción guardada correctamente.")
      if (data) {
        // Replace temp with actual row to avoid double counting
        replaceTemp(tempId, data as unknown as Transaction)
      }
    }
  }

  // Filtrar ingresos y egresos desde props
  const incomeTransactions = (transactions ?? []).filter((t) => t.type === "income").slice(-10).reverse()
  const expenseTransactions = (transactions ?? []).filter((t) => t.type === "expense").slice(-10).reverse()

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
            <Button onClick={() => setIsTransactionModalOpen(true)} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Transacción
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-auto max-h-[500px]">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <h3 className="font-semibold text-green-600">Entradas</h3>
              </div>
              {incomeTransactions.length > 0 ? (
                incomeTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    type="income"
                    description={transaction.description}
                    category={transaction.category}
                    date={transaction.date}
                    amount={transaction.amount}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))
              ) : (
                <NoTransactions messages="No hay ingresos registrados aún." />
              )}
            </div>

            {/* Columna Egresos */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <h3 className="font-semibold text-red-600">Salidas</h3>
              </div>
              {expenseTransactions.length > 0 ? (
                expenseTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    type="expense"
                    description={transaction.description}
                    category={transaction.category}
                    date={transaction.date}
                    amount={transaction.amount}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
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
