import { useEffect, useState } from 'react';
import { getAgents, AgentInfo } from '../lib/api';

export function AgentStatus() {
    const [agents, setAgents] = useState<AgentInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAgents()
            .then(setAgents)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const agentIcons: Record<string, string> = {
        router: '🧭',
        support: '💬',
        order: '📦',
        billing: '💳'
    };

    const agentGradients: Record<string, string> = {
        router: 'from-violet-500/20 to-purple-500/20',
        support: 'from-emerald-500/20 to-teal-500/20',
        order: 'from-amber-500/20 to-orange-500/20',
        billing: 'from-sky-500/20 to-blue-500/20'
    };

    if (isLoading) {
        return (
            <div className="glass rounded-xl p-4">
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 bg-dark-700/50 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl p-4 glow">
            <h3 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">
                Active Agents
            </h3>
            <div className="space-y-2">
                {agents.map(agent => (
                    <div
                        key={agent.type}
                        className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${agentGradients[agent.type]} border border-dark-600/30 transition-all hover:scale-[1.02]`}
                    >
                        <span className="text-xl">{agentIcons[agent.type]}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-100 truncate">{agent.name}</p>
                            <p className="text-xs text-dark-400 truncate">{agent.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-emerald-400 animate-pulse-slow' : 'bg-dark-500'}`} />
                            <span className="text-xs text-dark-400 capitalize">{agent.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
