# @mollie/agent-toolkit

Use Mollie in AI agent frameworks – OpenAI, LangChain, and the Vercel AI SDK.

This package exposes Mollie API operations as tools your agent can call through
function calling. It is framework-agnostic: the same toolkit converts to the
tool format each framework expects.

> **Alpha — under active development.** The public API may change between releases. Pin a version and read the changelog before upgrading.

## ⚠️ This toolkit can move money

Some tools (`create_payment`, `create_refund`) initiate real financial
operations. When an LLM can call them, anything that reaches the prompt –
including untrusted input such as a payment description or a customer email –
can influence what the agent does. Two rules follow:

1. **Default to read-only.** Pass an explicit `tools` allowlist and grant write
   tools only when the workflow needs them. Every example below does this.
2. **Confirm write operations.** Put a human-in-the-loop (or your own
   server-side authorization) in front of any tool that creates a payment or
   refund. Do not let a model trigger these unattended.

## Installation

```bash
npm install @mollie/agent-toolkit
```

### Prerequisites

- Node.js 18+
- Mollie API credentials (see below)
- The agent framework you intend to use (`ai`, `openai`, or `langchain`)

## Authentication

The toolkit reads your credentials from the constructor. Supply them from the
environment – never hardcode them, and never commit them.

```bash
export MOLLIE_API_KEY="test_xxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Mollie credentials are environment-scoped:

- `test_…` – operates against test mode. **Use this while developing.** Tool
  calls have no financial effect.
- `live_…` – operates against your live account. A `create_refund` call with
  live credentials issues a real refund.

Start with `test_` credentials. Switch to `live_` only once you have confirmed
the agent's behavior and have authorization controls around write tools.

## Quickstart (Vercel AI SDK)

Read-only agent – safe to run first:

```typescript
import { MollieAgentToolkit } from "@mollie/agent-toolkit";
import { toVercelAITools } from "@mollie/agent-toolkit/vercel-ai";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Read-only allowlist. Add write tools only when needed.
const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  tools: ["list_payments", "get_payment", "list_balances", "get_balance"],
});

const { text } = await generateText({
  model: openai("gpt-5.5"), // any AI SDK model provider works here
  tools: toVercelAITools(toolkit),
  prompt: "List my last 5 payments",
});

console.log(text);
```

The `model` is yours to choose – the toolkit does not depend on any particular
provider or model. Swap in a different AI SDK provider as needed.

## OpenAI Agents SDK

```typescript
import { Agent, run, tool } from "@openai/agents";
import { MollieAgentToolkit } from "@mollie/agent-toolkit";

const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  tools: ["list_payments", "get_payment"],
});

// MollieTool shape matches the agents SDK tool() signature directly.
const agentTools = toolkit.getTools().map((t) =>
  tool({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
    execute: t.execute,
  }),
);

const agent = new Agent({
  name: "Payments Agent",
  model: "gpt-5.5",
  tools: agentTools,
});

const result = await run(agent, "List my last 5 payments");
console.log(result.finalOutput);
```

If you prefer the lower-level function calling API, use `toOpenAITools` and `executeOpenAIToolCall` from `@mollie/agent-toolkit/openai`.

## LangChain

```typescript
import { MollieAgentToolkit } from "@mollie/agent-toolkit";
import { toLangChainTools } from "@mollie/agent-toolkit/langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  tools: ["list_payments", "get_payment"],
});
const tools = toLangChainTools(toolkit);

const llm = new ChatOpenAI({ model: "gpt-5.5" });
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are an assistant that helps with Mollie payments."],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

const agent = createToolCallingAgent({ llm, tools, prompt });
const executor = new AgentExecutor({ agent, tools });

const result = await executor.invoke({ input: "List my last 5 payments" });
console.log(result.output);
```

## Restricting available tools

The `tools` option controls exactly which operations the agent can call. Pass
the smallest set the task needs. Omitting it exposes every tool, including
write operations – not what you want for most agents.

```typescript
// Read-only reporting agent
const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  tools: ["list_payments", "get_payment", "list_balances", "get_balance"],
});
```

```typescript
// Agent permitted to issue refunds – gate these calls behind confirmation
const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  tools: ["list_payments", "get_payment", "create_refund"],
});
```

## Available tools

### Payments

| Tool | Type | Description |
|---|---|---|
| `list_payments` | Read | List recent payments |
| `get_payment` | Read | Get a payment by ID |
| `create_payment` | **Write – moves money** | Create a new payment |

### Refunds

| Tool | Type | Description |
|---|---|---|
| `list_refunds` | Read | List refunds |
| `create_refund` | **Write – moves money** | Refund a payment |

### Customers

| Tool | Type | Description |
|---|---|---|
| `list_customers` | Read | List customers |
| `get_customer` | Read | Get a customer by ID |
| `create_customer` | Write | Create a customer |

### Balances

| Tool | Type | Description |
|---|---|---|
| `list_balances` | Read | List account balances |
| `get_balance` | Read | Get a balance by ID |

### Settlements

| Tool | Type | Description |
|---|---|---|
| `list_settlements` | Read | List settlements (payouts to your bank account) |
| `get_settlement` | Read | Get a settlement by ID, or use `next`/`open` |

### Payment methods

| Tool | Type | Description |
|---|---|---|
| `list_methods` | Read | List active payment methods, optionally filtered by amount |

### Subscriptions

| Tool | Type | Description |
|---|---|---|
| `list_subscriptions` | Read | List subscriptions for a customer |
| `create_subscription` | Write | Create a recurring subscription for a customer |

### Sales invoices

| Tool | Type | Description |
|---|---|---|
| `list_sales_invoices` | Read | List sales invoices |
| `get_sales_invoice` | Read | Get a sales invoice by ID |
| `create_sales_invoice` | Write | Create a draft, issued, or paid sales invoice |
| `update_sales_invoice` | Write | Update status, lines, recipient, or other invoice fields |

Read tools are safe to expose broadly. Treat every Write tool as privileged,
and the money-moving tools (`create_payment`, `create_refund`) as requiring
explicit authorization before the agent can call them.

## Error handling

Tool calls surface Mollie API errors to the caller: a failed operation rejects
with the underlying error so your agent framework can handle, surface, or retry
it. Validation and authentication failures (for example, wrong-mode credentials)
are reported the same way. Wrap tool execution in your framework's error handling
rather than assuming every call succeeds.

## Links

- [Mollie documentation](https://docs.mollie.com)
- [Mollie API reference](https://docs.mollie.com/reference/overview)
- [GitHub repository](https://github.com/mollie/ai)
- [Report an issue](https://github.com/mollie/ai/issues)

## License

MIT
