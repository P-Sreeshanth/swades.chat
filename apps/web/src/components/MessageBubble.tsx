import type { Message } from '../lib/api';

interface MessageBubbleProps {
    message: Message;
}

const agentLabels: Record<string, string> = {
    support: 'Support Agent',
    order: 'Order Agent',
    billing: 'Billing Agent',
    router: 'Router'
};

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`py-6 ${isUser ? 'bg-transparent' : 'bg-[#2a2a2a]'}`}>
            <div className="max-w-3xl mx-auto px-4 flex gap-4">
                <div className={`w-8 h-8 rounded-sm flex-shrink-0 flex items-center justify-center ${isUser
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        : 'bg-[#10a37f]'
                    }`}>
                    {isUser ? (
                        <span className="text-white text-sm font-bold">U</span>
                    ) : (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-100">
                            {isUser ? 'You' : 'swades.chat'}
                        </span>
                        {!isUser && message.agentType && (
                            <span className="text-xs text-gray-500">
                                via {agentLabels[message.agentType]}
                            </span>
                        )}
                    </div>
                    <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {message.content}
                    </div>
                </div>
            </div>
        </div>
    );
}
