import OpenAI from "openai";

// BYOK OpenAI-compatible client — works with OpenRouter, Together, Groq, etc.
// Set OPENAI_BASE_URL to your provider endpoint, e.g. https://openrouter.ai/api/v1
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
});