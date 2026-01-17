import { describe, it, expect } from 'vitest';
import { agentService } from './agent.js';

describe('AgentService', () => {
    describe('getAgentRegistry', () => {
        it('should return all four agents', () => {
            const agents = agentService.getAgentRegistry();

            expect(agents).toHaveLength(4);
            expect(agents.map(a => a.type)).toContain('router');
            expect(agents.map(a => a.type)).toContain('support');
            expect(agents.map(a => a.type)).toContain('order');
            expect(agents.map(a => a.type)).toContain('billing');
        });

        it('should have all agents online', () => {
            const agents = agentService.getAgentRegistry();

            agents.forEach(agent => {
                expect(agent.status).toBe('online');
            });
        });

        it('should include capabilities for each agent', () => {
            const agents = agentService.getAgentRegistry();

            agents.forEach(agent => {
                expect(agent.capabilities).toBeDefined();
                expect(agent.capabilities.length).toBeGreaterThan(0);
            });
        });
    });

    describe('getAgentCapabilities', () => {
        it('should return capabilities for valid agent type', () => {
            const capabilities = agentService.getAgentCapabilities('order');

            expect(capabilities).not.toBeNull();
            expect(capabilities?.type).toBe('order');
            expect(capabilities?.capabilities).toBeDefined();
        });

        it('should return null for invalid agent type', () => {
            const capabilities = agentService.getAgentCapabilities('invalid');

            expect(capabilities).toBeNull();
        });

        it('should include detailed capability descriptions', () => {
            const capabilities = agentService.getAgentCapabilities('billing');

            expect(capabilities?.capabilities).toBeDefined();
            capabilities?.capabilities.forEach(cap => {
                expect(cap.id).toBeDefined();
                expect(cap.name).toBeDefined();
                expect(cap.description).toBeDefined();
            });
        });
    });
});
