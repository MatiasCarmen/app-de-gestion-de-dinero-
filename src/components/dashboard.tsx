'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { AlertCircle, Plus, BarChart2, Briefcase } from 'lucide-react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AIAdvisor } from '@/components/ai-advisor';
import { SpendingChart } from '@/components/spending-chart';
import { SummaryCards } from '@/components/summary-cards';
import { TransactionList } from '@/components/transaction-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { type Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import Loading from '@/app/loading';


function DashboardSkeleton() {
    return (
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
}


export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('family-finance-user');
    if (!storedUser) {
      router.push('/');
    } else {
      setUser(storedUser);
    }
  }, [router]);
  
  useEffect(() => {
    if (user) {
      const q = query(collection(db, "transactions"), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactionsData: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          transactionsData.push({
            id: doc.id,
            ...data,
            date: data.date.toDate(),
          } as Transaction);
        });
        setTransactions(transactionsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching transactions: ", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);


  const balance = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return totalIncome - totalExpenses;
  }, [transactions]);

  if (loading || !user) {
    return <Loading />;
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
        {user === 'TOMAS' && (
          <Button asChild variant="outline" className="flex-1">
            <Link href="/junta">
              <Briefcase className="mr-2" />
              Administrar Junta
            </Link>
          </Button>
        )}
      </div>

      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
      }>
        <SummaryCards transactions={transactions} />
      </Suspense>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-80" />}>
          <SpendingChart transactions={transactions} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-80" />}>
         <AIAdvisor transactions={transactions} />
        </Suspense>
      </div>
      
      <Suspense fallback={<Skeleton className="h-96" />}>
        <TransactionList transactions={transactions} />
      </Suspense>
    </div>
  );
}
