'use client'

import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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

interface JuntaData {
    dateRange: { from: Date; to: Date };
    participants: Participant[];
    dailyContribution: number;
    payments: { [date: string]: Payment };
}

interface JuntaReportsProps {
    initialJunta: JuntaData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function JuntaReports({ initialJunta }: JuntaReportsProps) {
    const router = useRouter();
    const {
        totalCollected,
        totalExpected,
        paymentMethodData,
        complianceData
    } = useMemo(() => {
        const payments = initialJunta.payments || {};
        const totalCollected = Object.values(payments).reduce((acc, p) => acc + (p.paid ? p.amount : 0), 0);
        const totalExpected = initialJunta.participants.length * initialJunta.dailyContribution;

        const methodCounts = Object.values(payments).reduce((acc, p) => {
            if (p.paid && p.method) {
                acc[p.method] = (acc[p.method] || 0) + 1;
            }
            return acc;
        }, {} as { [key: string]: number });

        const paymentMethodData = Object.entries(methodCounts).map(([name, value]) => ({ name, value }));
        
        const complianceData = initialJunta.participants.map(participant => {
            const assignedDateStr = participant.assignedDate ? new Date(participant.assignedDate).toISOString().split('T')[0] : '';
            const payment = payments[assignedDateStr];
            return {
                name: participant.name,
                paid: payment?.paid ? 1 : 0,
                pending: payment?.paid ? 0 : 1,
            }
        });

        return { totalCollected, totalExpected, paymentMethodData, complianceData };
    }, [initialJunta]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Reporte de la Junta</h1>
                    <p className="text-muted-foreground">Estadísticas y análisis de los aportes.</p>
                </div>
                <Button variant="outline" onClick={() => router.push('/junta')}>Volver al Dashboard</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Recaudado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">S/ {totalCollected.toFixed(2)}</p>
                        <p className="text-muted-foreground">de un total esperado de S/ {totalExpected.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Participantes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{initialJunta.participants.length}</p>
                        <p className="text-muted-foreground">miembros activos en la junta</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Aporte Diario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">S/ {initialJunta.dailyContribution.toFixed(2)}</p>
                        <p className="text-muted-foreground">por cada participante</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Métodos de Pago Utilizados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                    {paymentMethodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Cumplimiento por Participante</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={complianceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="paid" stackId="a" fill="#00C49F" name="Pagado" />
                                <Bar dataKey="pending" stackId="a" fill="#FF8042" name="Pendiente" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
