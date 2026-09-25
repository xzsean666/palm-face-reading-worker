# TASK-013: 全链路端到端联调、本地模拟测试与生产部署指南

## Objective
对「天机 AI预测大师」全栈 Worker 应用进行全链路端到端（E2E）闭环联调，验证从静态资产加载、10 大门类推演、SSE 实时流、D1 持久化存储、USDT 支付/免费次数抵扣、分章解锁到推荐分润与提现的全流程，并输出完整的生产环境部署与运维手册。

## Scope
1. 整合与执行端到端全链路测试脚本（包含相学多模态推演、八字推演、姓名学测算）；
2. 验证 Cloudflare Worker 本地开发环境（`wrangler dev`）下的静态资产挂载与 `/api/*` 请求协同；
3. 验证弱网与异常场景下的容错：
   - 上游大模型超时或 429 时的重试与降级；
   - D1 并发写入一致性；
   - 照片尺寸过大时的客户端拦截；
4. 编写 `README.md` 与上线部署文档：
   - Wrangler 配置、Cloudflare D1 远程数据库创建与迁移应用；
   - 环境变量注入（`AI_PROVIDER_PROTOCOL`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`）；
   - 自定义域名绑定与上线检查清单。

## Allowed Files
- `README.md`
- `test/e2e/**/*`
- `scripts/verify-all.ts`
- `docs/DEPLOYMENT.md`

## Dependencies
TASK-011 (推演与报告), TASK-012 (商业化与用户中心)

## Inputs and Outputs
- **输入**：全栈构建产物与前后端代码库。
- **输出**：通过的全量自动化与端到端测试套件，以及详尽的部署上线指南。

## Acceptance Criteria
- [x] 执行 `pnpm test` 通过所有单元测试与集成测试 (6 套件 28 用例 100% 通过)；
- [x] 本地全链路自检 `pnpm run verify`，无报错走通静态构建、类型推演、预览与解锁全流程；
- [x] 知识库 RAG 在边缘无物理磁盘环境下精准命中并注入 System Prompt (41 篇/109.5 KB)；
- [x] 输出生产就绪的部署文档，任何人对照文档均能在 10 分钟内完成独立部署 (`docs/DEPLOYMENT.md` 与 `README.md`)。

## Verification Commands
```bash
pnpm test
pnpm run build
pnpm run verify
npx wrangler deploy --dry-run
```

## Risks and Assumptions
- 生产环境部署需配置有效的 Cloudflare 账号凭据与上游大模型 API Key。

## Status
DONE
