import { useEffect, useState } from 'react';
import { getAgents, AgentInfo } from '../lib/api';

interface SidebarProps {
    activeAgent?: string | null;
}

export function Sidebar({ activeAgent }: SidebarProps) {
    const [agents, setAgents] = useState<AgentInfo[]>([]);

    useEffect(() => {
        getAgents().then(setAgents).catch(console.error);
    }, []);

    const getStatusColor = (type: string) => {
        if (activeAgent === type) return 'bg-green-500';
        return 'bg-gray-600';
    };

    return (
        <aside className="w-64 bg-[#171717] flex flex-col h-full">
            <div className="p-3">
                <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    swades.chat
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3">
                <div className="mb-6">
                    <p className="text-xs text-gray-500 px-2 mb-2 uppercase tracking-wider">Agents</p>
                    <div className="space-y-1">
                        {agents.map(agent => (
                            <div key={agent.type} className="flex items-center gap-2 px-2 py-2 text-sm text-gray-300 rounded-lg">
                                <span className={`w-2 h-2 rounded-full ${getStatusColor(agent.type)}`} />
                                <span className="capitalize">{agent.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-3 border-t border-gray-800">
                <div className="flex items-center gap-3 px-2 py-2 text-sm text-gray-300">
                    <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="font-medium">swades.chat</span>
                </div>
            </div>
        </aside>
    );
}
