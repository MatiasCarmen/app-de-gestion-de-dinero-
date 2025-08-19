"use client";

import React, { useState, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { AIAdvisor } from "@/components/ai-advisor";
import { SpendingChart } from "@/components/spending-chart";
import { SummaryCards } from "@/components/summary-cards";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { type Transaction } from "@/lib/types";

const initialTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    amount: 3000,
    category: "Ingresos",
    date: new Date(),
    person: "Mamá",
    description: "Salario mensual",
  },
  {
    id: "2",
    type: "expense",
    amount: 75.5,
    category: "Comida",
    date: new Date(),
    person: "Papá",
    description: "Compras en el supermercado",
  },
  {
    id: "3",
    type: "expense",
    amount: 120,
    category: "Transporte",
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    person: "Mamá",
    description: "Gasolina del coche",
  },
];

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    setTransactions((prev) => [
      { ...transaction, id: new Date().toISOString() },
      ...prev,
    ]);
  };

  const balance = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    return totalIncome - totalExpenses;
  }, [transactions]);

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      {balance < 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>¡Alerta de Sobregasto!</AlertTitle>
          <AlertDescription>
            Sus gastos han excedido sus ingresos. El saldo actual es negativo.
          </AlertDescription>
        </Alert>
      )}

      <SummaryCards transactions={transactions} />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 grid gap-4 md:gap-8">
            <SpendingChart transactions={transactions} />
            <AIAdvisor transactions={transactions} />
        </div>
        <div className="lg:col-span-2">
            <TransactionForm onAddTransaction={addTransaction} />
        </div>
      </div>
      
      <TransactionList transactions={transactions} />
    </div>
  );
}
