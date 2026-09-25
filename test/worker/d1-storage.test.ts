import { describe, it, expect, beforeEach } from "vitest";
import { D1SessionStorage } from "../../src/worker/ai/d1-storage";
import type { SessionData } from "ai-session";

// 创建模拟 D1Database
function createMockD1Database(): D1Database {
  const store = new Map<string, { user_id: string; session_id: string; data: string; updated_at: number }>();

  return {
    prepare(query: string) {
      let boundParams: any[] = [];
      const stmt: any = {
        bind(...params: any[]) {
          boundParams = params;
          return stmt;
        },
        async first<T = Record<string, unknown>>() {
          if (query.includes("SELECT data FROM ai_sessions WHERE user_id = ? AND session_id = ?")) {
            const [userId, sessionId] = boundParams;
            const key = `${userId}:${sessionId}`;
            const item = store.get(key);
            if (!item) return null as T | null;
            return { data: item.data } as T;
          }
          return null as T | null;
        },
        async all<T = Record<string, unknown>>() {
          if (query.includes("SELECT data FROM ai_sessions WHERE user_id = ?")) {
            const [userId] = boundParams;
            const results = Array.from(store.values())
              .filter((x) => x.user_id === userId)
              .sort((a, b) => b.updated_at - a.updated_at)
              .map((x) => ({ data: x.data }));
            return { results } as any;
          }
          return { results: [] } as any;
        },
        async run() {
          if (query.includes("INSERT INTO ai_sessions")) {
            const [userId, sessionId, data, updatedAt] = boundParams;
            const key = `${userId}:${sessionId}`;
            store.set(key, { user_id: userId, session_id: sessionId, data, updated_at: updatedAt });
            return { success: true, meta: { changes: 1 } };
          }
          if (query.includes("DELETE FROM ai_sessions")) {
            const [userId, sessionId] = boundParams;
            const key = `${userId}:${sessionId}`;
            const existed = store.delete(key);
            return { success: true, meta: { changes: existed ? 1 : 0 } };
          }
          return { success: true, meta: { changes: 0 } };
        },
      };
      return stmt;
    },
  } as unknown as D1Database;
}

describe("D1SessionStorage", () => {
  let mockDb: D1Database;
  let storage: D1SessionStorage;

  beforeEach(() => {
    mockDb = createMockD1Database();
    storage = new D1SessionStorage(mockDb);
  });

  const sampleSession: SessionData = {
    userId: "user_test_100",
    sessionId: "session_fortune_001",
    messages: [
      {
        id: "msg_1",
        role: "user",
        content: "测算手相",
        createdAt: Date.now(),
      },
      {
        id: "msg_2",
        role: "assistant",
        content: "您的手相掌纹清晰，事业线深长...",
        createdAt: Date.now() + 1000,
      },
    ],
    metadata: {
      category: "palm_face",
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it("应成功保存和读取会话", async () => {
    await storage.saveSession(sampleSession);

    const loaded = await storage.loadSession("user_test_100", "session_fortune_001");
    expect(loaded).not.toBeNull();
    expect(loaded?.userId).toBe("user_test_100");
    expect(loaded?.sessionId).toBe("session_fortune_001");
    expect(loaded?.messages).toHaveLength(2);
    expect(loaded?.messages[0].content).toBe("测算手相");
    expect(loaded?.metadata?.category).toBe("palm_face");
  });

  it("读取不存在的会话应返回 null", async () => {
    const loaded = await storage.loadSession("non_existent_user", "non_existent_session");
    expect(loaded).toBeNull();
  });

  it("更新会话应生效", async () => {
    await storage.saveSession(sampleSession);

    const updatedSession: SessionData = {
      ...sampleSession,
      messages: [
        ...sampleSession.messages,
        {
          id: "msg_3",
          role: "user",
          content: "继续详批财运",
          createdAt: Date.now() + 2000,
        },
      ],
    };

    await storage.updateSession(updatedSession);
    const loaded = await storage.loadSession("user_test_100", "session_fortune_001");
    expect(loaded?.messages).toHaveLength(3);
    expect(loaded?.messages[2].content).toBe("继续详批财运");
  });

  it("删除会话应成功", async () => {
    await storage.saveSession(sampleSession);
    const deleted = await storage.deleteSession("user_test_100", "session_fortune_001");
    expect(deleted).toBe(true);

    const loaded = await storage.loadSession("user_test_100", "session_fortune_001");
    expect(loaded).toBeNull();

    // 再次删除应返回 false
    const deleteAgain = await storage.deleteSession("user_test_100", "session_fortune_001");
    expect(deleteAgain).toBe(false);
  });

  it("应正确列出用户的所有历史会话", async () => {
    const session1: SessionData = { ...sampleSession, sessionId: "sess_1", createdAt: 1000, updatedAt: 1000 };
    const session2: SessionData = { ...sampleSession, sessionId: "sess_2", createdAt: 2000, updatedAt: 2000 };
    const otherUserSession: SessionData = { ...sampleSession, userId: "other_user", sessionId: "sess_3" };

    await storage.saveSession(session1);
    await storage.saveSession(session2);
    await storage.saveSession(otherUserSession);

    const list = await storage.listSessions("user_test_100");
    expect(list).toHaveLength(2);
    const sessionIds = list.map((s) => s.sessionId);
    expect(sessionIds).toContain("sess_1");
    expect(sessionIds).toContain("sess_2");
    expect(sessionIds).not.toContain("sess_3");
  });
});
