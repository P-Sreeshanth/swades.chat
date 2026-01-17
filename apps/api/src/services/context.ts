interface Message {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    agentType?: string;
    createdAt: Date;
}

interface CompactionConfig {
    maxMessages: number;
    maxTokensEstimate: number;
    keepRecent: number;
}

const DEFAULT_CONFIG: CompactionConfig = {
    maxMessages: 20,
    maxTokensEstimate: 4000,
    keepRecent: 5
};

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

export function compactHistory(
    messages: Message[],
    config: CompactionConfig = DEFAULT_CONFIG
): Message[] {
    if (messages.length <= config.keepRecent) {
        return messages;
    }

    const totalTokens = messages.reduce(
        (sum, msg) => sum + estimateTokens(msg.content),
        0
    );

    if (messages.length <= config.maxMessages && totalTokens <= config.maxTokensEstimate) {
        return messages;
    }

    const recentMessages = messages.slice(-config.keepRecent);
    const olderMessages = messages.slice(0, -config.keepRecent);

    if (olderMessages.length === 0) {
        return recentMessages;
    }

    const summary = createSummary(olderMessages);

    const summaryMessage: Message = {
        id: 'context-summary',
        conversationId: messages[0]?.conversationId || '',
        role: 'system',
        content: summary,
        createdAt: new Date()
    };

    return [summaryMessage, ...recentMessages];
}

function createSummary(messages: Message[]): string {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    const topics = new Set<string>();
    const orderIds = new Set<string>();
    const invoiceIds = new Set<string>();

    messages.forEach(msg => {
        const orderMatches = msg.content.match(/ORD-\d+/g);
        if (orderMatches) orderMatches.forEach((id: string) => orderIds.add(id));

        const invoiceMatches = msg.content.match(/INV-\d+/g);
        if (invoiceMatches) invoiceMatches.forEach((id: string) => invoiceIds.add(id));

        if (msg.content.toLowerCase().includes('order')) topics.add('orders');
        if (msg.content.toLowerCase().includes('invoice') || msg.content.toLowerCase().includes('billing')) topics.add('billing');
        if (msg.content.toLowerCase().includes('refund')) topics.add('refunds');
        if (msg.content.toLowerCase().includes('password') || msg.content.toLowerCase().includes('account')) topics.add('account');
    });

    let summary = `[CONVERSATION CONTEXT - ${userMessages.length} previous exchanges]\n`;

    if (topics.size > 0) {
        summary += `Topics discussed: ${Array.from(topics).join(', ')}\n`;
    }

    if (orderIds.size > 0) {
        summary += `Orders referenced: ${Array.from(orderIds).join(', ')}\n`;
    }

    if (invoiceIds.size > 0) {
        summary += `Invoices referenced: ${Array.from(invoiceIds).join(', ')}\n`;
    }

    const lastAssistant = assistantMessages[assistantMessages.length - 1];
    if (lastAssistant) {
        const truncated = lastAssistant.content.slice(0, 200);
        summary += `Last response summary: ${truncated}${lastAssistant.content.length > 200 ? '...' : ''}`;
    }

    return summary;
}

export function shouldCompact(messages: Message[], config = DEFAULT_CONFIG): boolean {
    if (messages.length > config.maxMessages) return true;

    const totalTokens = messages.reduce(
        (sum, msg) => sum + estimateTokens(msg.content),
        0
    );

    return totalTokens > config.maxTokensEstimate;
}
