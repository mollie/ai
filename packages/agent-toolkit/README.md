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
  model: openai("gpt-4o"), // any AI SDK model provider works here
  tools: toVercelAITools(toolkit),
  prompt: "List my last 5 payments",
});

console.log(text);
```

The `model` is yours to choose – the toolkit does not depend on any particular
provider or model. Swap in a different AI SDK provider as needed.

## OpenAI (function calling)

```typescript
import OpenAI from "openai";
import { MollieAgentToolkit } from "@mollie/agent-toolkit";
import { toOpenAITools, executeOpenAIToolCall } from "@mollie/agent-toolkit/openai";

const client = new OpenAI();
const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  tools: ["list_payments", "get_payment"],
});

const messages = [{ role: "user", content: "List my last 5 payments" }];

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages,
  tools: toOpenAITools(toolkit),
});

const message = response.choices[0].message;

if (message.tool_calls) {
  messages.push(message);
  for (const toolCall of message.tool_calls) {
    const result = await executeOpenAIToolCall(toolkit, toolCall);
    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(result),
    });
  }

  // Send the tool results back to the model for a final answer.
  const followUp = await client.chat.completions.create({
    model: "gpt-4o",
    messages,
  });
  console.log(followUp.choices[0].message.content);
}
```

The same pattern applies to the Responses API – pass `toOpenAITools(toolkit)`
as the tool list and route tool calls through `executeOpenAIToolCall`.

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

const llm = new ChatOpenAI({ model: "gpt-4o" });
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

| Tool | Type | Description |
|---|---|---|
| `list_payments` | Read | List recent payments |
| `get_payment` | Read | Get a payment by ID |
| `create_payment` | **Write – moves money** | Create a new payment |
| `list_refunds` | Read | List refunds |
| `create_refund` | **Write – moves money** | Refund a payment |
| `list_customers` | Read | List customers |
| `get_customer` | Read | Get a customer by ID |
| `create_customer` | Write | Create a customer |
| `list_balances` | Read | List account balances |
| `get_balance` | Read | Get a balance by ID |

Read tools are safe to expose broadly. Treat every Write tool as privileged,
and the two money-moving tools as requiring explicit authorization.

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
