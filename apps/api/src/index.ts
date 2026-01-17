import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { chat, agents, health } from './routes/index.js';
import { errorHandler, rateLimiter, requestLogger } from './middleware/index.js';

const app = new Hono();

app.use('*', requestLogger);
app.use('*', cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-Conversation-Id', 'X-Agent-Type', 'X-Router-Reasoning', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
}));

app.use('/api/chat/*', rateLimiter);

app.get('/', (c) => {
    return c.json({
        name: 'AI Support Center API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            chat: '/api/chat',
            agents: '/api/agents',
            health: '/health'
        }
    });
});

app.route('/api/chat', chat);
app.route('/api/agents', agents);
app.route('/health', health);

app.onError(errorHandler);

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Server starting on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port
});

export type AppType = typeof app;
