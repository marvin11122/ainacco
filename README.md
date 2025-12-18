# ainacco – Codex (o3/o4) integration scaffold

This repository provides a minimal TypeScript scaffold for wiring OpenAI Codex models (o3 / o4) into an Electron/Monaco-style environment. It includes:

- A strongly typed OpenAI client wrapper with streaming and one-off completion helpers.
- A Monaco inline completion provider hook for ghost-text suggestions.
- Build tooling via TypeScript only (no bundler required for the scaffold).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   export OPENAI_API_KEY="sk-..."
   # Optional overrides
   export OPENAI_MODEL="o4"
   export OPENAI_BASE_URL="https://api.openai.com/v1"
   ```

3. Run a type check build:
   ```bash
   npm run build
   ```

## Files

- `src/config.ts` – environment configuration and model hints.
- `src/agent.ts` – `CompletionAgent` with streaming and single-shot chat completion helpers.
- `src/inlineCompletion.ts` – Monaco inline completion provider registration.

## Usage examples

### Streaming completion (terminal/agent loop)
```ts
import { CompletionAgent } from "./dist/agent";

const agent = new CompletionAgent();

agent.on("token", ({ token }) => process.stdout.write(token));
agent.on("done", () => process.stdout.write("\n"));
agent.on("error", ({ message }) => console.error("Error:", message));

agent.streamCompletion({
  requestId: "demo",
  messages: [
    { role: "system", content: "You are a CLI coding assistant." },
    { role: "user", content: "Write a bash for-loop that prints 1..3" }
  ]
});
```

### Inline Monaco completions
```ts
import * as monaco from "monaco-editor";
import { CompletionAgent } from "./dist/agent";
import { registerInlineCompletions } from "./dist/inlineCompletion";

const agent = new CompletionAgent();
registerInlineCompletions("shell", agent, {
  systemPrompt: "You suggest concise shell commands.",
  model: "o4",
  temperature: 0.15
});
```

## Notes

- Keep the OpenAI API key out of renderer code; instantiate `CompletionAgent` in a trusted process and bridge via IPC if you embed this into Electron.
- `OPENAI_MODEL` defaults to `o4`; set `OPENAI_MODEL=o3` to pin the lighter model.
- The scaffold focuses on the LLM integration surface; UI shells (Electron, React, block terminal) can be layered on top.
