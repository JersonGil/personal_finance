"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterIcon, XIcon, PlusIcon } from "lucide-react"
import TransactionModal from "@/components/transaction-modal"
import { useAllTransactions } from '@/hooks/use-all-transactions'
import { TransactionsTable } from '@/components/transactions/transactions-table'
import type { Transaction } from '@/types/finance'

interface TransactionsPageProps {
  initialTransactions?: Transaction[]
}

export default function TransactionsPage({ initialTransactions }: Readonly<TransactionsPageProps>) {
  const { transactions, loading, createTransaction, error, setInitial } = useAllTransactions({ realtime: true })
  // Hydrate once if initial provided and store empty
  useEffect(() => {
    if (initialTransactions?.length && transactions.length === 0) {
      setInitial(initialTransactions)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTransactions])

  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all")
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  // Pagination state removed (handled inside TransactionsTable)

  const filteredTransactions = useMemo(() => {
    const list = transactions
      .filter((transaction) => {
        if (dateFrom && new Date(transaction.date) < new Date(dateFrom)) return false
        if (dateTo && new Date(transaction.date) > new Date(dateTo)) return false
        if (typeFilter !== "all" && transaction.type !== typeFilter) return false
        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return list
  }, [transactions, dateFrom, dateTo, typeFilter])

  // Pagination related effects removed

  const clearFilters = () => {
    setDateFrom("")
    setDateTo("")
    setTypeFilter("all")
  }

  const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + (isNaN(t.amount) ? 0 : t.amount), 0)
  const totalExpense = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + (isNaN(t.amount) ? 0 : t.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Todas las Transacciones</h1>
        <Button onClick={() => setIsTransactionModalOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nueva Transacción
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="date-from" className="text-sm font-medium">Fecha desde</label>
              <Input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="date-to" className="text-sm font-medium">Fecha hasta</label>
              <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="type-filter" className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={(value: "all" | "income" | "expense") => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Ingresos</SelectItem>
                  <SelectItem value="expense">Gastos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                <XIcon className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Transacciones</p>
              <p className="text-2xl font-bold">{filteredTransactions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Gastos</p>
              <p className="text-2xl font-bold text-red-600">${totalExpense.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transacciones ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            transactions={filteredTransactions}
            loading={loading}
            error={error}
            initialPageSize={10}
          />
        </CardContent>
      </Card>

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={async (tx) => {
          await createTransaction(tx)
          setIsTransactionModalOpen(false)
        }}
      />
    </div>
  )
}
