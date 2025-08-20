import BudgetView from '@/view/budget-view';
import { createClient } from '@/lib/server';

async function getBudgets() {
  try {
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return [];
    const { data, error } = await sb
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('month', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'Presupuestos | Finanzas',
};

export default async function BudgetPage() {
  const budgets = await getBudgets();
  return <BudgetView initialBudgets={budgets} />;
}
