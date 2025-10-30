'use server';

/**
 * @fileOverview Provides personalized financial advice based on user's income and expenses.
 *
 * - getFinancialAdvice - A function that generates financial advice.
 * - FinancialAdviceInput - The input type for the getFinancialAdvice function.
 * - FinancialAdviceOutput - The return type for the getFinancialAdvice function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'genkit';
import { MessageData, role } from 'genkit/ai';

const FinancialContextSchema = z.object({
  income: z.number().describe('The total monthly income of the user.'),
  expenses: z.number().describe('The total monthly expenses of the user.'),
  spendingPatterns: z
    .string()
    .describe(
      'A detailed description of the user spending habits, including categories and amounts.'
    ),
});

const FinancialChatInputSchema = z.object({
  history: z.array(z.custom<MessageData>()),
  context: FinancialContextSchema,
});

export type FinancialChatInput = z.infer<typeof FinancialChatInputSchema>;


export async function financialChat(input: FinancialChatInput): Promise<string> {
  const { history, context } = input;

  const systemPrompt = `You are a helpful and friendly personal finance advisor. 
  Your name is 'FinPal'.
  Analyze the user's financial situation based on their income, expenses, and spending patterns, and answer their questions.
  Provide advice in a concise and actionable manner.
  Be friendly and use emojis where appropriate.

  Here is the user's current financial context:
  - Total Income: ${context.income}
  - Total Expenses: ${context.expenses}
  - Spending Patterns: ${context.spendingPatterns || "Not available."}

  Keep your answers short and to the point.
  Start the conversation by introducing yourself and offering help.
  `;

  const chain = ai.prompt({
    system: systemPrompt,
    messages: history,
  });

  const { text } = await chain;
  return text;
}
