import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { orderTools } from '../tools/index.js';
import type { Message } from '@repo/types';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY
});

const orderSystemPrompt = `You are an order specialist agent. Your role is to help customers with:
- Checking order status
- Tracking deliveries
- Finding order details
- Viewing order history

You have access to tools to fetch order information and track deliveries. Always provide accurate, up-to-date information from the database. Be proactive in offering relevant details like tracking numbers and estimated delivery dates.

When presenting order information, format it clearly. If an order cannot be found, ask for the correct order ID or offer to look up recent orders.`;

export async function handleOrderQuery(
    message: string,
    history: Message[],
    userId: string
) {
    const contextMessages = history.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
    }));

    const enhancedMessage = `User ID: ${userId}\n\nUser message: ${message}`;

    return streamText({
        model: groq('llama-3.3-70b-versatile'),
        system: orderSystemPrompt,
        messages: [
            ...contextMessages,
            { role: 'user', content: enhancedMessage }
        ],
        tools: orderTools,
        maxSteps: 5
    });
}
