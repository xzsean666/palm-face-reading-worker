# AI Agent 项目开发提示词与工作规范

本文件是本仓库（`palm-face-reading-worker`）中 AI 代理（Engineering Development Agent）的项目级工作约定与行为准则。在遵守系统指令、开发者指令的前提下，本规范作为当前仓库的最高开发规范。

---

## 1. 文档与事实来源
以下文件是项目工作的事实来源：
- 项目规则：`docs/AI_AGENT_PROMPT.md`
- 总目标：`docs/AI/GOAL.md`
- 任务索引：`docs/AI/TASK_INDEX.md`
- 当前状态：`docs/AI/SESSION_STATE.md`
- 当前任务：`docs/AI/tasks/TASK-xxx.md`
- 架构说明：`docs/AI/ARCHITECTURE.md`
- 重要决策：`docs/AI/DECISIONS.md`
- UI 规范：`docs/design/stitch_ui/ai_ui.md` 与 `docs/design/stitch_ui/tianji_ai_divination_dapp/DESIGN.md`
- SDK 规范：`/ssd0/git/AI-Session-NodeJS/docs/cloudflare-workers.md`

如果这些文件不存在或需更新：
1. 先检查仓库结构和已有文档。
2. 创建/更新最小必要的 AI 工作文档。
3. 将用户目标拆分为细粒度任务。
4. 只允许继续执行第一个依赖已满足、范围明确的任务。
5. 如果目标或架构仍不明确，停止编码并报告需要补充的信息。

---

## 2. 工作原则
必须遵守：
1. **单目标原则**：一次只处理一个 Goal 和一个当前 Task。
2. **Session 粒度**：一个 session 默认最多完成一个 Task。
3. **严格范围限制**：不实现当前 Task 之外的功能。
4. **最小改动**：不修改与任务无关的文件。
5. **保护用户资产**：不删除、覆盖或回滚用户已有修改。
6. **非破坏性操作**：不执行 `git reset`、`git checkout`、递归删除等破坏性操作。
7. **环境安全**：不主动提交、推送、发布或修改生产环境。
8. **按需依赖**：不添加依赖，除非任务明确需要且现有功能无法满足。
9. **实事求是**：不假设使用某种语言、框架、包管理器或测试工具。所有结论必须基于实际读取或实际运行的结果。
10. **验证真实性**：没有实际运行过的测试不得声称通过。
11. **任务衍生**：发现额外工作时，创建新 Task，不要立即顺手实现。

---

## 3. 启动流程
每次 session 都必须按顺序执行：
1. 确认当前目录是项目根目录。
2. 查看仓库状态，例如 `git status --short`。
3. 读取项目规则。
4. 读取 `GOAL.md`、`TASK_INDEX.md` 和 `SESSION_STATE.md`。
5. 读取当前 Task 文件和直接相关的源代码、测试、配置。
6. 检查 Task 的所有依赖是否已经完成。
7. 如果有上次的 `IN_PROGRESS` Task，优先恢复它。
8. 否则选择第一个依赖已满足的 `TODO` Task。
9. 检查当前仓库是否符合 Task 的假设。
10. 在修改代码前输出执行计划（第 7 节格式）。

---

## 4. 修改前计划规范
修改代码前，必须先输出：
```text
Request Type:
Goal:
Current Behavior:
Current Task:
Dependencies:
Files To Read:
Files To Modify:
Files To Create:
Implementation Approach:
Acceptance Criteria:
Verification Method:
Risks and Assumptions:
```
计划确认范围后，才能开始编辑。

---

## 5. Task 状态流转
状态流转：`TODO -> IN_PROGRESS -> REVIEW -> DONE` 或 `BLOCKED`。
- **TODO**：尚未开始。
- **IN_PROGRESS**：当前正在执行。
- **REVIEW**：代码已完成，正在等待验证或人工检查。
- **DONE**：验收标准满足，验证已实际运行，文档已更新。
- **BLOCKED**：缺少必要信息、权限或外部状态，且本地替代方案不可行。

---

## 6. 完成条件与交接
只有同时满足以下条件，Task 才能标记为 DONE：
- 实现已完成。
- 没有超出允许修改范围。
- 验收标准全部满足。
- 相关测试或验证命令已经实际运行。
- 相关文档（`TASK_INDEX.md`, `SESSION_STATE.md`）已更新。
- 最终 diff 和仓库状态已检查。
- 已记录剩余风险和下一步任务。

每次 session 结束时输出统一交接格式：
```text
Goal:
Task:
Status: DONE | BLOCKED | REVIEW

Changed Files:
Created Files:

Implementation Summary:

Verification and Test Results:

Known Issues:

Remaining Work:

Next Task:
```
