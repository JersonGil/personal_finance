"use client"

import { useState, useMemo, useEffect } from 'react'
import type { Transaction } from '@/types/finance'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TransactionsTableProps {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  initialPageSize?: number
  className?: string
}

/**
 * TransactionsTable (Organism)
 * - Handles pagination, desktop table, mobile card list, and page size selection.
 * - Parent supplies already-filtered transactions plus loading/error flags.
 */
export function TransactionsTable({ transactions, loading, error, initialPageSize = 10, className }: Readonly<TransactionsTableProps>) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Reset page when data length shrinks below current window or pageSize changes
  useEffect(() => { setPage(0) }, [pageSize])
  useEffect(() => { if (page * pageSize >= transactions.length) setPage(0) }, [transactions.length, page, pageSize])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(transactions.length / pageSize)), [transactions.length, pageSize])
  const currentPage = Math.min(page, totalPages - 1)
  const pageStart = currentPage * pageSize
  const pageEnd = Math.min(pageStart + pageSize, transactions.length)
  const paginated = transactions.slice(pageStart, pageEnd)

  return (
    <div className={className}>
      {loading && (
        <div className="text-center py-8 text-muted-foreground text-sm">Cargando transacciones...</div>
      )}
      {!loading && error && (
        <div className="text-center py-8 text-red-600 text-sm">Error: {error}</div>
      )}
      {!loading && !error && transactions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No se encontraron transacciones con los filtros aplicados</div>
      )}
      {!loading && !error && transactions.length > 0 && (
        <div className="space-y-4">
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-left p-2">Categoría</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-right p-2">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{format(new Date(transaction.date), 'dd/MM/yyyy', { locale: es })}</td>
                      <td className="p-2">{transaction.description}</td>
                      <td className="p-2">{transaction.category}</td>
                      <td className="p-2">
                        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                          {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </Badge>
                      </td>
                      <td
                        className={`p-2 text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="md:hidden space-y-3">
            {paginated.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{transaction.category}</span>
                    <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                      {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t mt-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span>Mostrando {pageStart + 1}-{pageEnd} de {transactions.length}</span>
              <span>Página {currentPage + 1} de {totalPages}</span>
              <div className="flex items-center gap-1">
                <label htmlFor="page-size" className="text-xs font-medium">Tamaño página:</label>
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger id="page-size" className="h-7 w-[90px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >Anterior</Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              >Siguiente</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
