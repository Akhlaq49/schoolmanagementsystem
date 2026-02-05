export interface ExpenseCategory {
  expenseCategoryId: number;
  name: string;
}

export interface Expense {
  paymentId: number;
  title?: string;
  expenseCategoryId?: number;
  amount: number;
  paymentMethod?: string;
  description?: string;
  paymentType?: string;
  timestamp: Date;
}

