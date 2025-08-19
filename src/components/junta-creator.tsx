'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, Calculator, CalendarIcon, Plus, Trash2, Users, Wand2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { DateRange } from 'react-day-picker';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const participantSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
});

const juntaSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  participants: z.array(participantSchema).min(1, 'Debe haber al menos un participante.'),
});

type JuntaFormValues = z.infer<typeof juntaSchema>;

interface Participant {
  name: string;
  assignedDate: Date | null;
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
    return <JuntaDashboard junta={juntaDetails} onReset={() => { setJuntaDetails(null); setStep(1); form.reset(); }} />;
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
                <Button size="lg" onClick={() => assignDates('random')}>
                    <Wand2 className="mr-2" />
                    Asignación con Ruleta (Aleatorio)
                </Button>
                <Button size="lg" variant="outline" onClick={() => assignDates('manual')}>
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
          Define el rango de fechas y los participantes para la nueva junta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          <span>Selecciona un rango de fechas</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={{ from: field.value?.from, to: field.value?.to }}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

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


function JuntaDashboard({ junta, onReset }: { junta: any; onReset: () => void }) {
    const [payments, setPayments] = useState<{ [date: string]: { [name: string]: boolean } }>({});
    
    const togglePayment = (date: Date, name: string) => {
        const dateString = format(date, 'yyyy-MM-dd');
        setPayments(prev => ({
            ...prev,
            [dateString]: {
                ...prev[dateString],
                [name]: !prev[dateString]?.[name]
            }
        }));
    };

    const totalCollected = Object.values(payments).reduce((acc, dailyPayments) => {
        return acc + Object.values(dailyPayments).filter(paid => paid).length;
    }, 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Dashboard de la Junta</CardTitle>
                    <CardDescription>
                        Seguimiento de aportes del {format(junta.dateRange.from, 'PPP', { locale: es })} al {format(junta.dateRange.to, 'PPP', { locale: es })}
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <CalculatorTool />
                    <Button onClick={onReset} variant="outline">Crear Nueva Junta</Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users />Participantes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {junta.participants.map((p: Participant) => (
                                    <li key={p.name} className="flex justify-between items-center p-2 rounded-md bg-muted">
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
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground">Aportes Recibidos</p>
                            <p className="text-4xl font-bold">{totalCollected}</p>
                            <p className="text-sm text-muted-foreground">de {junta.participants.length} aportes totales</p>
                        </CardContent>
                    </Card>
                </div>
                
                <div>
                    <h3 className="text-xl font-semibold mb-4">Registro de Aportes Diarios</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {Array.from({ length: differenceInDays(junta.dateRange.to, junta.dateRange.from) + 1 }, (_, i) => {
                            const day = addDays(junta.dateRange.from, i);
                            const dayString = format(day, 'yyyy-MM-dd');
                            const responsible = junta.participants.find((p: Participant) => format(p.assignedDate!, 'yyyy-MM-dd') === dayString)?.name;
                            const paid = payments[dayString]?.[responsible!] ?? false;
                            return (
                                <Card key={dayString}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{format(day, 'EEEE, dd MMMM', { locale: es })}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                               <p>Le toca a: <span className="font-bold text-primary">{responsible}</span></p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label htmlFor={`payment-${dayString}`} className="text-sm font-medium">
                                                    {paid ? 'Aporte Recibido' : 'Marcar como Recibido'}
                                                </label>
                                                <input
                                                    type="checkbox"
                                                    id={`payment-${dayString}`}
                                                    checked={paid}
                                                    onChange={() => togglePayment(day, responsible!)}
                                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                            </div>
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

function CalculatorTool() {
    const [display, setDisplay] = useState('0');
    const [open, setOpen] = useState(false);

    const handleInput = (value: string) => {
        if (display === '0' && value !== '.') {
            setDisplay(value);
        } else {
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
                <div className="p-2 bg-muted rounded-md text-right text-3xl font-mono break-all">{display}</div>
                <div className="grid grid-cols-4 gap-2">
                    <Button onClick={clear} className="col-span-4" variant="destructive">C</Button>
                    {buttons.map(btn => (
                        <Button
                            key={btn}
                            onClick={() => {
                                if (btn === '=') calculate();
                                else handleInput(btn);
                            }}
                            variant={['÷', '×', '-', '+', '='].includes(btn) ? 'secondary' : 'outline'}
                        >
                            {btn}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
