# Technical Decisions: 天机 AI预测大师 (Tianji AI Divination Worker)

## 1. 架构选型：Cloudflare Worker 单仓全栈 (Fullstack Single Worker with Static Assets)

### 背景与上下文
系统需要提供高保真的 18 个移动端 H5 界面，同时提供基于 `AI-Session-NodeJS` SDK 的多模态 AI 算命接口、会话持久化与订单系统。需要兼顾全球极速访问、低维护成本、简单部署与零冷启动。

### 决策内容
采用 **Cloudflare Workers Static Assets** 架构：
- 前端（Client SPA）构建至 `./dist-client` 目录；
- 后端（Worker API）在 `src/worker/` 中编写，统一处理 `/api/*` 路由；
- 非 `/api/*` 请求由 Cloudflare 边缘网络直接分发静态资源（HTML/JS/CSS/图片）。

### 备选方案与权衡
- **备选 A：前端部署在 Cloudflare Pages，后端独立 Worker**：
  - 缺点：多仓库或双构建管道配置繁琐，本地联调需要同时启动 Pages Dev 与 Wrangler Dev，存在跨域 CORS 协调问题。
- **备选 B：全栈 Single Worker（当前决策）**：
  - 优点：单个 `wrangler.jsonc` 统一驱动，本地只需一条 `wrangler dev` 即可完整测试前端与后端，共享 TypeScript 类型定义，原子化部署。

---

## 2. 前端框架选型：Vue 3 + Vite + Tailwind CSS + Pinia

### 背景与上下文
用户要求：“UI 在 docs/design/stitch_ui，你可能得找一些成熟的框架会让UI更简单，你看看风格选择。”
`docs/design/stitch_ui` 中提供了 18 个页面原型，全部采用 **Tailwind CSS 3 + Material Symbols Outlined + 深色暗金调色板** 的形式编写。

### 决策内容
选用 **Vue 3 (Composition API / `<script setup>`) + Vite + Tailwind CSS + Pinia**：

1. **与原型极高贴合度**：
   - `stitch_ui` 中的 `code.html` 原型结构可以直接迁入 Vue 3 单文件组件（SFC）的 `<template>` 中，极大降低从设计稿到生产代码的重构损耗与样式转换成本；
2. **表单双向绑定与交互效率**：
   - 10 大算命功能表单包含日期滚轮、性别乾坤切换、公历农历切换、多选期望、图片拖拽上传等复杂字段，Vue 3 的 `v-model` 提供极简、直观的数据收集与校验机制；
3. **极小打包体积与极快首屏**：
   - Vue 3 核心运行时仅约 33KB gzip，配合 Vite 的 Tree-shaking，整体单页包体极轻，确保在移动端 2G/3G/4G 弱网环境下百毫秒内加载完成；
4. **状态隔离与共享**：
   - Pinia 负责全局管理钱包连接状态、游客 ID、剩余免费次数、当前推演进度草稿以及最近生成的报告缓存。

---

## 3. AI 引擎边缘适配：SDK 运行、D1 持久化与无盘虚拟知识库

### 背景与上下文
`/ssd0/git/AI-Session-NodeJS` SDK 具备多 Provider 适配、会话管理、自动 Context Compact 及知识库 RAG 能力，但 Cloudflare Worker 运行于 V8 隔离环境，无法读取本地物理磁盘，且多实例无状态。

### 决策内容
1. **启用 `nodejs_compat`**：
   - 在 `wrangler.jsonc` 中配置 `"compatibility_flags": ["nodejs_compat"]`，支持 SDK 依赖的 `node:crypto`。
2. **D1 持久化存储适配器**：
   - 实现 `D1SessionStorage` 接入 Cloudflare D1，实现跨机器实例的会话恢复与历史追踪。
3. **构建期虚拟知识包（Virtual RAG Bundle）**：
   - 将 10 大门类（相学、八字、合婚、数字能量、姓名学、奇门、择日等）的 Markdown 知识库在前端/Worker 构建时预处理打包为内存静态字典 `knowledge-bundle.json`。
   - 运行时直接将对应的知识片段字典传递给 `system.files`，由 SDK 在 Worker 内存中进行自动分块与关键词 RAG 召回，零宿主机文件系统依赖。

---

## 4. 多模态图像处理与客户端预压缩策略

### 背景与上下文
P04/P05「AI看相」功能支持用户上传面部、手掌或面手双图。原始手机拍摄的照片通常高达 5MB~20MB，远超 Cloudflare 免费版单个请求 Body 限制，且会导致上游多模态大模型延迟飙升。

### 决策内容
1. **客户端 Canvas 预压缩**：
   - 在移动端前端利用 HTML5 `<canvas>` 将照片等比缩放至最大边 1024px，转为 WebP / JPEG 格式（Quality: 0.8），单张照片体积压缩至 100KB~250KB。
2. **Base64 多模态安全封装**：
   - 压缩后的图像直接作为 Base64 Data URL 随推演请求发送，SDK 自动组装为 OpenAI / Gemini 兼容的 Vision Content Block。
3. **临时缓存与隐私保护**：
   - 图片仅用于单次推演计算，不在数据库中永久保留原始高清大图，符合 UI 界面上承诺的“隐私安全承诺：测算完成后定期自动清除”。

---

## 5. 分级交付与付费墙机制 (Two-Tier Paywall)

### 背景与上下文
商业化模型要求既能吸引用户快速体验，又能驱动付费转化（单次测算 6 USDT，会员 8 折）。

### 决策内容
1. **P07 免费预览报告 (Free Preview)**：
   - 每次推演完成后，服务端先输出综合结论（3-4 段）、三大核心评分指数（财运/事业/姻缘分数）。
   - 下方章节内容在 CSS 上使用 `backdrop-filter: blur(8px)` 高斯模糊遮罩，并罗列解锁权益（完整命盘解析、流年运势、吉凶方位、PDF下载）。
2. **解锁完整报告 (Full Report)**：
   - 新用户赠送 2 次免费测算额度，可直接全额抵扣；
   - 消耗完毕后支持通过 USDT-TRC20 / USDT-ERC20 模拟/真实支付，或开通 VIP 会员；
   - 支付成功后在 D1 中将订单状态标记为 `COMPLETED` 并更新报告为 `is_unlocked = 1`，前端自动平滑移除模糊遮罩，展开分章手风琴。

---

## 6. 推广分销与裂变返佣机制 (Referral Engine)

### 决策内容
1. **激活门槛**：用户完成首次付费测算（或开通会员）后，系统自动为其生成唯一的 7 位大写字母数字推荐码（如 `TJ8K2M9`）。
2. **两级分润**：
   - 直推奖励：15%（6 USDT 订单直返 0.90 USDT）；
   - 间推奖励：5%（6 USDT 订单间返 0.30 USDT）。
3. **提现管理**：
   - 可提现余额满 10 USDT 可申请提现；
   - 平台统一扣除 1 USDT 网络手续费；
   - 申请记录写入 D1 `withdrawals` 表，便于审计核销。
