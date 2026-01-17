import {
    routeMessage,
    handleSupportQuery,
    handleOrderQuery,
    handleBillingQuery
} from '../agents/index.js';
import { conversationService } from './conversation.js';
import type { Message } from '@repo/types';

export class AgentService {
    async processMessage(message: string, history: Message[], userId: string) {
        const routingResult = await routeMessage(message, history);

        let agentStream;
        switch (routingResult.agent) {
            case 'support':
                agentStream = await handleSupportQuery(message, history);
                break;
            case 'order':
                agentStream = await handleOrderQuery(message, history, userId);
                break;
            case 'billing':
                agentStream = await handleBillingQuery(message, history, userId);
                break;
        }

        return {
            stream: agentStream,
            agentType: routingResult.agent,
            reasoning: routingResult.reasoning
        };
    }

    getAgentRegistry() {
        return [
            {
                type: 'router',
                name: 'Router Agent',
                description: 'Analyzes user intent and routes to specialized agents',
                status: 'online' as const,
                capabilities: ['intent_classification', 'context_analysis', 'agent_delegation']
            },
            {
                type: 'support',
                name: 'Support Agent',
                description: 'Handles general inquiries, FAQ, and account issues',
                status: 'online' as const,
                capabilities: ['faq_lookup', 'ticket_creation', 'account_assistance', 'troubleshooting']
            },
            {
                type: 'order',
                name: 'Order Agent',
                description: 'Manages order status, tracking, and delivery inquiries',
                status: 'online' as const,
                capabilities: ['order_lookup', 'delivery_tracking', 'order_history', 'shipping_info']
            },
            {
                type: 'billing',
                name: 'Billing Agent',
                description: 'Handles invoices, payments, and refund requests',
                status: 'online' as const,
                capabilities: ['invoice_lookup', 'refund_processing', 'payment_status', 'billing_disputes']
            }
        ];
    }

    getAgentCapabilities(type: string) {
        const agent = this.getAgentRegistry().find(a => a.type === type);
        if (!agent) return null;

        const descriptions: Record<string, string> = {
            intent_classification: 'Analyzes user messages to determine the primary intent',
            context_analysis: 'Examines conversation history for relevant context',
            agent_delegation: 'Routes requests to the most appropriate specialized agent',
            faq_lookup: 'Searches knowledge base for relevant answers',
            ticket_creation: 'Creates support tickets for human follow-up',
            account_assistance: 'Helps with account-related issues and settings',
            troubleshooting: 'Guides users through common problem solutions',
            order_lookup: 'Retrieves detailed order information',
            delivery_tracking: 'Provides real-time delivery status updates',
            order_history: 'Lists past orders and their details',
            shipping_info: 'Explains shipping options and timelines',
            invoice_lookup: 'Retrieves invoice details and payment history',
            refund_processing: 'Initiates and tracks refund requests',
            payment_status: 'Checks current payment and billing status',
            billing_disputes: 'Handles billing-related complaints and corrections'
        };

        return {
            type: agent.type,
            name: agent.name,
            description: agent.description,
            capabilities: agent.capabilities.map(cap => ({
                id: cap,
                name: cap.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                description: descriptions[cap] || 'No description available'
            }))
        };
    }
}

export const agentService = new AgentService();
