import BalanceView from '@/view/balance-view';
import { createClient } from '@/lib/server';

async function getBalanceData() {
  try {
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { balances: [], categories: [] };
    const [balancesRes, categoriesRes] = await Promise.all([
      sb.from('balances').select('*, category:category_id(id,name)').eq('user_id', user.id),
      sb
        .from('balance_categories')
        .select('id,name,user_id,created_at,updated_at')
        .eq('user_id', user.id)
        .order('name'),
    ]);
    return {
      balances: balancesRes.error ? [] : balancesRes.data || [],
      categories: categoriesRes.error ? [] : categoriesRes.data || [],
    };
  } catch {
    return { balances: [], categories: [] };
  }
}

export const metadata = {
  title: 'Balance | Finanzas',
};

export default async function BalancePage() {
  const { balances, categories } = await getBalanceData();
  return <BalanceView initialBalances={balances} initialCategories={categories} />;
}
