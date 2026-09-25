# TASK-001: 建立 AI 算命 Worker 项目文档基线、架构与技术决策

## Objective
建立「天机 AI预测大师」项目级事实来源与开发规范文档基线，明确全产品 18 个页面、10 大算命门类、Cloudflare Worker 边缘架构、AI-Session SDK 集成、成熟前端框架选型与细粒度任务拆解，为后续 session 提供严密指导。

## Scope
1. 整理与明确项目总目标 (`GOAL.md`) 与系统边界；
2. 完成 Cloudflare Workers 全栈单仓拓扑设计 (`ARCHITECTURE.md`)；
3. 做出关键技术决策 (`DECISIONS.md`)，包括 Vue 3 + Tailwind CSS 前端框架选型、SDK 边缘适配与虚拟知识库 RAG 方案、两级报告付费墙与两级推荐分销；
4. 梳理完整的任务执行索引 (`TASK_INDEX.md`) 与各任务规范卡片 (`TASK-001.md` ~ `TASK-013.md`)；
5. 输出初始会话状态文件 (`SESSION_STATE.md`)。

## Allowed Files
- `docs/AI_AGENT_PROMPT.md`
- `docs/AI/GOAL.md`
- `docs/AI/ARCHITECTURE.md`
- `docs/AI/DECISIONS.md`
- `docs/AI/TASK_INDEX.md`
- `docs/AI/SESSION_STATE.md`
- `docs/AI/tasks/TASK-001.md`
- `docs/AI/tasks/TASK-002.md`
- `docs/AI/tasks/TASK-003.md`
- `docs/AI/tasks/TASK-004.md`
- `docs/AI/tasks/TASK-005.md`
- `docs/AI/tasks/TASK-006.md`
- `docs/AI/tasks/TASK-007.md`
- `docs/AI/tasks/TASK-008.md`
- `docs/AI/tasks/TASK-009.md`
- `docs/AI/tasks/TASK-010.md`
- `docs/AI/tasks/TASK-011.md`
- `docs/AI/tasks/TASK-012.md`
- `docs/AI/tasks/TASK-013.md`

## Dependencies
无。作为仓库首个任务，建立后续任务的依赖基准。

## Inputs and Outputs
- **输入**：
  - 用户对 AI 算命 Worker 的产品需求；
  - `docs/design/stitch_ui/ai_ui.md` 界面规范；
  - `docs/design/stitch_ui/tianji_ai_divination_dapp/DESIGN.md` 设计系统；
  - `/ssd0/git/AI-Session-NodeJS/docs/cloudflare-workers.md` SDK Worker 使用指南；
  - `/ssd0/git/AI-Session-NodeJS/examples/palm-face-reading` 示例相学实现。
- **输出**：
  - 完备的 `docs/AI/` 架构、决策、目标、索引与任务卡片。

## Acceptance Criteria
- [x] `docs/AI_AGENT_PROMPT.md` 包含严密的工作约定与行为准则；
- [x] `docs/AI/GOAL.md` 明确 10 大门类、18 个页面规范与交付标准；
- [x] `docs/AI/ARCHITECTURE.md` 详细描述 Worker 边缘运行时、D1 存储适配、无盘 RAG、SSE 流式推演与前端设计系统映射；
- [x] `docs/AI/DECISIONS.md` 明确 Vue 3 + Tailwind 前端框架选型并论证其合理性；
- [x] `docs/AI/TASK_INDEX.md` 与 13 个任务卡片全部创建完毕，每个卡片包含完备元数据；
- [x] `docs/AI/SESSION_STATE.md` 记录清晰的恢复状态。

## Verification Commands
```bash
find docs/AI -type f | sort
rg -n "TASK-001|TASK-002|Vue|D1SessionStorage|Virtual RAG" docs/AI
git status --short
```

## Risks and Assumptions
- 假设上游大模型 API 具备多模态能力（如 GPT-4o 或 Gemini-1.5-Pro），若仅使用纯文本模型，面相/手相需降级为特征文字描述。
- 假设本地开发环境具备 Node.js 20+ 及 pnpm。

## Status
DONE
