import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';

const health = new Hono();

health.get('/', async (c) => {
    const checks = {
        api: 'ok',
        database: 'unknown',
        timestamp: new Date().toISOString()
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        checks.database = 'ok';
    } catch {
        checks.database = 'error';
    }

    const allHealthy = checks.api === 'ok' && checks.database === 'ok';

    return c.json({
        status: allHealthy ? 'healthy' : 'degraded',
        checks
    }, allHealthy ? 200 : 503);
});

export { health };
