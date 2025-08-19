'use client';

import { Header } from '@/components/header';
import { JuntaReports } from '@/components/junta-reports';
import { Toaster } from '@/components/ui/toaster';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function JuntaReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [juntaData, setJuntaData] = useState(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(data));
        // Dates are strings, convert them back to Date objects
        decodedData.dateRange.from = new Date(decodedData.dateRange.from);
        decodedData.dateRange.to = new Date(decodedData.dateRange.to);
        decodedData.participants.forEach((p: any) => {
          if (p.assignedDate) {
            p.assignedDate = new Date(p.assignedDate);
          }
        });
        setJuntaData(decodedData);
      } catch (error) {
        console.error("Failed to parse junta data", error);
        router.push('/junta');
      }
    } else {
        router.push('/junta');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-6 md:p-6">
        <div className="w-full max-w-6xl">
          {juntaData ? <JuntaReports initialJunta={juntaData} /> : <p>Cargando datos de la junta...</p>}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
