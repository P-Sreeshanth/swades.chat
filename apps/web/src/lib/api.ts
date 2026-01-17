const API_BASE = '/api';

export interface Message {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    agentType?: 'router' | 'support' | 'order' | 'billing';
    createdAt: Date;
}

export interface Conversation {
    id: string;
    userId: string;
    messages: Message[];
    createdAt: Date;
}

export interface AgentInfo {
    type: string;
    name: string;
    description: string;
    status: 'online' | 'offline';
    capabilities: string[];
}

export interface StreamEvent {
    type: 'text' | 'done';
    content?: string;
    conversationId?: string;
}

export async function sendMessage(
    message: string,
    conversationId?: string,
    onChunk?: (chunk: string, metadata: { agentType?: string; reasoning?: string }) => void,
    signal?: AbortSignal
): Promise<{ conversationId: string; agentType: string; reasoning: string }> {
    const response = await fetch(`${API_BASE}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationId, userId: 'user-demo' }),
        signal
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    const agentType = response.headers.get('X-Agent-Type') || 'support';
    const reasoning = decodeURIComponent(response.headers.get('X-Router-Reasoning') || '');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let resultConversationId = conversationId || '';

    if (reader) {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value);
            const lines = text.split('\n').filter(line => line.startsWith('data: '));

            for (const line of lines) {
                try {
                    const data: StreamEvent = JSON.parse(line.slice(6));
                    if (data.type === 'text' && data.content) {
                        onChunk?.(data.content, { agentType, reasoning });
                    } else if (data.type === 'done' && data.conversationId) {
                        resultConversationId = data.conversationId;
                    }
                } catch {
                    continue;
                }
            }
        }
    }

    return { conversationId: resultConversationId, agentType, reasoning };
}

export async function getConversation(id: string): Promise<Conversation> {
    const response = await fetch(`${API_BASE}/chat/conversations/${id}`);
    if (!response.ok) throw new Error('Failed to fetch conversation');
    return response.json();
}

export async function getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE}/chat/conversations?userId=user-demo`);
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
}

export async function deleteConversation(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/chat/conversations/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete conversation');
}

export async function getAgents(): Promise<AgentInfo[]> {
    const response = await fetch(`${API_BASE}/agents`);
    if (!response.ok) throw new Error('Failed to fetch agents');
    return response.json();
}
