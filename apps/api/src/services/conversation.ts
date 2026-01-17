import { prisma } from '../lib/prisma.js';
import type { Message } from '@repo/types';

export class ConversationService {
    async getOrCreateConversation(conversationId: string | undefined, userId: string) {
        if (conversationId) {
            const existing = await prisma.conversation.findUnique({
                where: { id: conversationId },
                include: { messages: { orderBy: { createdAt: 'asc' } } }
            });
            if (existing) return existing;
        }

        return prisma.conversation.create({
            data: { userId },
            include: { messages: true }
        });
    }

    async addMessage(conversationId: string, data: {
        role: string;
        content: string;
        agentType?: string;
    }) {
        return prisma.message.create({
            data: {
                conversationId,
                role: data.role,
                content: data.content,
                agentType: data.agentType
            }
        });
    }

    async getConversation(id: string) {
        return prisma.conversation.findUnique({
            where: { id },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });
    }

    async listConversations(userId: string) {
        return prisma.conversation.findMany({
            where: { userId },
            include: {
                messages: { take: 1, orderBy: { createdAt: 'desc' } }
            },
            orderBy: { updatedAt: 'desc' },
            take: 20
        });
    }

    async deleteConversation(id: string) {
        return prisma.conversation.delete({ where: { id } });
    }

    formatHistory(messages: { id: string; conversationId: string; role: string; content: string; agentType: string | null; createdAt: Date }[]): Message[] {
        return messages.map(m => ({
            id: m.id,
            conversationId: m.conversationId,
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
            agentType: m.agentType as Message['agentType'],
            createdAt: m.createdAt
        }));
    }
}

export const conversationService = new ConversationService();
