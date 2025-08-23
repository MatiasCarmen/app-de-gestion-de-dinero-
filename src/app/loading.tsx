import { Wallet } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="animate-bounce">
        <Wallet className="h-16 w-16 text-primary" />
      </div>
      <p className="mt-4 text-lg font-semibold text-primary">Cargando...</p>
    </div>
  );
}
