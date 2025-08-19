import { Header } from '@/components/header';
import { JuntaManagement } from '@/components/junta-management';
import { Toaster } from '@/components/ui/toaster';

export default function JuntaPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-6 md:p-6">
        <div className="w-full max-w-4xl">
          <JuntaManagement />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
