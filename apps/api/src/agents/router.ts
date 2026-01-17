import { streamText, generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';
import type { Message } from '@repo/types';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY
});

const routerSystemPrompt = `You are an intelligent router agent for a customer support system. Your job is to analyze user messages and determine which specialized agent should handle the request.

Available agents:
1. SUPPORT - Handles general inquiries, FAQ, account issues, password resets, how-to questions
2. ORDER - Handles order status, tracking, delivery inquiries, order history
3. BILLING - Handles payment issues, invoices, refunds, charges, billing disputes

Analyze the user's message and conversation context to determine the most appropriate agent.`;

export async function routeMessage(
    message: string,
    history: Message[]
): Promise<{ agent: 'support' | 'order' | 'billing'; reasoning: string }> {
    const contextMessages = history.slice(-5).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
    }));

    const result = await generateObject({
        model: groq('llama-3.3-70b-versatile'),
        system: routerSystemPrompt,
        messages: [
            ...contextMessages,
            { role: 'user', content: message }
        ],
        schema: z.object({
            agent: z.enum(['support', 'order', 'billing']).describe('The agent type to route to'),
            reasoning: z.string().describe('Brief explanation of why this agent was chosen')
        })
    });

    return result.object;
}
