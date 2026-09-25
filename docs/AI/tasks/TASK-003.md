# TASK-003: Cloudflare D1 数据模型设计与数据库迁移脚本实现

## Objective
在 Cloudflare D1 边缘数据库中创建与初始化「天机 AI预测大师」的核心业务表，包括会话表、用户账户表、订单表、报告表与提现申请表，并编写本地与线上执行的迁移脚本。

## Scope
1. 编写迁移 SQL 文件 `migrations/0001_initial_schema.sql`；
2. 包含 `ai_sessions` 表（适配 `AI-Session-NodeJS` SDK 的会话数据结构）；
3. 包含 `users` 表（钱包地址、免费额度、VIP 状态、推荐码、佣金余额等）；
4. 包含 `divination_orders` 表（订单编号、门类、表单入参 JSON、支付方式与状态、直推间推分润）；
5. 包含 `divination_reports` 表（报告编号、预览总结、完整分章解读 JSON、解锁标记）；
6. 包含 `withdrawals` 表（提现流水与状态）；
7. 编写 D1 数据库客户端封装辅助函数 `src/worker/db/index.ts` 与 TypeScript 领域类型声明。

## Allowed Files
- `migrations/0001_initial_schema.sql`
- `src/worker/db/index.ts`
- `src/worker/db/types.ts`
- `src/worker/types/env.ts`

## Dependencies
TASK-002 (工程骨架)

## Inputs and Outputs
- **输入**：`docs/AI/ARCHITECTURE.md` 第 3 节 D1 数据库定义。
- **输出**：可通过 `wrangler d1 execute` 顺利执行的 migration 文件及强类型 DB 包装器。

## Acceptance Criteria
- [x] 迁移文件包含所有 5 张业务表和必要索引（`idx_ai_sessions_user`, `idx_orders_user`, `idx_users_referral_code`）；
- [x] `src/worker/db/types.ts` 导出完整的数据库行对象 TypeScript 接口；
- [x] 本地运行 `wrangler d1 execute tianji_divination_db --local --file=migrations/0001_initial_schema.sql` 成功无报错。

## Verification Commands
```bash
pnpm wrangler d1 execute tianji_divination_db --local --file=migrations/0001_initial_schema.sql
pnpm wrangler d1 execute tianji_divination_db --local --command="SELECT name FROM sqlite_master WHERE type='table';"
pnpm run typecheck
```

## Risks and Assumptions
- 本地 D1 测试需要依赖 SQLite 本地模拟器，已通过 Wrangler 内置机制成功创建 `.wrangler/state/v3/d1`。

## Status
DONE
