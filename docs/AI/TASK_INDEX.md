# Task Index: 天机 AI预测大师 (Tianji AI Divination Worker)

任务状态流转严格遵循：`TODO -> IN_PROGRESS -> REVIEW -> DONE`（阻塞时为 `BLOCKED`）。每次 session 默认最多执行 1 个任务。

| Task | 目标 | 依赖 | 状态 |
| --- | --- | --- | --- |
| [TASK-001](tasks/TASK-001.md) | 建立 AI 算命 Worker 项目文档基线、架构与技术决策 | 无 | DONE |
| [TASK-002](tasks/TASK-002.md) | 建立全栈项目工程骨架 (Wrangler + Hono + Vite + Vue 3 + Tailwind) | TASK-001 | DONE |
| [TASK-003](tasks/TASK-003.md) | Cloudflare D1 数据模型设计与数据库迁移脚本实现 | TASK-002 | DONE |
| [TASK-004](tasks/TASK-004.md) | 集成 AI-Session SDK 与 D1SessionStorage 边缘存储适配器 | TASK-003 | DONE |
| [TASK-005](tasks/TASK-005.md) | 10 大算命门类知识库扩充与虚拟知识包构建 (Virtual RAG) | TASK-001 | DONE |
| [TASK-006](tasks/TASK-006.md) | 实现核心推演 API、报告生成与 SSE 实时流式推演服务 | TASK-004, TASK-005 | DONE |
| [TASK-007](tasks/TASK-007.md) | 实现用户鉴权、免费额度扣减与订单支付 (USDT) 状态机 | TASK-003 | DONE |
| [TASK-008](tasks/TASK-008.md) | 实现 VIP 会员中心、推荐分润佣金计算与提现 API | TASK-007 | DONE |
| [TASK-009](tasks/TASK-009.md) | 搭建前端设计系统 Tokens、全局导航（顶栏/抽屉/ActionSheet/副菜单）与路由 | TASK-002 | DONE |
| [TASK-010](tasks/TASK-010.md) | 实现前端核心入口与 10 大表单页面 (P01-P05) | TASK-009 | DONE |
| [TASK-011](tasks/TASK-011.md) | 实现前端星盘推演动效、付费墙预览与完整分章报告 (P06-P09) | TASK-006, TASK-010 | DONE |
| [TASK-012](tasks/TASK-012.md) | 实现前端商业化、推广分销、个人中心与统计模块 (P10-P18) | TASK-008, TASK-009 | DONE |
| [TASK-013](tasks/TASK-013.md) | 全链路端到端联调、本地模拟测试与生产部署指南 | TASK-011, TASK-012 | DONE |
