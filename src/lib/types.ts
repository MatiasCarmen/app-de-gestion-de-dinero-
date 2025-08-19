export type TransactionType = 'income' | 'expense';
export type TransactionCategory = string; // Allow more flexible categories

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: Date;
  person: string;
  description: string;
};
