# 🌌 天机 AI预测大师 (Tianji AI Divination Worker)

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Storage-Cloudflare%20D1-orange)](https://developers.cloudflare.com/d1/)
[![Vue 3](https://img.shields.io/badge/Frontend-Vue%203.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Bundle-Vite%206-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-28%20Passed-brightgreen?logo=vitest&logoColor=white)](https://vitest.dev/)

> **融汇东方玄学千载传承与现代边缘 AI 算力**  
> 基于 Cloudflare Workers 边缘计算架构与 `AI-Session-NodeJS` SDK 构建的全栈边缘 AI 预测与命理分析平台。

---

## 🌟 核心特性 (Key Features)

### 1. 十大国学预测门类 (Ten Divination Categories)
- ✋ **手相面相 (AI Vision)**：多模态照片智能压缩诊断，解析生命线、智慧线、感情线及三停十二宫。
- ☯️ **生辰八字 (Bazi)**：推排四柱八字、天干地支、五行十神强弱衰旺与喜用神。
- 🌌 **紫微斗数 (Ziwei)**：安星排盘，解析十二宫位（命宫、身宫、财帛、官禄）吉凶星曜。
- 🪙 **周易六爻 (Zhouyi)**：铜钱三演得卦，安世应、装六亲、辨动变爻象。
- 🧭 **奇门遁甲 (Qimen)**：全息排布地盘、天盘、八门、九星、八神，定吉凶趋避。
- 🔮 **塔罗星盘 (Tarot & Astrology)**：大阿卡那牌阵推演与现代星盘能量相位解析。
- ✍️ **姓名学起名 (Naming)**：依五格剖象法（天格、人格、地格、总格、外格）与三才五行数理起名测名。
- 💖 **恋爱合盘 (Love Match)**：男女生辰八字合婚与纳音五行生克配对批断。
- 📅 **流年大运 (Future Fortune)**：推演未来十年大运走势与特定流年天干地支吉凶拐点。
- 🏮 **择日吉凶 (Auspicious Date)**：婚嫁、开业、入宅、安葬建除十二神择吉历法。

### 2. 国学典籍虚拟 RAG 知识库 (Zero-Disk Virtual RAG)
- 精心整理收录 **41 篇古典命理巨著** 切片（涵盖《麻衣相法》《渊海子平》《三命通会》《滴天髓》《奇门遁甲秘笈大全》《易经》等）；
- 编译生成 **109.5 KB** 高密度知识索引包，零物理磁盘依赖，随 Worker 瞬时加载至全球 330+ 边缘节点内存，精确注入 System Prompt。

### 3. 暗金赛博玄学设计系统 (Mystic Cyber-Occultism)
- **视觉风格**：深黑背景 (`#050508`) 搭配太极暗金 (`#C6A15B` ~ `#E5C07B`) 与赛博灵光青蓝紫霓虹光效；
- **全屏沉浸体验**：18 个高保真响应式视图（P01 开屏动效、P03 命理宫格、P06 罗盘八卦推演轮盘、P09 全息命盘与六大章节手风琴报告、P11 收益三联卡、P16 分享海报生成器等）；
- **客户端防抖与轻量化**：HTML5 Canvas 智能压缩图片至 300KB 以内，长图海报客户端一键导出。

### 4. 双层报告与价值转化 (Two-Tier Report & Paywall)
- **免费层 (Free Preview)**：开局赠送 2 次免费额度，呈现核心命局定性、总分运势条与综合概述；
- **付费层 (Unlocked Report)**：解锁 6 大分章手风琴（命格特质、事业财运、婚恋情感、健康体质、关键年份、宗师开运锦囊）。

### 5. 商业闭环与两级返佣状态机 (USDT & Referral System)
- **Web3 USDT 支付**：支持 TRC20 与 ERC20 订单支付状态流转与免费额度核销；
- **双层返佣结算**：直推返佣 **15%**、间推返佣 **5%**，实时写入 D1 账本；
- **提现状态机**：满 10 USDT 起提，扣除 1 USDT 链上手续费，原子扣减余额。
- **VIP 权益体系**：支持月度、季度、年度 VIP 订阅，享受折扣与专属排盘通道。

---

## 🏗️ 系统技术架构 (Architecture Overview)

```
[前端: Vue 3.5 + Vite 6 + Tailwind + Pinia]
                │ (HTTP REST / Server-Sent Events 流式推演)
                ▼
[边缘网关: Cloudflare Workers + Hono]
   ├── 静态资产分发 (ASSETS -> ./dist-client)
   ├── 业务 API 路由 (/api/divine, /api/user, /api/orders, /api/vip, /api/promote, /api/stats)
   ├── AI 推演引擎 (AI-Session SDK + Virtual RAG 知识注入)
   └── D1 持久化存储 (D1Storage 会话上下文 + 关系型表 Users / Orders / Reports / Withdrawals)
                │
                ▼
[上游大模型: OpenAI / DeepSeek / 通用大模型网关]
```

---

## 📱 18 大视图矩阵 (Page Matrix)

| 编号 | 路由路径 | 页面名称 | 核心交互与功能 |
| :--- | :--- | :--- | :--- |
| **P01** | `/splash` | 闪屏开屏页 | 2.5s 暗金八卦光环呼吸动效，自动引导进入 |
| **P02** | `/login` | 登录鉴权页 | Web3 钱包一键连接 / 游客免密静默模式 |
| **P03** | `/` | 测算大厅首页 | 180px 轮播 Hero、3 列金铜宫格、实时测算动态流 |
| **P04** | `/feature/palm-face` | 相学引导页 | 拍摄指引、正面/手掌规范、光线要求提示 |
| **P05** | `/feature/:id/input` | 门类输入表单 | 10 大门类定制字段、Canvas 智能压缩上传 |
| **P06** | `/analyzing` | 罗盘推演页 | 220px 八卦双向旋转星盘、5 阶段 SSE 实时动效 |
| **P07** | `/preview` | 免费报告预览 | 3 项评分条、脱敏概述、200px 模糊付费遮罩墙 |
| **P08** | `/pay` | 收银台页面 | 6 USDT 定价、TRC20/ERC20 扫码、推荐码抵扣 |
| **P09** | `/report` | 完整深度报告 | 240px 全息命盘、6 大分章手风琴、高清长图导出 |
| **P10** | `/vip` | VIP 会员中心 | 权益对比表、月度/季度/年度套餐 USDT 订阅 |
| **P11** | `/promote` | 推广赚钱中心 | 收益三联卡 (余额/累计/待提)、分销海报生成 |
| **P12** | `/earnings` | 收益提现明细 | 分段 Tab 切换、满 10 USDT 提现弹窗 |
| **P13** | `/profile` | 个人资产中心 | 鎏金账户头卡、我的测算/分销统计入口 |
| **P14** | `/records` | 历史测算记录 | 72px 暗金历史测算卡片列表、报告重查 |
| **P15** | `/order/:id` | 订单详情页 | 交易哈希、支付方式、双层分润明细卡 |
| **P16** | `/invite` | 推广海报落地 | 专属二维码邀请海报、一键复制邀请链接 |
| **P17** | `/about` | 平台协议与声明 | 免责声明、隐私保护、国学文化研习申明 |
| **P18** | `/stats` | 平台大盘统计 | 2x2 数据大屏、门类分布饼图、30s 动态滚屏 |

---

## 🚀 本地开发与运行 (Local Development)

### 1. 依赖安装
```bash
pnpm install
```

### 2. 编译典籍知识库
```bash
pnpm run build:knowledge
```

### 3. 启动前端 Vite 开发服务器
```bash
pnpm run dev
# 本地访问 http://localhost:5173
```

### 4. 启动 Cloudflare Worker 本地开发环境
```bash
pnpm run dev:worker
# 启动本地 D1 模拟与 Hono 边缘服务
```

---

## 🧪 自动化测试与全量自检 (Testing & Verification)

项目拥有全套自动化测试套件（涵盖存储、知识库、推演、分销、提现、HTTP 路由及端到端流程）：

```bash
# 执行全量单元测试与 E2E 链路测试
pnpm test

# 执行双端 TypeScript 类型静态检查
pnpm run typecheck

# 执行一键全栈自检 (知识库 + TS + Vitest + Vite 打包 + TSUP 边缘打包)
pnpm run verify
```

全量自检输出样例：
```
======================================================
Step 1/5: 国学典籍 RAG 知识库打包校验 (✔ SUCCESS 41篇/109.5KB)
Step 2/5: TypeScript 双端类型检查 (✔ SUCCESS vue-tsc + tsc)
Step 3/5: 全量 Vitest 单元与端到端集成测试 (✔ SUCCESS 28 passed)
Step 4/5: 前端 Mystic Cyber-Occultism 生产构建 (✔ SUCCESS Vite 24 Chunks)
Step 5/5: Cloudflare Worker 边缘构建与 Wrangler 规则校验 (✔ SUCCESS 259KB)
======================================================
```

---

## 🌐 生产部署 (Production Deployment)

详细图文与排障说明请参阅 [生产环境部署与运维手册 (docs/DEPLOYMENT.md)](docs/DEPLOYMENT.md)。

**10 分钟快速部署命令概览**：
```bash
# 1. 构建全量生产产物
pnpm run build

# 2. 创建并配置 Cloudflare D1 数据库
npx wrangler d1 create tianji_divination_db
npx wrangler d1 execute tianji_divination_db --remote --file=./migrations/0001_initial_schema.sql

# 3. 注入敏感密钥
npx wrangler secret put AI_API_KEY

# 4. 发布至 Cloudflare 全球边缘网络
npx wrangler deploy
```

---

## 📜 免责声明 (Disclaimer)

本项目所有预测推演结果由人工智能大模型结合传统国学典籍生成，内容仅供传统文化研习、娱乐与心理疏导参考，不构成任何医疗、法律、投资或专业决策建议。

---

## 📄 开源与版权协议 (License)

本项目采用 MIT 协议开源。
