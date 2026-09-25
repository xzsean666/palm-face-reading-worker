import { AIClient, type IStorage } from "ai-session";
import { D1SessionStorage } from "./d1-storage";
import type { Env } from "../types/env";

export interface AIClientOptions {
  storage?: IStorage;
  model?: string;
}

/**
 * 创建适用于 Cloudflare Worker 边缘运行时的 AIClient 实例
 */
export function createAIClient(env: Env, options?: AIClientOptions): AIClient {
  const apiKey = env.AI_API_KEY || "mock-api-key";
  const baseUrl = env.OPENAI_API_BASE || "https://api.openai.com/v1";
  const model = options?.model || env.DEFAULT_MODEL || "gpt-4o";

  const storage = options?.storage || new D1SessionStorage(env.DB);

  return new AIClient({
    provider: {
      protocol: "openai",
      baseUrl,
      apiKey,
      model,
    },
    storage,
  });
}
