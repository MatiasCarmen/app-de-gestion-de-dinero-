export type TransactionType = "income" | "expense";
export type TransactionCategory = "Ingresos" | "Comida" | "Transporte" | "Vivienda" | "Entretenimiento" | "Salud" | "Otros";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: Date;
  person: string;
  description: string;
};
