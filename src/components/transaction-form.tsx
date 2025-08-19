'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'El tipo es requerido.',
  }),
  amount: z.coerce.number().positive('La cantidad debe ser positiva.'),
  description: z.string().min(2, 'La descripción es requerida.'),
  date: z.date({ required_error: 'La fecha es requerida.' }),
  category: z.string({ required_error: 'La categoría es requerida.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onTransactionAdded: () => void;
}

const expenseCategories = ['Comida', 'Transporte', 'Vivienda', 'Entretenimiento', 'Salud', 'Otros'];
const incomeCategories = ['Salario', 'Junta', 'Otros'];

export function TransactionForm({ onTransactionAdded }: TransactionFormProps) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('family-finance-user');
    if (user) {
      setCurrentUser(user);
    } else {
      router.push('/');
    }
  }, [router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      description: '',
      date: new Date(),
    },
  });

  const transactionType = form.watch('type');

  function onSubmit(values: FormValues) {
    const storedTransactions = localStorage.getItem('family-finance-transactions');
    const transactions: Transaction[] = storedTransactions ? JSON.parse(storedTransactions).map((t: any) => ({...t, date: new Date(t.date)})) : [];
    
    const newTransaction: Transaction = {
      id: new Date().toISOString(),
      ...values,
      person: currentUser,
    };

    const updatedTransactions = [newTransaction, ...transactions];
    localStorage.setItem('family-finance-transactions', JSON.stringify(updatedTransactions));

    toast({
      title: 'Transacción Agregada',
      description: `Se agregó ${values.type === 'income' ? 'un ingreso' : 'un gasto'} de ${values.amount}.`,
    });
    form.reset();
    onTransactionAdded();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <PlusCircle className="h-5 w-5 text-primary" />
          Agregar Transacción
        </CardTitle>
        <CardDescription>
          Registre un nuevo ingreso o gasto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                   <Select onValueChange={(value) => {
                       field.onChange(value);
                       form.resetField("category");
                   }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Gasto</SelectItem>
                      <SelectItem value="income">Ingreso</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto (S/)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(transactionType === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Compras del supermercado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
                <FormLabel>Persona</FormLabel>
                <FormControl>
                    <Input value={currentUser} readOnly disabled />
                </FormControl>
            </FormItem>


            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: es })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Agregar Transacción
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
