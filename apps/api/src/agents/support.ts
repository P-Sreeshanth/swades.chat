import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { supportTools } from '../tools/index.js';
import type { Message } from '@repo/types';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY
});

const supportSystemPrompt = `You are a friendly and helpful customer support agent. Your role is to assist customers with:
- General inquiries and FAQ
- Account-related issues
- Password resets and account access
- How-to questions about using our service
- General troubleshooting

You have access to a knowledge base tool to search for relevant information. Always be polite, empathetic, and solution-oriented. If you cannot resolve an issue, offer to create a support ticket for human follow-up.

Keep responses concise but thorough. Use formatting when helpful.`;

export async function handleSupportQuery(
    message: string,
    history: Message[]
) {
    const contextMessages = history.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
    }));

    return streamText({
        model: groq('llama-3.3-70b-versatile'),
        system: supportSystemPrompt,
        messages: [
            ...contextMessages,
            { role: 'user', content: message }
        ],
        tools: supportTools,
        maxSteps: 3
    });
}
