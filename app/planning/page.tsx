import { PlanningView } from '@/view/planning/planning';
import { createClient } from '@/lib/server';

async function getInitialData() {
  try {
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { planned: [], budgets: [], transactions: [] };

    const [plannedRes, budgetsRes, transactionsRes] = await Promise.all([
      sb
        .from('planned_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: true })
        .order('created_at', { ascending: false }),
      sb
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false })
        .order('created_at', { ascending: false }),
      sb
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
    ]);

    return {
      planned: plannedRes.data || [],
      budgets: budgetsRes.data || [],
      transactions: transactionsRes.data || [],
    };
  } catch {
    return { planned: [], budgets: [], transactions: [] };
  }
}

export const metadata = {
  title: 'Planificación | Finanzas',
};

export default async function PlanningPage() {
  const { planned, budgets, transactions } = await getInitialData();
  return (
    <PlanningView
      initialPlanned={planned}
      initialBudgets={budgets}
      initialTransactions={transactions}
    />
  );
}
