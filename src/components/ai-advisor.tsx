"use client";

import type { FC } from "react";
import React, { useState, useTransition } from "react";
import { Wand2 } from "lucide-react";
import { getFinancialAdvice, type FinancialAdviceOutput } from "@/ai/flows/financial-advice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/lib/types";

interface AIAdvisorProps {
  transactions: Transaction[];
}

export const AIAdvisor: FC<AIAdvisorProps> = ({ transactions }) => {
  const [isPending, startTransition] = useTransition();
  const [advice, setAdvice] = useState<FinancialAdviceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetAdvice = () => {
    startTransition(async () => {
      setError(null);
      setAdvice(null);
      try {
        const income = transactions
          .filter((t) => t.type === "income")
          .reduce((acc, t) => acc + t.amount, 0);
        const expenses = transactions
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => acc + t.amount, 0);

        if (income === 0 && expenses === 0) {
          setError("No hay suficientes datos para generar consejos. Por favor, agregue algunas transacciones.");
          return;
        }

        const spendingPatterns = transactions
          .filter((t) => t.type === "expense")
          .map(
            (t) =>
              `${t.category}: $${t.amount.toFixed(2)} en ${
                t.description
              } por ${t.person}`
          )
          .join(", ");

        const result = await getFinancialAdvice({
          income,
          expenses,
          spendingPatterns: spendingPatterns || "No expenses recorded.",
        });
        setAdvice(result);
      } catch (e) {
        setError("No se pudieron obtener los consejos de la IA. Inténtelo de nuevo más tarde.");
        console.error(e);
      }
    });
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Wand2 className="h-5 w-5 text-accent" />
          Asesor Financiero de IA
        </CardTitle>
        <CardDescription>
          Obtenga consejos personalizados sobre cómo mejorar su salud financiera basados en sus hábitos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : advice ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Resumen Financiero</h3>
              <p className="text-sm text-muted-foreground">{advice.summary}</p>
            </div>
            <div>
              <h3 className="font-semibold">Consejos</h3>
              <p className="text-sm text-muted-foreground">{advice.advice}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Haga clic en el botón para generar un análisis de IA de sus finanzas.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetAdvice} disabled={isPending} variant="secondary">
          {isPending ? "Generando..." : "Obtener Consejos de IA"}
        </Button>
      </CardFooter>
    </Card>
  );
};
