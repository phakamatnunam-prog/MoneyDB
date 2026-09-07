export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'transfer' | 'credit_card' | 'other';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  paymentMethod?: PaymentMethod;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  monthlyBudget?: number;
  currency?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CategoryDef {
  id: string;
  name: string;
  type: TransactionType;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // percentage
  transactionCount: number;
  categoryBreakdown: {
    category: string;
    type: TransactionType;
    total: number;
    percentage: number;
    count: number;
  }[];
  dailyBreakdown: {
    date: string;
    dayNum: number;
    income: number;
    expense: number;
    net: number;
  }[];
}
