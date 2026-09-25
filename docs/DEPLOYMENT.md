# 🌌「天机 AI预测大师」生产环境部署与运维手册

本手册指导如何在 10 分钟内将「天机 AI预测大师」全栈边缘应用（Vue 3 前端 + Cloudflare Worker 后端 + Cloudflare D1 边缘数据库）完整部署至 Cloudflare 全球边缘网络。

---

## 一、架构拓扑与环境规格

```
                                [全球缘主访问]
                                       │
                                       ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                Cloudflare Edge Network (Anycast)                │
    │                                                                 │
    │  ┌───────────────────────┐         ┌─────────────────────────┐  │
    │  │  前端静态资产 (ASSETS) │ ◀─────── │  Hono Edge API Worker   │  │
    │  │  Vue 3 + Vite SPA     │ (回退)   │  路由 /api/* + SSE 流式 │  │
    │  └───────────────────────┘         └────────────┬────────────┘  │
    │                                                 │               │
    │                                                 ▼               │
    │                                    ┌─────────────────────────┐  │
    │                                    │  Cloudflare D1 边缘存储  │  │
    │                                    │  SQLite / 会话 / 账单   │  │
    │                                    └─────────────────────────┘  │
    └─────────────────────────────────────────────────┬───────────────┘
                                                      │
                                                      ▼ (HTTPS)
                                    ┌─────────────────────────────────┐
                                    │    OpenAI / DeepSeek / 通用大模型 │
                                    │     RAG 典籍注入 + 命理推演     │
                                    └─────────────────────────────────┘
```

- **Runtime**: Cloudflare Workers (`nodejs_compat` 模式)
- **Database**: Cloudflare D1 (无服务器分布式 SQLite)
- **Frontend**: Vue 3.5 + Vite 6 + Tailwind CSS + Pinia (构建至 `dist-client`)
- **AI Core**: `ai-session` SDK (`D1Storage` 持久化 + 41 篇国学典籍虚拟 RAG + SSE 流式响应)

---

## 二、部署前准备 (Prerequisites)

1. **基础工具环境**:
   - Node.js >= 20.0.0
   - pnpm >= 9.0.0
2. **Cloudflare 账号**:
   - 登录 Cloudflare 控制台并安装 `wrangler`:
     ```bash
     npx wrangler login
     ```
3. **大模型服务凭证**:
   - OpenAI API Key、DeepSeek API Key 或兼容 OpenAI 协议的代理密钥。

---

## 三、快速部署步骤 (10 分钟快速上线)

### 步骤 1：拉取项目并安装依赖

```bash
cd palm-face-reading-worker
pnpm install
```

### 步骤 2：全量构建资产与知识库

打包 41 篇国学典籍（109.5 KB 虚拟 RAG）、前端 SPA 静态站点以及边缘 Worker：

```bash
pnpm run build
```

构建成功后将生成：
- `src/worker/ai/knowledge-bundle.json`: 编译后的全门类国学知识库
- `dist-client/`: 前端生产产物（HTML/CSS/JS/Chuncks）
- `dist-worker/index.js`: Worker 编译产物

### 步骤 3：创建与配置 Cloudflare D1 数据库

1. **在 Cloudflare 创建 D1 数据库实例**:
   ```bash
   npx wrangler d1 create tianji_divination_db
   ```
   终端将输出类似如下信息：
   ```json
   {
     "binding": "DB",
     "database_name": "tianji_divination_db",
     "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   }
   ```

2. **更新 `wrangler.jsonc` 中的 `database_id`**:
   将获取到的 `database_id` 填入项目根目录 `wrangler.jsonc`：
   ```jsonc
   "d1_databases": [
     {
       "binding": "DB",
       "database_name": "tianji_divination_db",
       "database_id": "填入你的实际_database_id"
     }
   ]
   ```

3. **执行数据库表结构迁移 (初始化)**:
   ```bash
   npx wrangler d1 execute tianji_divination_db --remote --file=./migrations/0001_initial_schema.sql
   ```
   > 💡 本地开发调试时可执行本地迁移：
   > `npx wrangler d1 execute tianji_divination_db --local --file=./migrations/0001_initial_schema.sql`

### 步骤 4：注入环境变量与生产密钥 (Secrets)

通过 Wrangler CLI 将敏感密钥安全存入 Cloudflare KMS：

```bash
# 必填：大模型 API 密钥
npx wrangler secret put AI_API_KEY

# 选填：自定义大模型 API 基础地址（如使用 DeepSeek 或中转网关）
npx wrangler secret put OPENAI_API_BASE
# 例如输入: https://api.deepseek.com/v1 或 https://api.openai.com/v1
```

### 步骤 5：发布部署至 Cloudflare 全球边缘

执行一键部署命令：

```bash
npx wrangler deploy
```

部署完成后，终端将输出已分配的 Workers 默认域名，例如：
`https://palm-face-reading-worker.<你的子域>.workers.dev`

---

## 四、部署健康验证与可用性检查

### 1. 边缘健康探测接口
```bash
curl -i https://palm-face-reading-worker.<你的子域>.workers.dev/api/health
```
预期响应 (HTTP 200 OK)：
```json
{
  "status": "ok",
  "service": "tianji-divination-worker",
  "time": 1727273400000,
  "edge": true
}
```

### 2. 前端页面访问与体验
在浏览器打开分配的 Worker 域名：
1. 观察开屏页面（P01）暗金赛博八卦光环动效正常加载；
2. 点击游客体验或连接钱包，验证免费赠送 2 次测算额度；
3. 进入相学或生辰八字表单（P04/P05），提交一次排盘测算；
4. 观察推演页（P06）罗盘旋转动效与阶段流式输出；
5. 查看免费脱敏报告（P07）与 6 大章节手风琴（P09）。

---

## 五、自定义域名绑定 (Custom Domain)

生产上线建议绑定自定义独立域名（例如 `tianji.yourdomain.com`）：

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/)；
2. 导航至 **Workers & Pages** -> 点击 `palm-face-reading-worker`；
3. 点击 **Settings (设置)** -> **Triggers (触发器)**；
4. 在 **Custom Domains (自定义域)** 区域点击 **Add Custom Domain**；
5. 输入你的专属域名（例如 `tianji.example.com`），点击添加并等待 SSL 证书自动签发（通常 1-2 分钟内生效）。

---

## 六、生产运维、监控与排障指南

### 1. 实时日志排查 (Live Edge Logs)
```bash
npx wrangler tail
```
可实时观察各边缘节点接收到的用户请求、流式推演输出与潜在报错。

### 2. 数据库状态检查与备份
- **在线查询用户与订单总量**:
  ```bash
  npx wrangler d1 execute tianji_divination_db --remote --command="SELECT count(*) FROM users; SELECT count(*), sum(price_usdt) FROM divination_orders;"
  ```
- **导出数据备份**:
  ```bash
  npx wrangler d1 export tianji_divination_db --remote --output=./backup_$(date +%Y%m%d).sql
  ```

### 3. 常见异常排查速查表

| 现象 | 可能原因 | 解决排查方案 |
| :--- | :--- | :--- |
| API 报 500 且提示 `AI_API_KEY missing` | 生产未注入 Secret | 运行 `npx wrangler secret put AI_API_KEY` 重新配置 |
| 访问页面 404 Not Found | 静态资源未打包进 Worker | 检查 `dist-client/` 是否存在，运行 `pnpm run build` 后重新 `wrangler deploy` |
| D1 no such table: users | 数据库迁移未执行 | 运行 `npx wrangler d1 execute tianji_divination_db --remote --file=./migrations/0001_initial_schema.sql` |
| 大模型推演 SSE 中断 | 上游超时或限流 429 | 检查 `AI_API_KEY` 账户余额或在 Worker 中配置重试与备用上游节点 |
