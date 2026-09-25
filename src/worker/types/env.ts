export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  AI_API_KEY?: string;
  OPENAI_API_BASE?: string;
  DEFAULT_MODEL?: string;
}
