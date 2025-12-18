import EventEmitter from "events";
import OpenAI from "openai";
import { assertApiKey, OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL } from "./config";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CompletionRequest = {
  requestId: string;
  messages: ChatMessage[];
  temperature?: number;
  model?: string;
};

export type TokenEvent = { type: "token"; requestId: string; token: string };
export type DoneEvent = { type: "done"; requestId: string };
export type ErrorEvent = { type: "error"; requestId: string; message: string };

export type CompletionEvent = TokenEvent | DoneEvent | ErrorEvent;

/**
 * CompletionAgent centralizes OpenAI (o3 / o4) access for both streaming and single-shot calls.
 * It is designed to run in a secure process (main/worker) and surface events via an EventEmitter.
 */
export class CompletionAgent extends EventEmitter {
  private client: OpenAI;

  constructor() {
    super();
    assertApiKey();
    this.client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      baseURL: OPENAI_BASE_URL
    });
  }

  /**
   * Stream a chat completion. Emits "token", then a final "done" or "error".
   */
  async streamCompletion(request: CompletionRequest): Promise<void> {
    const { requestId, messages, temperature = 0.2, model = OPENAI_MODEL } = request;
    try {
      const stream = await this.client.chat.completions.create({
        model,
        temperature,
        messages,
        stream: true
      });

      for await (const chunk of stream) {
        const token = chunk.choices?.[0]?.delta?.content;
        if (token) {
          this.emit("token", { type: "token", requestId, token } satisfies TokenEvent);
        }
      }

      this.emit("done", { type: "done", requestId } satisfies DoneEvent);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.emit("error", { type: "error", requestId, message } satisfies ErrorEvent);
    }
  }

  /**
   * One-off completion helper used for inline Monaco ghost text or quick replies.
   */
  async completeOnce(prompt: string, opts?: { temperature?: number; model?: string; systemPrompt?: string }): Promise<string> {
    const messages: ChatMessage[] = [];
    if (opts?.systemPrompt) {
      messages.push({ role: "system", content: opts.systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await this.client.chat.completions.create({
      model: opts?.model ?? OPENAI_MODEL,
      temperature: opts?.temperature ?? 0.2,
      messages,
      stream: false
    });

    return response.choices?.[0]?.message?.content?.trim() ?? "";
  }
}
