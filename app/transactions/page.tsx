import TransactionsView from '@/view/transactions/transactions'
import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import type { Transaction } from '@/types/finance'

export const metadata = { title: 'Transacciones | Finanzas' }

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  const { data: txData } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  // In case of error, still render component with empty list
  const initialTransactions = (txData || []) as Transaction[]
  return <TransactionsView initialTransactions={initialTransactions} />
}
