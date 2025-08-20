export type TransactionType = 'income' | 'expense';

export interface Transaction {
  amount: number;
  category: string;
  created_at: string;
  date: string;
  description: string;
  id: string;
  type: TransactionType;
  updated_at: string;
  user_id: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // Format: YYYY-MM
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}
