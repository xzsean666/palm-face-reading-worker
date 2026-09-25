# TASK-004: 集成 AI-Session SDK 与 D1SessionStorage 边缘存储适配器

## Objective
在 Worker 中引入 `/ssd0/git/AI-Session-NodeJS` SDK，实现生产级 `D1SessionStorage` 持久化适配器，满足 SDK 的 `IStorage` 接口契约，并在 Cloudflare Worker 边缘无状态环境中验证会话保存、恢复与多轮对话。

## Scope
1. 在 `package.json` 中以本地文件/npm 链接形式引入 `ai-session` SDK；
2. 依据 `/ssd0/git/AI-Session-NodeJS/docs/cloudflare-workers.md` 实现 `src/worker/ai/d1-storage.ts`；
3. 实现 `IStorage` 的 5 个核心接口方法：`saveSession`, `loadSession`, `updateSession`, `deleteSession`, `listSessions`；
4. 编写 `src/worker/ai/client.ts` 封装 `AIClient` 与 `D1SessionStorage` 的边缘初始化逻辑；
5. 编写单元测试或集成测试路由，验证多轮对话保存到 D1 与恢复。

## Allowed Files
- `package.json`
- `src/worker/ai/d1-storage.ts`
- `src/worker/ai/client.ts`
- `test/worker/d1-storage.test.ts`

## Dependencies
TASK-003 (D1 数据库与 Schema)

## Inputs and Outputs
- **输入**：`/ssd0/git/AI-Session-NodeJS/docs/cloudflare-workers.md` 中的标准适配器实现。
- **输出**：可直接在 Worker 请求上下文中注入 `env.DB` 使用的 `D1SessionStorage` 模块。

## Acceptance Criteria
- [x] `D1SessionStorage` 实现 `IStorage` 接口的所有异步方法；
- [x] 会话数据在写入 D1 前经过序列化，更新冲突时按 `user_id` 和 `session_id` 自动合并更新并刷新 `updated_at`；
- [x] 测试用例模拟写入与读取 `SessionData`，验证数据完整无损。

## Verification Commands
```bash
pnpm test
pnpm run typecheck
```

## Risks and Assumptions
- Cloudflare D1 单次 bind 参数不能超限（D1 具备单行尺寸限制），超长会话历史需依赖 SDK 自带的 Context Compact 机制自动压缩。

## Status
DONE
