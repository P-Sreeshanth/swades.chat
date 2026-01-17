import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { billingTools } from '../tools/index.js';
import type { Message } from '@repo/types';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY
});

const billingSystemPrompt = `You are a billing specialist agent. Your role is to help customers with:
- Invoice inquiries
- Payment status
- Refund requests and status
- Billing disputes
- Charge explanations

You have access to tools to look up invoices, check refund eligibility, and initiate refunds. Always be transparent about billing information. When discussing refunds, clearly explain the process and timeline.

Handle billing disputes with care and empathy. If a customer was incorrectly charged, acknowledge the issue and take immediate action. Always confirm amounts before initiating any financial transactions.`;

export async function handleBillingQuery(
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
        system: billingSystemPrompt,
        messages: [
            ...contextMessages,
            { role: 'user', content: enhancedMessage }
        ],
        tools: billingTools,
        maxSteps: 5
    });
}
