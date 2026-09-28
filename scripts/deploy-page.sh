#!/usr/bin/env bash
set -e

# ==============================================================================
# 天机 AI预测大师 - Cloudflare Pages 一键自动化部署脚本
# 包含：国学知识库编译 -> 前端 SPA 打包 -> Edge Function 单文件打包 -> Pages 发布
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "================================================================"
echo "🚀 开始构建与部署「天机 AI预测大师」至 Cloudflare Pages"
echo "================================================================"

# 1. 执行全量构建 (国学知识库 + 前端 SPA + 边缘 Worker _worker.js)
echo "📦 [1/2] 正在执行全量优化构建 (知识库 + SPA 代码分割 + 边缘 Worker)..."
pnpm run build

# 2. 发布至 Cloudflare Pages
echo "☁️  [2/2] 正在上传发布至 Cloudflare Pages (palm-face-reading)..."
export NODE_OPTIONS="--dns-result-order=ipv4first"
# 过滤代理环境变量避免 undici 代理卡死
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u all_proxy -u ALL_PROXY \
  node node_modules/wrangler/wrangler-dist/cli.js pages deploy dist-client \
    --project-name=palm-face-reading \
    --branch=main \
    --commit-dirty=true

echo "================================================================"
echo "🎉 部署完成！访问地址: https://palm-face-reading.pages.dev"
echo "================================================================"
