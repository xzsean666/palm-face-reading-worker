import type { IStorage, SessionData } from "ai-session";

/**
 * Cloudflare D1 数据库存储适配器
 * 适配 ai-session SDK 的 IStorage 接口，实现分布式边缘会话持久化
 */
export class D1SessionStorage implements IStorage {
  constructor(private readonly db: D1Database) {}

  /**
   * 保存或覆盖会话数据
   */
  async saveSession(session: SessionData): Promise<void> {
    const serialized = JSON.stringify(session);
    await this.db
      .prepare(
        `INSERT INTO ai_sessions (user_id, session_id, data, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id, session_id) DO UPDATE SET
           data = excluded.data,
           updated_at = excluded.updated_at`
      )
      .bind(session.userId, session.sessionId, serialized, Date.now())
      .run();
  }

  /**
   * 读取指定会话数据，不存在时返回 null
   */
  async loadSession(userId: string, sessionId: string): Promise<SessionData | null> {
    const row = await this.db
      .prepare(`SELECT data FROM ai_sessions WHERE user_id = ? AND session_id = ?`)
      .bind(userId, sessionId)
      .first<{ data: string }>();

    if (!row || !row.data) {
      return null;
    }

    try {
      return JSON.parse(row.data) as SessionData;
    } catch {
      return null;
    }
  }

  /**
   * 更新已存在的会话数据
   */
  async updateSession(session: SessionData): Promise<void> {
    await this.saveSession(session);
  }

  /**
   * 删除会话
   */
  async deleteSession(userId: string, sessionId: string): Promise<boolean> {
    const result = await this.db
      .prepare(`DELETE FROM ai_sessions WHERE user_id = ? AND session_id = ?`)
      .bind(userId, sessionId)
      .run();

    return (result.meta.changes ?? 0) > 0;
  }

  /**
   * 列出指定用户的所有历史会话
   */
  async listSessions(userId: string): Promise<SessionData[]> {
    const { results } = await this.db
      .prepare(`SELECT data FROM ai_sessions WHERE user_id = ? ORDER BY updated_at DESC`)
      .bind(userId)
      .all<{ data: string }>();

    if (!results || results.length === 0) {
      return [];
    }

    const sessions: SessionData[] = [];
    for (const row of results) {
      if (row.data) {
        try {
          sessions.push(JSON.parse(row.data) as SessionData);
        } catch {
          // ignore corrupted json
        }
      }
    }
    return sessions;
  }
}
