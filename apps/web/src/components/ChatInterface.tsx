import { useState, useRef, useEffect, FormEvent } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { ThinkingIndicator } from './ThinkingIndicator';

interface ChatInterfaceProps {
    onAgentChange?: (agent: string | null) => void;
}

export function ChatInterface({ onAgentChange }: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const [showReasoning, setShowReasoning] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isLoading,
        isStreaming,
        currentAgent,
        routerReasoning,
        sendUserMessage,
        clearMessages,
        stopGeneration
    } = useChat({
        onError: (error) => console.error('Chat error:', error)
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        onAgentChange?.(currentAgent);
    }, [currentAgent, onAgentChange]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const message = input.trim();
        setInput('');
        await sendUserMessage(message);
    };

    const suggestedQueries = [
        "Where is my order #ORD-001?",
        "I was charged twice",
        "How do I reset my password?",
        "Show me my invoices"
    ];

    const displayMessages = messages.filter(m => m.role === 'user' || m.content.length > 0);

    return (
        <div className="flex flex-col h-full bg-[#212121]">
            <header className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-gray-200 font-medium">swades.chat</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowReasoning(!showReasoning)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${showReasoning
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-400 hover:bg-[#2a2a2a]'
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${showReasoning ? 'bg-white' : 'bg-orange-500'}`} />
                        Reasoning
                    </button>
                    {messages.length > 0 && (
                        <button
                            onClick={clearMessages}
                            className="px-3 py-1.5 text-sm text-gray-400 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-4">
                        <h1 className="text-3xl font-semibold text-gray-100 mb-10">
                            How can I help you today?
                        </h1>

                        <div className="w-full max-w-2xl mb-8">
                            <form onSubmit={handleSubmit}>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask anything"
                                        className="w-full px-4 pr-14 py-4 bg-[#2a2a2a] border border-gray-600 rounded-full text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-500"
                                    />
                                    <div className="absolute right-3">
                                        <button
                                            type="submit"
                                            disabled={!input.trim()}
                                            className="p-2 bg-white text-black rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-w-2xl w-full">
                            {suggestedQueries.map((query, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(query)}
                                    className="px-4 py-3 text-sm text-left text-gray-300 bg-[#2a2a2a] border border-gray-600 rounded-xl hover:bg-[#333] hover:border-gray-500 transition-all"
                                >
                                    {query}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {displayMessages.map(message => (
                            <MessageBubble key={message.id} message={message} />
                        ))}

                        {isLoading && (
                            <ThinkingIndicator agent={currentAgent} isRouting={!isStreaming} />
                        )}

                        {showReasoning && routerReasoning && (
                            <div className="py-4 px-4">
                                <div className="max-w-3xl mx-auto bg-orange-900/30 border border-orange-700 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-orange-400 font-medium">🧠 Router Reasoning</span>
                                    </div>
                                    <p className="text-orange-200 text-sm">{routerReasoning}</p>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {messages.length > 0 && (
                <div className="p-4">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit}>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything"
                                    disabled={isLoading}
                                    className="w-full px-4 pr-14 py-4 bg-[#2a2a2a] border border-gray-600 rounded-full text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-500 disabled:opacity-50"
                                />
                                <div className="absolute right-3">
                                    {isLoading ? (
                                        <button
                                            type="button"
                                            onClick={stopGeneration}
                                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <rect x="6" y="6" width="12" height="12" rx="1" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={!input.trim()}
                                            className="p-2 bg-white text-black rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
