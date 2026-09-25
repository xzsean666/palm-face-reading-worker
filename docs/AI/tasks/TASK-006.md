# TASK-006: 实现核心推演 API、报告生成与 SSE 实时流式推演服务

## Objective
在 Cloudflare Worker 中实现 10 大门类的核心推演 API 服务，利用 `ai-session` SDK 发起多模态/文本推演，通过 Server-Sent Events (SSE) 向前端推送实时推演阶段动效与打字机文本流，并在推演完成后自动将结构化报告持久化至 D1 数据库。

## Scope
1. 实现推演前置校验中间件（用户免费次数校验、VIP 有效期或已支付订单检查）；
2. 实现 `POST /api/divine/submit`：接收表单字段、图片 Base64（若是相学）、初始化会话与订单，返回 `orderId` 与 `sessionId`；
3. 实现 `GET /api/divine/stream`（SSE 流式推演端点）：
   - 注入 `knowledge-bundle.json` 中对应门类的知识切片；
   - 调用 `session.chatStream`；
   - 模拟或按真实 token 阶段推送状态事件：
     - `event: stage`（阶段 1：正在连接 AI 智库... 阶段 2：正在排布命盘... 阶段 3：正在推演五行...）；
     - `event: chunk`（推演实时流式内容）；
     - `event: complete`（推演结束，返回结构化预览摘要与报告 ID）；
4. 实现报告结构化解析器，提取出「综合结论」、「核心评分指数（财运/事业/姻缘）」与「分章节解读」分别存入 D1 `divination_reports`；
5. 实现 `GET /api/divine/report/:id`：根据当前用户鉴权与支付状态，返回安全脱敏的免费预览版或完整解锁版报告。

## Allowed Files
- `src/worker/routes/divine.ts`
- `src/worker/services/divine-service.ts`
- `src/worker/utils/report-parser.ts`
- `src/worker/utils/sse.ts`
- `test/worker/divine.test.ts`

## Dependencies
TASK-004 (SDK 与 D1Storage), TASK-005 (知识库与 Prompt)

## Inputs and Outputs
- **输入**：用户录入的表单数据、图片 Base64、用户 Token / 钱包地址。
- **输出**：符合 SSE 协议的实时事件流，以及 D1 中持久化的预览与完整版报告记录。

## Acceptance Criteria
- [x] SSE 接口正确设置 `Content-Type: text/event-stream`、`Cache-Control: no-cache`、`Connection: keep-alive`；
- [x] 流式输出能顺利推送到客户端并在传输完成后自动将多轮历史与报告入库；
- [x] 未解锁状态下调用 `/api/divine/report/:id` 不泄露完整章节内容，只返回免费预览数据与模糊占位；
- [x] 具备单元测试或本地 Mock 上游大模型响应的测试用例。

## Verification Commands
```bash
pnpm test
pnpm run typecheck
pnpm run build
```

## Risks and Assumptions
- Cloudflare Worker 单次请求的 CPU 耗时与流式挂起时间在平台规格内，SSE 使用标准 `ReadableStream` 保持实时推送。

## Status
DONE
