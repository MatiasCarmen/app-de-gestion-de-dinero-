"use client";

import type { FC } from "react";
import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { List } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface TransactionListProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(amount);
};

export const TransactionList: FC<TransactionListProps> = ({
  transactions,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <List className="h-5 w-5" />
          Transacciones Recientes
        </CardTitle>
        <CardDescription>
          Una lista de sus ingresos y gastos más recientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell">Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead className="hidden md:table-cell">Persona</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="hidden sm:table-cell">
                    {format(t.date, "dd MMM, yyyy", { locale: es })}
                  </TableCell>
                  <TableCell className="font-medium">
                    <p className="font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground sm:hidden">
                      {format(t.date, "dd MMM, yyyy", { locale: es })}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{t.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{t.person}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      t.type === "income"
                        ? "text-primary"
                        : "text-destructive"
                    )}
                  >
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No hay transacciones.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
