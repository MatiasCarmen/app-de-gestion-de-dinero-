"use client";

import type { FC } from "react";
import React, { useState, useTransition, useRef, useEffect } from "react";
import { Send, Wand2 } from "lucide-react";
import { financialChat } from "@/ai/flows/financial-advice";
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
import { MessageData } from "genkit/ai";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

interface AIAdvisorProps {
  transactions: Transaction[];
}

export const AIAdvisor: FC<AIAdvisorProps> = ({ transactions }) => {
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Initial message from the assistant
    setMessages([
      {
        role: "model",
        content: [{ text: "¡Hola! Soy FinPal, tu asesor financiero personal. 🤖 ¿En qué puedo ayudarte hoy?" }],
      },
    ]);
  }, []);

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);


  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: MessageData = {
      role: "user",
      content: [{ text: input }],
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    startTransition(async () => {
      setError(null);
      try {
        if (transactions.length === 0) {
            setMessages(prev => [...prev, { role: "model", content: [{ text: "No tienes transacciones todavía. ¡Añade algunas para que pueda ayudarte a analizar tus finanzas! 📈" }] }]);
            return;
        }

        const response = await financialChat({
          history: newMessages,
          transactions: transactions,
        });
        
        setMessages(prev => [...prev, { role: "model", content: [{ text: response }] }]);

      } catch (e) {
        setError("No se pudieron obtener los consejos de la IA. Inténtelo de nuevo más tarde.");
        console.error(e);
      }
    });
  };

  return (
    <Card className="col-span-1 md:col-span-2 flex flex-col h-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Wand2 className="h-5 w-5 text-accent" />
          Asesor Financiero de IA
        </CardTitle>
        <CardDescription>
          Conversa con FinPal para obtener consejos sobre tus finanzas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-4 pr-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={cn(
                        "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.role === "user"
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                    >
                        {message.content[0].text}
                    </div>
                ))}
                {isPending && (
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                )}
                 {error && <p className="text-destructive">{error}</p>}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center space-x-2">
            <Textarea
                id="message"
                placeholder="Escribe tu pregunta aquí..."
                className="resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
            />
            <Button onClick={handleSendMessage} disabled={isPending || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar</span>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
