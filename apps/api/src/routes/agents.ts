import { Hono } from 'hono';
import { agentService } from '../services/index.js';
import { AppError } from '../middleware/index.js';

const agents = new Hono();

agents.get('/', (c) => {
    return c.json(agentService.getAgentRegistry());
});

agents.get('/:type/capabilities', (c) => {
    const type = c.req.param('type');
    const capabilities = agentService.getAgentCapabilities(type);

    if (!capabilities) {
        throw new AppError(404, 'Agent not found', 'NOT_FOUND');
    }

    return c.json(capabilities);
});

export { agents };
