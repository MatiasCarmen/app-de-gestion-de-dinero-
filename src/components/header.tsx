'use client';

import { Wallet, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('family-finance-user');
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('family-finance-user');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <nav className="flex items-center gap-4 text-lg font-medium md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold text-primary md:text-base"
        >
          <Wallet className="h-6 w-6" />
          <span className="font-headline sr-only sm:not-sr-only">
            Finanzas Familiares
          </span>
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4" />
            <span>{user}</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
