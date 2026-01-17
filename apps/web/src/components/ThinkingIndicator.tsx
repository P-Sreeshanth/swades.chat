interface ThinkingIndicatorProps {
    agent: string | null;
    isRouting?: boolean;
}

const agentLabels: Record<string, string> = {
    support: 'Support Agent',
    order: 'Order Agent',
    billing: 'Billing Agent',
    router: 'Router'
};

export function ThinkingIndicator({ agent, isRouting }: ThinkingIndicatorProps) {
    return (
        <div className="py-6 bg-[#2a2a2a]">
            <div className="max-w-3xl mx-auto px-4 flex gap-4">
                <div className="w-8 h-8 rounded-sm flex-shrink-0 flex items-center justify-center bg-[#10a37f]">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-100">swades.chat</span>
                        {agent && (
                            <span className="text-xs text-gray-500">
                                via {agentLabels[agent]}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <span className="italic">
                            {isRouting ? 'Thinking...' : 'Thinking...'}
                        </span>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
