export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "o4";
export const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";

export const MODEL_HINTS = {
  /**
   * Recommended for most coding / terminal tasks.
   */
  primary: OPENAI_MODEL,
  /**
   * Example of explicitly pinning o3 for lower-cost experiments.
   */
  alternate: "o3"
};

export function assertApiKey(): void {
  if (!OPENAI_API_KEY) {
    // Keep build-friendly: throw only at runtime usage.
    throw new Error("OPENAI_API_KEY is not set. Configure it in your environment before running the agent.");
  }
}
