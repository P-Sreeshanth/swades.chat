import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export const supportTools = {
    queryHistory: tool({
        description: 'Search through support knowledge base and FAQ for answers to common questions',
        parameters: z.object({
            query: z.string().describe('The search query to find relevant support articles'),
            category: z.enum(['account', 'password', 'shipping', 'returns', 'general']).optional()
        }),
        execute: async ({ query, category }) => {
            const faqDatabase = [
                {
                    category: 'password',
                    question: 'How do I reset my password?',
                    answer: 'To reset your password: 1) Click "Forgot Password" on the login page, 2) Enter your email address, 3) Check your inbox for a reset link, 4) Click the link and create a new password. The link expires in 24 hours.'
                },
                {
                    category: 'account',
                    question: 'How do I update my email address?',
                    answer: 'Go to Account Settings > Profile > Email. Enter your new email and verify it through the confirmation link sent to both old and new addresses.'
                },
                {
                    category: 'shipping',
                    question: 'What are the shipping options?',
                    answer: 'We offer: Standard (5-7 days, free over $50), Express (2-3 days, $9.99), and Next Day ($19.99). All orders include tracking.'
                },
                {
                    category: 'returns',
                    question: 'What is your return policy?',
                    answer: 'We accept returns within 30 days of delivery. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive the return.'
                },
                {
                    category: 'account',
                    question: 'How do I delete my account?',
                    answer: 'Go to Account Settings > Privacy > Delete Account. You will need to confirm your password. Note: This action is irreversible and all data will be permanently deleted after 30 days.'
                },
                {
                    category: 'general',
                    question: 'How do I contact customer support?',
                    answer: 'You can reach us through: 1) This chat support 24/7, 2) Email at support@example.com (response within 24h), 3) Phone 1-800-SUPPORT (Mon-Fri 9am-6pm EST).'
                }
            ];

            const queryLower = query.toLowerCase();
            const results = faqDatabase.filter(item => {
                const matchesCategory = !category || item.category === category;
                const matchesQuery = item.question.toLowerCase().includes(queryLower) ||
                    item.answer.toLowerCase().includes(queryLower) ||
                    queryLower.includes(item.category);
                return matchesCategory && matchesQuery;
            });

            if (results.length === 0) {
                return {
                    found: false,
                    message: 'No matching FAQ found. I can try to help you directly or connect you with a human agent.'
                };
            }

            return {
                found: true,
                results: results.slice(0, 3)
            };
        }
    }),

    createTicket: tool({
        description: 'Create a support ticket for issues that need human follow-up',
        parameters: z.object({
            subject: z.string().describe('Brief description of the issue'),
            priority: z.enum(['low', 'medium', 'high']).describe('Priority level of the ticket'),
            details: z.string().describe('Detailed description of the issue')
        }),
        execute: async ({ subject, priority, details }) => {
            const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
            return {
                success: true,
                ticketId,
                message: `Support ticket ${ticketId} created with ${priority} priority. A human agent will respond within ${priority === 'high' ? '2 hours' : priority === 'medium' ? '24 hours' : '48 hours'}.`
            };
        }
    })
};
