'use client';
import { TransactionForm } from '@/components/transaction-form';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AddTransactionPage() {
  const router = useRouter();
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-6 md:p-6">
        <div className="w-full max-w-lg">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
            </Button>
            <TransactionForm onTransactionAdded={() => router.push('/dashboard')} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
