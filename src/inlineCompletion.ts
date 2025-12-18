import * as monaco from "monaco-editor";
import { CompletionAgent } from "./agent";

type Disposable = monaco.IDisposable;

export type InlineRegistration = {
  dispose(): void;
};

function createGhostInlineItem(text: string, position: monaco.Position): monaco.languages.InlineCompletion {
  return {
    insertText: text,
    range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
    command: undefined
  };
}

/**
 * Register Monaco inline completions backed by the CompletionAgent (o3/o4).
 * Designed for single-line shell or code inputs.
 */
export function registerInlineCompletions(
  languageId: string,
  agent: CompletionAgent,
  options?: { systemPrompt?: string; temperature?: number; model?: string }
): InlineRegistration {
  const disposable: Disposable = monaco.languages.registerInlineCompletionsProvider(languageId, {
    async provideInlineCompletions(model, position) {
      const prefix = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      });

      if (!prefix.trim()) {
        return { items: [], dispose: () => void 0 };
      }

      const suggestion = await agent.completeOnce(prefix, options);

      if (!suggestion) {
        return { items: [], dispose: () => void 0 };
      }

      return {
        items: [createGhostInlineItem(suggestion, position)],
        dispose: () => void 0
      };
    },
    freeInlineCompletions() {
      /* no-op */
    }
  });

  return {
    dispose() {
      disposable.dispose();
    }
  };
}
