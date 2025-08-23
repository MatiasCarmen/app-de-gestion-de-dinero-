'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TransactionForm } from '@/components/transaction-form';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import Loading from '@/app/loading';

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof id !== 'string') return;

    const fetchTransaction = async () => {
      try {
        const docRef = doc(db, "transactions", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTransaction({
            id: docSnap.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
          } as Transaction);
        } else {
          setError("No se encontró la transacción.");
        }
      } catch (err) {
        setError("Error al cargar la transacción.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-6 md:p-6">
        <div className="w-full max-w-lg">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          {error && <p className="text-destructive text-center">{error}</p>}
          {!error && transaction && (
            <TransactionForm 
              initialData={transaction} 
            />
          )}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
