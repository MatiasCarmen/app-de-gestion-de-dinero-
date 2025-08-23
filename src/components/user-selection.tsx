'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import React from 'react';

const familyMembers = ['SEBASTIAN', 'TOMAS', 'PILAR', 'ARIANA', 'STHEFANY'];

export function UserSelection() {
  const router = useRouter();

  const handleUserSelect = (user: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('family-finance-user', user);
    }
    router.push('/dashboard');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">¿Quién eres?</CardTitle>
        <CardDescription>Selecciona tu perfil para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {familyMembers.map((member) => (
            <Button
              key={member}
              onClick={() => handleUserSelect(member)}
              className="h-14 w-full text-lg"
              variant="secondary"
            >
              <User className="mr-2 h-6 w-6" />
              {member}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
