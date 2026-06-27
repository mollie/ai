# @mollie/agent-toolkit

Use Mollie in AI agent frameworks — OpenAI, LangChain, and Vercel AI SDK.

## Installation

```bash
npm install @mollie/agent-toolkit
```

## Usage

### Vercel AI SDK

```typescript
import { MollieAgentToolkit } from "@mollie/agent-toolkit";
import { toVercelAITools } from "@mollie/agent-toolkit/vercel-ai";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const toolkit = new MollieAgentToolkit({ apiKey: process.env.MOLLIE_API_KEY! });

const { text } = await generateText({
  model: openai("gpt-4o"),
  tools: toVercelAITools(toolkit),
  prompt: "List my last 5 payments",
});
```

### OpenAI

```typescript
import { MollieAgentToolkit } from "@mollie/agent-toolkit";
import { toOpenAITools, executeOpenAIToolCall } from "@mollie/agent-toolkit/openai";

const toolkit = new MollieAgentToolkit({ apiKey: process.env.MOLLIE_API_KEY! });
const tools = toOpenAITools(toolkit);

// Pass tools to openai.chat.completions.create({ tools, ... })
// Handle tool calls:
const result = await executeOpenAIToolCall(toolkit, toolCall);
```

### LangChain

```typescript
import { MollieAgentToolkit } from "@mollie/agent-toolkit";
import { toLangChainTools } from "@mollie/agent-toolkit/langchain";

const toolkit = new MollieAgentToolkit({ apiKey: process.env.MOLLIE_API_KEY! });
const tools = toLangChainTools(toolkit);

// Pass tools to createToolCallingAgent({ llm, tools, prompt })
```

## Restrict available tools

Pass a `tools` array to limit what the agent can do — useful for read-only agents:

```typescript
const toolkit = new MollieAgentToolkit({
  apiKey: process.env.MOLLIE_API_KEY!,
  tools: ["list_payments", "get_payment", "list_balances", "get_balance"],
});
```

## Available tools

| Tool | Description |
|---|---|
| `list_payments` | List recent payments |
| `get_payment` | Get a payment by ID |
| `create_payment` | Create a new payment |
| `list_refunds` | List refunds |
| `create_refund` | Refund a payment |
| `list_customers` | List customers |
| `get_customer` | Get a customer by ID |
| `create_customer` | Create a customer |
| `list_balances` | List account balances |
| `get_balance` | Get a balance by ID |

## Links

- [Mollie documentation](https://docs.mollie.com)
- [Mollie API reference](https://docs.mollie.com/reference/overview)
