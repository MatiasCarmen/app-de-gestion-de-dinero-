'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, BarChart3, Calculator, CalendarIcon, CheckCircle, Plus, Trash2, Users, Wand2, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


const participantSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
});

const juntaSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: 'La fecha de inicio es requerida.' }),
    to: z.date({ required_error: 'La fecha de fin es requerida.' }),
  }),
  participants: z.array(participantSchema).min(1, 'Debe haber al menos un participante.'),
  dailyContribution: z.coerce.number().positive('El aporte diario debe ser mayor que cero.'),
});

type JuntaFormValues = z.infer<typeof juntaSchema>;

interface Participant {
  name: string;
  assignedDate: Date | null;
}

interface Payment {
    paid: boolean;
    amount: number;
    method?: 'efectivo' | 'yape' | 'transferencia';
    yapeTo?: 'Sthefany' | 'Matias' | 'Pilar';
}


export function JuntaCreator() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [juntaDetails, setJuntaDetails] = useState<any>(null);

  const form = useForm<JuntaFormValues>({
    resolver: zodResolver(juntaSchema),
    defaultValues: {
      participants: [{ name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'participants',
  });

  function onSubmit(values: JuntaFormValues) {
    if (!values.dateRange.from || !values.dateRange.to) {
        toast({
            title: 'Error de validación',
            description: 'Debe seleccionar un rango de fechas.',
            variant: 'destructive',
        });
        return;
    }
    const days = differenceInDays(values.dateRange.to, values.dateRange.from) + 1;
    if (values.participants.length !== days) {
      toast({
        title: 'Error de validación',
        description: `El número de participantes (${values.participants.length}) debe ser igual al número de días (${days}).`,
        variant: 'destructive',
      });
      return;
    }

    setJuntaDetails({
      ...values,
      participants: values.participants.map(p => ({ name: p.name, assignedDate: null })),
    });
    setStep(2);
  }

  const assignDates = (method: 'random' | 'manual') => {
    let assignedParticipants: Participant[] = [...juntaDetails.participants];
    const startDate = juntaDetails.dateRange.from;
    const numDays = differenceInDays(juntaDetails.dateRange.to, juntaDetails.dateRange.from) + 1;
    
    if (method === 'random') {
      let availableDates = Array.from({ length: numDays }, (_, i) => addDays(startDate, i));
      
      assignedParticipants = assignedParticipants.map(p => {
        const randomIndex = Math.floor(Math.random() * availableDates.length);
        const assignedDate = availableDates[randomIndex];
        availableDates.splice(randomIndex, 1);
        return { ...p, assignedDate };
      });

    } else { // manual
       assignedParticipants = assignedParticipants.map((p, index) => ({
        ...p,
        assignedDate: addDays(startDate, index),
      }));
    }
    
    setJuntaDetails({ ...juntaDetails, participants: assignedParticipants });
    setStep(3);
  };
  
  if (juntaDetails && step === 3) {
    return <JuntaDashboard initialJunta={juntaDetails} onReset={() => { setJuntaDetails(null); setStep(1); form.reset(); }} />;
  }

  if (juntaDetails && step === 2) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Paso 2: Asignar Turnos</CardTitle>
                <CardDescription>
                    Elige cómo asignar las fechas de pago a los participantes.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
                <Button size="lg" onClick={() => assignDates('random')} className="w-full sm:w-auto">
                    <Wand2 className="mr-2" />
                    Asignación con Ruleta (Aleatorio)
                </Button>
                <Button size="lg" variant="outline" onClick={() => assignDates('manual')} className="w-full sm:w-auto">
                    <ArrowRight className="mr-2" />
                    Asignación Manual (En orden)
                </Button>
            </CardContent>
             <CardFooter>
                <Button variant="ghost" onClick={() => setStep(1)}>Volver</Button>
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paso 1: Crear Nueva Junta</CardTitle>
        <CardDescription>
          Define el rango de fechas, el aporte diario y los participantes para la nueva junta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Rango de Fechas</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={'outline'}
                            className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value?.from && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value?.from ? (
                            field.value.to ? (
                                <>
                                {format(field.value.from, 'LLL dd, y')} -{' '}
                                {format(field.value.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(field.value.from, 'LLL dd, y')
                            )
                            ) : (
                            <span>Selecciona un rango</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value?.from && field.value?.to ? { from: field.value.from, to: field.value.to } : undefined}
                            onSelect={field.onChange}
                            numberOfMonths={1}
                            locale={es}
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="dailyContribution"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Aporte Diario (S/)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Ej. 10" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            

            <div>
                <FormLabel>Participantes ({fields.length})</FormLabel>
                <div className="space-y-2 pt-2">
                {fields.map((field, index) => (
                  <FormField
                    control={form.control}
                    key={field.id}
                    name={`participants.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder={`Nombre del participante ${index + 1}`} {...field} />
                        </FormControl>
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ name: '' })}
                >
                    <Plus className="mr-2"/>
                    Añadir Participante
                </Button>
            </div>

            <Button type="submit" className="w-full">
                Siguiente Paso
                <ArrowRight className="ml-2"/>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


function JuntaDashboard({ initialJunta, onReset }: { initialJunta: any; onReset: () => void }) {
    const router = useRouter();
    const [junta, setJunta] = useState(initialJunta);
    const [payments, setPayments] = useState<{ [date: string]: Payment }>({});
    
    const savePayment = (date: Date, paymentDetails: Omit<Payment, 'paid'>) => {
        const dateString = format(date, 'yyyy-MM-dd');
        setPayments(prev => ({
            ...prev,
            [dateString]: {
                ...paymentDetails,
                paid: true
            }
        }));
    };
    
    useEffect(() => {
        setJunta(prev => ({ ...prev, payments }));
    }, [payments]);


    const totalCollected = Object.values(payments).reduce((acc, dailyPayment) => {
        return acc + (dailyPayment.paid ? dailyPayment.amount : 0);
    }, 0);
    
    const totalExpected = Object.values(payments).filter(p => p.paid).length * junta.dailyContribution;
    
    const handleGoToReports = () => {
        const data = encodeURIComponent(JSON.stringify({ ...junta, payments }));
        router.push(`/junta/reports?data=${data}`);
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Dashboard de la Junta</CardTitle>
                    <CardDescription>
                        Seguimiento del {format(junta.dateRange.from, 'PPP', { locale: es })} al {format(junta.dateRange.to, 'PPP', { locale: es })}
                    </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                    <CalculatorTool />
                    <Button onClick={handleGoToReports} variant="outline" size="sm">
                       <BarChart3 className="mr-2" /> Ver Reportes
                    </Button>
                    <Button onClick={onReset} variant="outline" size="sm">Nueva Junta</Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users />Participantes ({junta.participants.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {junta.participants.sort((a: Participant, b: Participant) => a.assignedDate!.getTime() - b.assignedDate!.getTime()).map((p: Participant) => (
                                    <li key={p.name} className="flex justify-between items-center p-2 rounded-md bg-muted text-sm">
                                        <span className="font-medium">{p.name}</span>
                                        <Badge variant="secondary">{format(p.assignedDate!, 'dd MMM', { locale: es })}</Badge>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Resumen Financiero</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                           <div className="text-center">
                                <p className="text-sm text-muted-foreground">Aporte Diario Esperado</p>
                                <p className="text-2xl font-bold">S/ {junta.dailyContribution.toFixed(2)}</p>
                           </div>
                           <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total Recaudado</p>
                                <p className="text-4xl font-bold text-primary">S/ {totalCollected.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">de {totalExpected.toFixed(2)} esperado</p>
                           </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div>
                    <h3 className="text-xl font-semibold mb-4">Registro de Aportes Diarios</h3>
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                        {Array.from({ length: differenceInDays(junta.dateRange.to, junta.dateRange.from) + 1 }, (_, i) => {
                            const day = addDays(junta.dateRange.from, i);
                            const dayString = format(day, 'yyyy-MM-dd');
                            const responsible = junta.participants.find((p: Participant) => format(p.assignedDate!, 'yyyy-MM-dd') === dayString)?.name;
                            const payment = payments[dayString];
                            return (
                                <Card key={dayString}>
                                    <CardHeader className="p-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                          <CardTitle className="text-lg">{format(day, 'EEEE, dd MMMM', { locale: es })}</CardTitle>
                                          {payment?.paid ? (
                                              <Badge variant="default" className="bg-green-500 text-white"><CheckCircle className="mr-1 h-4 w-4"/>Recibido</Badge>
                                          ) : (
                                              <Badge variant="destructive"><XCircle className="mr-1 h-4 w-4"/>Pendiente</Badge>
                                          )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                            <div>
                                               <p>Le toca a: <span className="font-bold text-primary">{responsible}</span></p>
                                               {payment?.paid && (
                                                <p className="text-xs text-muted-foreground">
                                                    Pagado S/{payment.amount.toFixed(2)} vía {payment.method}{payment.method === 'yape' ? ` a ${payment.yapeTo}` : ''}
                                                </p>
                                               )}
                                            </div>
                                            <PaymentDialog
                                                dailyContribution={junta.dailyContribution}
                                                responsible={responsible!}
                                                onSave={(details) => savePayment(day, details)}
                                                payment={payment}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function PaymentDialog({ dailyContribution, responsible, onSave, payment }: { dailyContribution: number, responsible: string, onSave: (details: Omit<Payment, 'paid'>) => void, payment?: Payment }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        defaultValues: {
            amount: payment?.amount || dailyContribution,
            method: payment?.method || 'efectivo',
            yapeTo: payment?.yapeTo || 'Sthefany',
        }
    });

    const method = form.watch('method');
    
    const handleSubmit = (values: any) => {
        onSave(values);
        setOpen(false);
    };

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={payment?.paid ? "outline" : "default"} size="sm" className="mt-2 sm:mt-0">{payment?.paid ? 'Editar Aporte' : 'Registrar Aporte'}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar aporte de {responsible}</DialogTitle>
                    <DialogDescription>
                        El aporte esperado es de S/{dailyContribution.toFixed(2)}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto Recibido</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Método de Pago</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                </FormItem>
                            )}
                        />
                        {method === 'yape' && (
                             <FormField
                                control={form.control}
                                name="yapeTo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Yape recibido por</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione persona" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Sthefany">Sthefany</SelectItem>
                                                <SelectItem value="Matias">Matias</SelectItem>
                                                <SelectItem value="Pilar">Pilar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        )}
                        <DialogFooter>
                            <Button type="submit">Guardar Aporte</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}


function CalculatorTool() {
    const [display, setDisplay] = useState('0');
    const [open, setOpen] = useState(false);

    const handleInput = (value: string) => {
        if (display === '0' && value !== '.') {
            setDisplay(value);
        } else if (display === 'Error') {
            setDisplay(value);
        }
        else {
            setDisplay(display + value);
        }
    };

    const calculate = () => {
        try {
            // Using eval is generally unsafe, but for a simple calculator it's a quick solution.
            // A production app should use a proper parsing library.
            const result = eval(display.replace(/×/g, '*').replace(/÷/g, '/'));
            setDisplay(String(result));
        } catch (error) {
            setDisplay('Error');
        }
    };

    const clear = () => setDisplay('0');
    
    const backspace = () => setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');


    const buttons = [
        '7', '8', '9', '÷',
        '4', '5', '6', '×',
        '1', '2', '3', '-',
        '0', '.', '=', '+',
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon"><Calculator /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[300px]">
                <DialogHeader>
                    <DialogTitle>Calculadora</DialogTitle>
                </DialogHeader>
                <div className="p-2 bg-muted rounded-md text-right text-3xl font-mono break-all h-16 flex items-center justify-end">{display}</div>
                <div className="grid grid-cols-4 gap-2">
                    <Button onClick={clear} className="col-span-2" variant="destructive">C</Button>
                    <Button onClick={backspace} className="col-span-2" variant="secondary">Borrar</Button>

                    {buttons.map(btn => (
                        <Button
                            key={btn}
                            onClick={() => {
                                if (btn === '=') calculate();
                                else handleInput(btn);
                            }}
                            variant={['÷', '×', '-', '+', '='].includes(btn) ? 'secondary' : 'outline'}
                            className={btn === '=' ? 'col-span-2' : ''}
                        >
                            {btn}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
