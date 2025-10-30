'use server';

/**
 * @fileOverview Provides personalized financial advice based on user's income and expenses.
 *
 * - financialChat - A function that generates financial advice based on conversation history and transaction data.
 * - FinancialChatInput - The input type for the financialChat function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'genkit';
import { MessageData } from 'genkit/ai';
import type { Transaction } from '@/lib/types';


const FinancialChatInputSchema = z.object({
  history: z.array(z.custom<MessageData>()),
  transactions: z.array(z.custom<Transaction>()),
});

export type FinancialChatInput = z.infer<typeof FinancialChatInputSchema>;


export async function financialChat(input: FinancialChatInput): Promise<string> {
  const { history, transactions } = input;

  const systemPrompt = `You are a helpful and friendly personal finance advisor and data analyst named 'FinPal'.
Your primary role is to analyze a user's raw transaction data to answer their questions and provide insights.

You will be given a JSON array of all their financial transactions. Use this data as your single source of truth to perform calculations, identify trends, and answer specific user queries.

**Your Capabilities:**
- **Answer Specific Questions:** "How much did I spend on 'Comida' last week?", "What was my largest income source?", "Who spent the most on 'Entretenimiento'?".
- **Perform Calculations:** Calculate totals, averages, and differences based on the data.
- **Identify Trends:** Point out spending patterns, recurring expenses, or significant changes.
- **Provide Advice:** Based on your analysis, offer concise and actionable financial advice.
- **Be Conversational:** Maintain a friendly, encouraging tone and use emojis where appropriate.

**Current Transaction Data (JSON):**
${JSON.stringify(transactions, null, 2)}

Start the conversation by introducing yourself and offering help. If no transactions are available, inform the user and encourage them to add some.
When asked a question, first analyze the provided JSON data to find the answer, then formulate a clear and helpful response.
`;

  const chain = ai.prompt({
    system: systemPrompt,
    messages: history,
  });

  const { text } = await chain;
  return text;
}
