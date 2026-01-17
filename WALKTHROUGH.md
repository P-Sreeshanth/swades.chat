# Code Walkthrough Guide

This guide explains the architecture, key decisions, and implementation details so you can confidently walk through the codebase.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐               │
│  │ useChat  │──│ API lib  │──│ SSE Stream  │               │
│  └──────────┘  └──────────┘  └─────────────┘               │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/SSE
┌───────────────────────▼─────────────────────────────────────┐
│                       BACKEND (Hono)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Router Agent                         │ │
│  │    Uses generateObject() to classify user intent       │ │
│  └─────────────┬──────────────┬───────────────┬───────────┘ │
│                │              │               │             │
│    ┌───────────▼───┐ ┌───────▼───────┐ ┌─────▼──────────┐  │
│    │Support Agent  │ │ Order Agent   │ │ Billing Agent  │  │
│    │streamText()   │ │ streamText()  │ │ streamText()   │  │
│    └───────┬───────┘ └───────┬───────┘ └───────┬────────┘  │
│            │                 │                 │            │
│    ┌───────▼─────────────────▼─────────────────▼───────────┐│
│    │                      TOOLS                             ││
│    │  queryHistory | fetchOrder | trackDelivery | getInvoice││
│    └───────────────────────────┬────────────────────────────┘│
└────────────────────────────────┼─────────────────────────────┘
                                 │ Prisma
                    ┌────────────▼────────────┐
                    │      Supabase (PG)      │
                    │ Conversation | Message  │
                    │ Order | Invoice         │
                    └─────────────────────────┘
```

---

## Key Design Decisions

### 1. Why Turborepo Monorepo?

```
ai-support-center/
├── apps/
│   ├── api/     # Hono backend
│   └── web/     # React frontend
└── packages/
    └── types/   # Shared TypeScript types
```

**Rationale:**
- **Code sharing**: The `@repo/types` package lets both frontend and backend use the same type definitions
- **Parallel development**: Turbo runs both dev servers concurrently
- **Atomic changes**: A single PR can update types + backend + frontend together

### 2. Why Hono over Express?

Hono was chosen for:
- **Edge-first**: Works in Node, Bun, Cloudflare Workers
- **Type-safe RPC**: Can export `AppType` for frontend autocomplete
- **Streaming-friendly**: Native SSE support via `stream()` helper
- **Zod integration**: `@hono/zod-validator` for request validation

### 3. Multi-Agent Pattern

The system uses a **hierarchical routing pattern**:

```typescript
// Router decides which specialist handles the request
const routingResult = await routeMessage(message, history);

// Delegate to specialized agent
switch (routingResult.agent) {
  case 'support': return handleSupportQuery(message, history);
  case 'order':   return handleOrderQuery(message, history, userId);
  case 'billing': return handleBillingQuery(message, history, userId);
}
```

**Why this pattern?**
- **Separation of concerns**: Each agent has focused expertise
- **Different toolsets**: Order agent uses fetchOrder, Billing uses getInvoice
- **Scalability**: Add new agents without modifying existing ones

---

## Core Implementation Walkthrough

### 1. Router Agent (`apps/api/src/agents/router.ts`)

```typescript
export async function routeMessage(message, history) {
  const result = await generateObject({
    model: groq('llama-3.3-70b-versatile'),
    system: routerSystemPrompt,
    messages: [...history, { role: 'user', content: message }],
    schema: z.object({
      agent: z.enum(['support', 'order', 'billing']),
      reasoning: z.string()
    })
  });
  return result.object;
}
```

**Key points:**
- Uses `generateObject()` (not `streamText`) because we need structured output
- The Zod schema forces the LLM to return valid JSON with `agent` and `reasoning`
- Includes conversation history for context-aware routing

### 2. Specialized Agents (`apps/api/src/agents/order.ts`)

```typescript
export async function handleOrderQuery(message, history, userId) {
  return streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: orderSystemPrompt,
    messages: [...history, { role: 'user', content: enhancedMessage }],
    tools: orderTools,  // fetchOrder, trackDelivery, listOrders
    maxSteps: 5         // Allow multiple tool calls
  });
}
```

**Key points:**
- Uses `streamText()` for real-time token streaming
- `tools` object contains Zod-validated function definitions
- `maxSteps: 5` allows the agent to call tools multiple times (e.g., fetch order, then track delivery)

### 3. Tool Definition (`apps/api/src/tools/order.ts`)

```typescript
export const orderTools = {
  fetchOrder: tool({
    description: 'Fetch order details by order ID',
    parameters: z.object({
      orderId: z.string().describe('The order ID (e.g., ORD-001)')
    }),
    execute: async ({ orderId }) => {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      return order ? { found: true, order } : { found: false, message: '...' };
    }
  })
};
```

**Key points:**
- Tools are Zod-validated, so the LLM can only call them with valid parameters
- `execute` function runs server-side, queries real database
- Return structured data that the LLM incorporates into its response

### 4. Streaming Response (`apps/api/src/routes/chat.ts`)

```typescript
return stream(c, async (streamWriter) => {
  const agentStream = await handleOrderQuery(message, history, userId);
  
  for await (const chunk of agentStream.textStream) {
    fullResponse += chunk;
    await streamWriter.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
  }
  
  // Save to DB after streaming completes
  await prisma.message.create({ data: { content: fullResponse, ... } });
});
```

**Key points:**
- Uses Server-Sent Events (SSE) format: `data: {...}\n\n`
- Accumulates `fullResponse` while streaming for database persistence
- Custom headers expose routing metadata: `X-Agent-Type`, `X-Router-Reasoning`

### 5. Frontend Hook (`apps/web/src/hooks/useChat.ts`)

```typescript
const result = await sendMessage(message, conversationId, (chunk, metadata) => {
  streamingContentRef.current += chunk;
  setMessages(prev => {
    const updated = [...prev];
    updated[updated.length - 1] = {
      ...updated[updated.length - 1],
      content: streamingContentRef.current
    };
    return updated;
  });
});
```

**Key points:**
- Uses `useRef` for streaming content to avoid render loops
- Updates the last message in-place as chunks arrive
- Metadata (agent type, reasoning) extracted from response headers

---

## Database Schema Rationale

```prisma
model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(...)
  role           String       // 'user' | 'assistant'
  content        String
  agentType      String?      // Which agent handled this
  createdAt      DateTime     @default(now())
  @@index([conversationId])   // Fast conversation lookups
}
```

**Why store `agentType`?**
- Enables analytics on which agents handle which queries
- Allows showing agent badges in the UI
- Useful for debugging misrouted requests

---

## Questions You Might Be Asked

**Q: Why not use OpenAI?**
A: Groq was chosen for faster inference (100+ tokens/sec) and cost efficiency. The architecture is model-agnostic via the AI SDK.

**Q: How does the router know which agent to pick?**
A: The system prompt describes each agent's capabilities. The LLM analyzes the message + history and returns a structured decision.

**Q: What happens if a tool fails?**
A: Tools return `{ found: false, message: '...' }` and the LLM incorporates that into its response, often asking for clarification.

**Q: How do you prevent infinite loops with `maxSteps`?**
A: `maxSteps: 5` limits tool calls. The LLM typically needs 1-2 calls, so 5 provides safety margin without risk.

**Q: Why SSE over WebSockets?**
A: SSE is simpler for unidirectional streaming, works through proxies, and doesn't require connection management.
