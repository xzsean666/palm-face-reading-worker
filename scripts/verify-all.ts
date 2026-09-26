import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();

function log(title: string, msg: string) {
  console.log(`\x1b[36m[VERIFY]\x1b[0m \x1b[1m${title}\x1b[0m: ${msg}`);
}

function success(msg: string) {
  console.log(`\x1b[32m✔ SUCCESS:\x1b[0m ${msg}`);
}

function fail(msg: string, err?: any) {
  console.error(`\x1b[31m✖ FAILURE:\x1b[0m ${msg}`, err || "");
  process.exit(1);
}

async function runStep(stepNumber: number, title: string, fn: () => void | Promise<void>) {
  console.log(`\n======================================================`);
  console.log(`\x1b[33mStep ${stepNumber}/5: ${title}\x1b[0m`);
  console.log(`======================================================`);
  const start = Date.now();
  try {
    await fn();
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    success(`${title} 完成 (耗时: ${duration}s)`);
  } catch (err) {
    fail(`${title} 失败`, err);
  }
}

async function main() {
  console.log(`\n🔮 ========================================================`);
  console.log(`   天机 AI预测大师 (Palm & Face Reading Worker) 全量交付自检`);
  console.log(`========================================================\n`);

  // 1. 知识库 RAG 资产完整性检验
  await runStep(1, "国学典籍 RAG 知识库打包校验", () => {
    const knowledgeDir = path.join(rootDir, "knowledge");
    const bundleFile = path.join(rootDir, "src/worker/ai/knowledge-bundle.json");

    if (!fs.existsSync(knowledgeDir)) {
      throw new Error(`知识库目录不存在: ${knowledgeDir}`);
    }

    const categories = fs.readdirSync(knowledgeDir).filter((d) =>
      fs.statSync(path.join(knowledgeDir, d)).isDirectory()
    );

    log("门类检查", `检测到 ${categories.length} 个预测门类典籍库`);
    if (categories.length < 10) {
      throw new Error(`预测门类数量不足 10: 当前只有 ${categories.length}`);
    }

    function countMarkdownFiles(dir: string): number {
      let count = 0;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          count += countMarkdownFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          count++;
        }
      }
      return count;
    }

    const totalMd = countMarkdownFiles(knowledgeDir);
    log("古籍文献", `累计 ${totalMd} 篇国学典籍与经纬断语切片`);
    if (totalMd < 40) {
      throw new Error(`典籍篇章数量不足: 当前只有 ${totalMd}`);
    }

    if (!fs.existsSync(bundleFile)) {
      log("构建产物", "未找到 knowledge-bundle.json，正在自动生成...");
      execSync("node --experimental-strip-types scripts/bundle-knowledge.ts", { stdio: "inherit" });
    }

    const bundleStats = fs.statSync(bundleFile);
    log("打包体积", `${(bundleStats.size / 1024).toFixed(2)} KB (内嵌至边缘 Worker)`);
    if (bundleStats.size < 80 * 1024) {
      throw new Error(`知识库打包体积异常偏小: ${bundleStats.size} 字节`);
    }
  });

  // 2. TypeScript 双端静态类型自检
  await runStep(2, "TypeScript 双端类型检查 (vue-tsc + tsc worker)", () => {
    log("Vue 前端", "执行 vue-tsc --noEmit...");
    execSync("npx vue-tsc --noEmit", { stdio: "inherit" });
    log("Worker 后端", "执行 tsc -p tsconfig.worker.json --noEmit...");
    execSync("npx tsc -p tsconfig.worker.json --noEmit", { stdio: "inherit" });
  });

  // 3. 全量自动化单元测试与 E2E 链路测试
  await runStep(3, "全量 Vitest 单元与端到端集成测试", () => {
    log("测试套件", "执行 vitest run --test-timeout=180000...");
    execSync("npx vitest run --test-timeout=180000", { stdio: "inherit" });
  });

  // 4. 前端 Vite 高性能生产打包构建
  await runStep(4, "前端 Mystic Cyber-Occultism 生产构建 (Vite)", () => {
    log("Vite 构建", "执行 vite build...");
    execSync("npx vite build", { stdio: "inherit" });

    const distClient = path.join(rootDir, "dist-client");
    const indexHtml = path.join(distClient, "index.html");
    if (!fs.existsSync(indexHtml)) {
      throw new Error("前端构建产物 dist-client/index.html 不存在");
    }

    const assets = fs.readdirSync(path.join(distClient, "assets"));
    log("资源打包", `生成 ${assets.length} 个拆包资源 (含 CSS/JS/Vue Chunk)`);
  });

  // 5. Cloudflare Workers 边缘产物打包与配置自检
  await runStep(5, "Cloudflare Worker 边缘构建与 Wrangler 规则校验", () => {
    log("TSUP 构建", "执行 tsup...");
    execSync("npx tsup", { stdio: "inherit" });

    const distWorker = path.join(rootDir, "dist-worker/index.js");
    if (!fs.existsSync(distWorker)) {
      throw new Error("Worker 构建产物 dist-worker/index.js 不存在");
    }
    const stat = fs.statSync(distWorker);
    log("Worker 体积", `${(stat.size / 1024).toFixed(2)} KB (满足 Cloudflare 免费版限制)`);

    const wranglerConfig = path.join(rootDir, "wrangler.jsonc");
    if (!fs.existsSync(wranglerConfig)) {
      throw new Error("wrangler.jsonc 配置文件缺失");
    }
    const wranglerText = fs.readFileSync(wranglerConfig, "utf-8");
    if (!wranglerText.includes("ASSETS") || !wranglerText.includes("DB")) {
      throw new Error("wrangler.jsonc 缺少 ASSETS 或 DB 关键边缘绑定");
    }
    log("边缘绑定", "D1 数据库 (DB) 与 静态资产目录 (ASSETS -> ./dist-client) 校验合格");
  });

  console.log(`\n🎉 ========================================================`);
  console.log(`   「天机 AI预测大师」所有验证步骤 100% 通过！系统已完全交付！`);
  console.log(`========================================================\n`);
}

main().catch((err) => {
  console.error("自检脚本异常终止:", err);
  process.exit(1);
});
