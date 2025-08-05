'use client'

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2 } from "lucide-react"
import type { Transaction } from "@/types/finance"
import TransactionModal from "@/components/transaction-modal"
import { useTransactions } from "@/hooks/use-get-transactions"
import React, { useState } from "react"
import { toast } from "sonner"
import NoTransactions from "@/components/no-transactions"

const RecentTransactions: React.FC = () => {
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
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transacciones Recientes</CardTitle>
            <CardDescription>Tus últimos movimientos financieros</CardDescription>
          </div>
          <Button onClick={() => setIsTransactionModalOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions
                .slice(-10)
                .reverse()
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          transaction.type === "income" ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.category} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                      </span>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            ) : (
              <NoTransactions messages="No hay transacciones registradas aún." />
            )}
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
