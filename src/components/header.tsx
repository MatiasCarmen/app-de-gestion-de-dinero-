import { Wallet } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold text-primary md:text-base"
        >
          <Wallet className="h-6 w-6" />
          <span className="font-headline sr-only sm:not-sr-only">Rastreador de Finanzas Familiares</span>
        </Link>
      </nav>
    </header>
  );
}
