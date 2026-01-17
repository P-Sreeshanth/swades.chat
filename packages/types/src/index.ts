export type AgentType = 'router' | 'support' | 'order' | 'billing';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  agentType?: AgentType;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
}

export interface Order {
  id: string;
  status: 'shipped' | 'processing' | 'cancelled' | 'delivered';
  items: OrderItem[];
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: Date;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'refunded';
  orderId: string;
  dueDate?: string;
}

export interface AgentInfo {
  type: AgentType;
  name: string;
  description: string;
  status: 'online' | 'offline';
  capabilities: string[];
}

export interface ChatRequest {
  conversationId?: string;
  message: string;
  userId: string;
}

export interface StreamData {
  agentType?: AgentType;
  thinking?: boolean;
  routerDecision?: string;
}
