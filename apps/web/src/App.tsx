import { useState } from 'react';
import { ChatInterface, Sidebar } from './components';

export default function App() {
    const [activeAgent, setActiveAgent] = useState<string | null>(null);

    return (
        <div className="flex h-screen bg-[#212121]">
            <Sidebar activeAgent={activeAgent} />
            <main className="flex-1">
                <ChatInterface onAgentChange={setActiveAgent} />
            </main>
        </div>
    );
}
