'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

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
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';

const paymentSchema = z.object({
  person: z.string(),
  paymentMethod: z.enum(['efectivo', 'yape', 'transferencia']),
  yapeRecipient: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const familyMembers = ['SEBASTIAN', 'ARIANA', 'STHEFANY', 'TOMAS', 'PILAR', 'MATIAS'];
const yapeRecipients = ['STHEFANY', 'MATIAS', 'PILAR'];

interface JuntaPayment {
  id: string;
  person: string;
  date: Date;
  paymentMethod: string;
  yapeRecipient?: string;
}

export function JuntaManagement() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [paymentsForDay, setPaymentsForDay] = useState<JuntaPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('family-finance-user');
    if (user !== 'TOMAS') {
      router.push('/dashboard');
      return;
    }
    fetchPayments(selectedDate);
  }, [router, selectedDate]);

  const fetchPayments = async (date: Date) => {
    setIsLoading(true);
    try {
      const startOfSelectedDay = startOfDay(date);
      const endOfSelectedDay = new Date(startOfSelectedDay);
      endOfSelectedDay.setHours(23, 59, 59, 999);
      
      const q = query(
        collection(db, 'juntaPayments'),
        where('date', '>=', Timestamp.fromDate(startOfSelectedDay)),
        where('date', '<=', Timestamp.fromDate(endOfSelectedDay))
      );

      const querySnapshot = await getDocs(q);
      const payments: JuntaPayment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        payments.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
        } as JuntaPayment);
      });
      setPaymentsForDay(payments);
    } catch (error) {
      console.error("Error fetching payments: ", error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pagos de la junta.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const paidMembers = paymentsForDay.map(p => p.person);
  const unpaidMembers = familyMembers.filter(m => !paidMembers.includes(m));

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={es}
              disabled={(date) => date > new Date()}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Pagos de la Junta - {format(selectedDate, 'PPP', { locale: es })}</CardTitle>
            <CardDescription>
              Registra y visualiza los pagos de la junta para el día seleccionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PaymentRegistrationForm
              unpaidMembers={unpaidMembers}
              selectedDate={selectedDate}
              onPaymentAdded={() => fetchPayments(selectedDate)}
            />
            <div>
              <h3 className="text-lg font-medium mb-2">Estado de Pagos</h3>
              {isLoading ? (
                <p>Cargando...</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Pagado</h4>
                    <div className="flex flex-wrap gap-2">
                      {paidMembers.length > 0 ? paidMembers.map(member => (
                        <Badge key={member} variant="default">{member}</Badge>
                      )) : <p className="text-sm text-muted-foreground">Nadie ha pagado aún.</p>}
                    </div>
                  </div>
                   <div>
                    <h4 className="font-semibold text-destructive mb-2">Pendiente</h4>
                     {unpaidMembers.length > 0 ? (
                       <Alert variant="destructive">
                         <AlertTitle>¡Pagos Pendientes!</AlertTitle>
                         <AlertDescription>
                           Las siguientes personas aún no han realizado su pago: {unpaidMembers.join(', ')}.
                         </AlertDescription>
                       </Alert>
                     ) : (
                        <Alert>
                           <AlertTitle>¡Todos han pagado!</AlertTitle>
                           <AlertDescription>
                            No hay pagos pendientes para este día.
                           </AlertDescription>
                        </Alert>
                     )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface PaymentRegistrationFormProps {
    unpaidMembers: string[];
    selectedDate: Date;
    onPaymentAdded: () => void;
}

function PaymentRegistrationForm({ unpaidMembers, selectedDate, onPaymentAdded }: PaymentRegistrationFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            paymentMethod: 'efectivo',
        }
    });

    const paymentMethod = form.watch('paymentMethod');

    async function onSubmit(values: PaymentFormValues) {
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'juntaPayments'), {
                person: values.person,
                paymentMethod: values.paymentMethod,
                yapeRecipient: values.yapeRecipient || null,
                date: selectedDate,
                createdAt: serverTimestamp(),
            });
            toast({
              title: 'Pago Registrado',
              description: `Se registró el pago de ${values.person}.`,
            });
            form.reset({ ...form.getValues(), person: '', yapeRecipient: '' });
            onPaymentAdded();
        } catch (error) {
            console.error("Error adding payment: ", error);
            toast({
                title: 'Error',
                description: 'No se pudo registrar el pago.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (unpaidMembers.length === 0) {
        return null;
    }

    return (
        <div>
            <h3 className="text-lg font-medium mb-4">Registrar Nuevo Pago</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="person"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Persona</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione una persona" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {unpaidMembers.map(member => (
                                            <SelectItem key={member} value={member}>{member}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Método de Pago</FormLabel>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    if (value !== 'yape') {
                                        form.resetField('yapeRecipient');
                                    }
                                }} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione un método" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                        <SelectItem value="yape">Yape</SelectItem>
                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {paymentMethod === 'yape' && (
                        <FormField
                            control={form.control}
                            name="yapeRecipient"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destinatario Yape</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione destinatario" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {yapeRecipients.map(recipient => (
                                                <SelectItem key={recipient} value={recipient}>{recipient}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        <Save className="mr-2" />
                        {isSubmitting ? 'Guardando...' : 'Guardar Pago'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
