'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle, Plus, BarChart2 } from 'lucide-react';
import { AIAdvisor } from '@/components/ai-advisor';
import { SpendingChart } from '@/components/spending-chart';
import { SummaryCards } from '@/components/summary-cards';
import { TransactionList } from '@/components/transaction-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { type Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 3000,
    category: 'Ingresos',
    date: new Date(),
    person: 'Mamá',
    description: 'Salario mensual',
  },
  {
    id: '2',
    type: 'expense',
    amount: 75.5,
    category: 'Comida',
    date: new Date(),
    person: 'Papá',
    description: 'Compras en el supermercado',
  },
  {
    id: '3',
    type: 'expense',
    amount: 120,
    category: 'Transporte',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    person: 'Mamá',
    description: 'Gasolina del coche',
  },
];

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('family-finance-user');
    if (!storedUser) {
      router.push('/');
    } else {
      setUser(storedUser);
      // Load transactions from localStorage or use initial if none
      const storedTransactions = localStorage.getItem('family-finance-transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions).map((t: any) => ({...t, date: new Date(t.date)})));
      } else {
        setTransactions(initialTransactions);
      }
    }
  }, [router]);
  
  useEffect(() => {
    // Persist transactions to localStorage
     if (transactions.length) {
        localStorage.setItem('family-finance-transactions', JSON.stringify(transactions));
     }
  }, [transactions]);


  const balance = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return totalIncome - totalExpenses;
  }, [transactions]);

  if (!user) {
    return null; // or a loading spinner
  }

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

      <div className="flex flex-col sm:flex-row gap-2">
        <Button asChild className="flex-1">
          <Link href="/add-transaction">
            <Plus className="mr-2" />
            Registrar Transacción
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/reports">
            <BarChart2 className="mr-2" />
            Ver Reportes
          </Link>
        </Button>
      </div>

      <SummaryCards transactions={transactions} />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        <SpendingChart transactions={transactions} />
        <AIAdvisor transactions={transactions} />
      </div>
      
      <TransactionList transactions={transactions} />
    </div>
  );
}
