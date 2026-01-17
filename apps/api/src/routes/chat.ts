import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { stream } from 'hono/streaming';
import { conversationService, agentService, compactHistory } from '../services/index.js';
import { AppError } from '../middleware/index.js';

const chat = new Hono();

const messageSchema = z.object({
    conversationId: z.string().optional(),
    message: z.string().min(1),
    userId: z.string().default('user-demo')
});

chat.post('/messages', zValidator('json', messageSchema), async (c) => {
    const { conversationId, message, userId } = c.req.valid('json');

    const conversation = await conversationService.getOrCreateConversation(conversationId, userId);

    await conversationService.addMessage(conversation.id, {
        role: 'user',
        content: message
    });

    const rawHistory = conversationService.formatHistory(conversation.messages);

    // Apply context compaction to prevent token overflow
    const history = compactHistory(rawHistory);

    const { stream: agentStream, agentType, reasoning } = await agentService.processMessage(
        message,
        history,
        userId
    );

    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    c.header('X-Conversation-Id', conversation.id);
    c.header('X-Agent-Type', agentType);
    c.header('X-Router-Reasoning', encodeURIComponent(reasoning));

    return stream(c, async (streamWriter) => {
        let fullResponse = '';

        for await (const chunk of agentStream.textStream) {
            fullResponse += chunk;
            await streamWriter.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
        }

        await conversationService.addMessage(conversation.id, {
            role: 'assistant',
            content: fullResponse,
            agentType
        });

        await streamWriter.write(`data: ${JSON.stringify({ type: 'done', conversationId: conversation.id })}\n\n`);
    });
});

chat.get('/conversations/:id', async (c) => {
    const id = c.req.param('id');
    const conversation = await conversationService.getConversation(id);

    if (!conversation) {
        throw new AppError(404, 'Conversation not found', 'NOT_FOUND');
    }

    return c.json(conversation);
});

chat.delete('/conversations/:id', async (c) => {
    const id = c.req.param('id');

    try {
        await conversationService.deleteConversation(id);
        return c.json({ success: true });
    } catch {
        throw new AppError(404, 'Conversation not found', 'NOT_FOUND');
    }
});

chat.get('/conversations', async (c) => {
    const userId = c.req.query('userId') || 'user-demo';
    const conversations = await conversationService.listConversations(userId);
    return c.json(conversations);
});

export { chat };
