"use client";

import type { FC } from "react";
import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Transaction } from "@/lib/types";
import { TrendingDown } from "lucide-react";

interface SpendingChartProps {
  transactions: Transaction[];
}

export const SpendingChart: FC<SpendingChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const spendingByCategory: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      spendingByCategory[expense.category] =
        (spendingByCategory[expense.category] || 0) + expense.amount;
    });

    return Object.entries(spendingByCategory).map(([category, total]) => ({
      category,
      total,
    }));
  }, [transactions]);

  const chartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <TrendingDown className="h-5 w-5 text-primary" />
          Resumen de Gastos
        </CardTitle>
        <CardDescription>
          Un desglose de sus gastos por categoría este mes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] w-full items-center justify-center">
            <p className="text-muted-foreground">No hay datos de gastos para mostrar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
