# TASK-002: 建立全栈项目工程骨架 (Wrangler + Hono + Vite + Vue 3 + Tailwind)

## Objective
建立统一管理 Cloudflare Worker 后端与 Vue 3 前端的单仓工程骨架，配置好 `wrangler.jsonc`、`package.json`、`vite.config.ts`、Tailwind CSS 及 TypeScript 开发与构建管道。

## Scope
1. 配置根目录 `package.json` 与 `pnpm` 脚本（`dev`, `build`, `build:client`, `build:worker`, `typecheck`）；
2. 配置 `wrangler.jsonc`（启用 `nodejs_compat`、绑定 D1 数据库、配置 `assets` 指向前端产物目录 `./dist-client`）；
3. 搭建前端 Vite + Vue 3 + Tailwind CSS 项目骨架（在 `src/client/` 中）；
4. 搭建后端 Cloudflare Worker + Hono 入口（在 `src/worker/` 中），并配置基础健康检查 `/api/health`；
5. 验证构建流程并确保 `dist-client` 能被 Worker 静态挂载。

## Allowed Files
- `package.json`
- `tsconfig.json`
- `tsconfig.worker.json`
- `tsconfig.client.json`
- `wrangler.jsonc`
- `vite.config.ts`
- `tailwind.config.js`
- `postcss.config.js`
- `src/client/*`
- `src/worker/*`
- `.gitignore`

## Dependencies
TASK-001 (文档基线)

## Inputs and Outputs
- **输入**：`docs/AI/ARCHITECTURE.md` 与 `docs/AI/DECISIONS.md` 中的架构规范。
- **输出**：可通过 `pnpm build` 成功输出 Client 与 Worker，可通过 `pnpm dev` 启动本地联合调试。

## Acceptance Criteria
- [x] 根目录 `package.json` 包含 `wrangler`, `hono`, `vue`, `vite`, `tailwindcss` 等必要依赖；
- [x] `wrangler.jsonc` 包含 `nodejs_compat` 标记和 `assets` 目录配置；
- [x] 后端 Hono 服务响应 `GET /api/health` 返回 `{ status: "ok", time: ... }`；
- [x] 静态资源访问 `/` 返回 Vue 3 基础应用页面；
- [x] TypeScript 类型检查 `pnpm typecheck` 通过。

## Verification Commands
```bash
pnpm run build
pnpm run typecheck
pnpm wrangler types
node -e 'import("./dist-worker/index.js").then(m => m.default.fetch(new Request("http://localhost/api/health"), {}, {})).then(r => r.json()).then(console.log)'
```

## Risks and Assumptions
- Cloudflare Workers 静态资产功能要求 Wrangler 3.88+ 版本，当前已安装 3.114.17。

## Status
DONE
