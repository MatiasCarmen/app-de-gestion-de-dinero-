'use server';

/**
 * @fileOverview Provides personalized financial advice based on user's income and expenses.
 *
 * - getFinancialAdvice - A function that generates financial advice.
 * - FinancialAdviceInput - The input type for the getFinancialAdvice function.
 * - FinancialAdviceOutput - The return type for the getFinancialAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialAdviceInputSchema = z.object({
  income: z
    .number()
    .describe('The total monthly income of the user.'),
  expenses: z
    .number()
    .describe('The total monthly expenses of the user.'),
  spendingPatterns: z
    .string()
    .describe(
      'A detailed description of the user spending habits, including categories and amounts.'
    ),
});
export type FinancialAdviceInput = z.infer<typeof FinancialAdviceInputSchema>;

const FinancialAdviceOutputSchema = z.object({
  advice: z.string().describe('Personalized financial advice for the user.'),
  summary: z.string().describe('A summary of the income, expenses, and spending patterns.'),
});
export type FinancialAdviceOutput = z.infer<typeof FinancialAdviceOutputSchema>;

export async function getFinancialAdvice(input: FinancialAdviceInput): Promise<FinancialAdviceOutput> {
  return financialAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialAdvicePrompt',
  input: {schema: FinancialAdviceInputSchema},
  output: {schema: FinancialAdviceOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's financial situation based on their income, expenses, and spending patterns, and provide personalized advice on how to improve their financial health.

  Income: {{{income}}}
  Expenses: {{{expenses}}}
  Spending Patterns: {{{spendingPatterns}}}

  Provide the advice in a concise and actionable manner. Also provide a short summary of the user's financial situation.
  Summary:
  Advice:`, // Ensure proper formatting for the summary and advice
});

const financialAdviceFlow = ai.defineFlow(
  {
    name: 'financialAdviceFlow',
    inputSchema: FinancialAdviceInputSchema,
    outputSchema: FinancialAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
