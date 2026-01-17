import { prisma } from '../lib/prisma.js';

interface WorkflowState {
    conversationId: string;
    userId: string;
    message: string;
    status: 'pending' | 'routing' | 'processing' | 'completed' | 'failed';
    agentType?: string;
    result?: string;
    error?: string;
}

const workflowStore = new Map<string, WorkflowState>();

export async function chatWorkflow(
    workflowId: string,
    conversationId: string,
    userId: string,
    message: string
): Promise<WorkflowState> {
    const state: WorkflowState = {
        conversationId,
        userId,
        message,
        status: 'pending'
    };

    workflowStore.set(workflowId, state);

    try {
        state.status = 'pending';
        await storeMessageStep(conversationId, 'user', message);

        state.status = 'routing';
        workflowStore.set(workflowId, { ...state });

        state.status = 'processing';
        workflowStore.set(workflowId, { ...state });

        state.status = 'completed';
        workflowStore.set(workflowId, state);

        return state;
    } catch (error) {
        state.status = 'failed';
        state.error = (error as Error).message;
        workflowStore.set(workflowId, state);
        throw error;
    }
}

async function storeMessageStep(
    conversationId: string,
    role: string,
    content: string,
    agentType?: string
) {
    return prisma.message.create({
        data: {
            conversationId,
            role,
            content,
            agentType
        }
    });
}

export function getWorkflowStatus(workflowId: string): WorkflowState | undefined {
    return workflowStore.get(workflowId);
}

export function listActiveWorkflows(): Map<string, WorkflowState> {
    return new Map(
        Array.from(workflowStore.entries()).filter(
            ([_, state]) => state.status !== 'completed' && state.status !== 'failed'
        )
    );
}

export function cancelWorkflow(workflowId: string): boolean {
    const state = workflowStore.get(workflowId);
    if (state && state.status !== 'completed') {
        state.status = 'failed';
        state.error = 'Cancelled by user';
        workflowStore.set(workflowId, state);
        return true;
    }
    return false;
}
