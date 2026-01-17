import { useState, useCallback, useRef } from 'react';
import { sendMessage, Message } from '../lib/api';

interface UseChatOptions {
    onError?: (error: Error) => void;
}

interface UseChatResult {
    messages: Message[];
    isLoading: boolean;
    isStreaming: boolean;
    currentAgent: string | null;
    routerReasoning: string | null;
    conversationId: string | null;
    sendUserMessage: (message: string) => Promise<void>;
    clearMessages: () => void;
    setConversationId: (id: string | null) => void;
    stopGeneration: () => void;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useChat(options: UseChatOptions = {}): UseChatResult {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentAgent, setCurrentAgent] = useState<string | null>(null);
    const [routerReasoning, setRouterReasoning] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const streamingContentRef = useRef('');
    const abortControllerRef = useRef<AbortController | null>(null);

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsLoading(false);
        setIsStreaming(false);
    }, []);

    const sendUserMessage = useCallback(async (message: string) => {
        const userMessage: Message = {
            id: `temp-${Date.now()}`,
            conversationId: conversationId || '',
            role: 'user',
            content: message,
            createdAt: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setCurrentAgent(null);
        setRouterReasoning(null);
        streamingContentRef.current = '';

        abortControllerRef.current = new AbortController();

        try {
            const assistantMessage: Message = {
                id: `temp-assistant-${Date.now()}`,
                conversationId: conversationId || '',
                role: 'assistant',
                content: '',
                createdAt: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsStreaming(true);

            const result = await sendMessage(
                message,
                conversationId || undefined,
                (chunk, metadata) => {
                    streamingContentRef.current += chunk;
                    setCurrentAgent(metadata.agentType || null);
                    if (metadata.reasoning) {
                        setRouterReasoning(metadata.reasoning);
                    }
                    setMessages(prev => {
                        const updated = [...prev];
                        const lastMessage = updated[updated.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant') {
                            updated[updated.length - 1] = {
                                ...lastMessage,
                                content: streamingContentRef.current,
                                agentType: metadata.agentType as Message['agentType']
                            };
                        }
                        return updated;
                    });
                },
                abortControllerRef.current.signal
            );

            setConversationId(result.conversationId);
            setCurrentAgent(result.agentType);
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                return;
            }
            options.onError?.(error as Error);
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    }, [conversationId, options]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setConversationId(null);
        setCurrentAgent(null);
        setRouterReasoning(null);
    }, []);

    return {
        messages,
        isLoading,
        isStreaming,
        currentAgent,
        routerReasoning,
        conversationId,
        sendUserMessage,
        clearMessages,
        setConversationId,
        stopGeneration,
        setMessages
    };
}
