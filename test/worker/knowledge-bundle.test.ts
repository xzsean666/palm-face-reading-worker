import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  CATEGORY_NAMES,
  getSystemPrompt,
  buildUserDivinationPrompt,
} from "../../src/worker/ai/prompts";
import type { DivinationCategory } from "../../src/worker/db/types";

describe("Knowledge Bundle & Prompts", () => {
  const bundlePath = path.resolve(__dirname, "../../src/worker/ai/knowledge-bundle.json");

  it("knowledge-bundle.json 应存在且为有效 JSON", () => {
    expect(fs.existsSync(bundlePath)).toBe(true);
    const raw = fs.readFileSync(bundlePath, "utf-8");
    const json = JSON.parse(raw);
    expect(json).toBeTypeOf("object");
  });

  const categories: DivinationCategory[] = [
    "palm_face",
    "love_match",
    "phone_plate",
    "name_test",
    "auspicious_date",
    "future_fortune",
    "bazi",
    "qimen_decision",
    "personal_naming",
    "company_naming",
  ];

  it("knowledge-bundle 应覆盖全部 10 个预测门类，且每门类包含专业切片", () => {
    const raw = fs.readFileSync(bundlePath, "utf-8");
    const bundle = JSON.parse(raw);

    for (const cat of categories) {
      expect(bundle[cat], `门类 ${cat} 应该存在于 knowledge-bundle 中`).toBeDefined();
      const fileCount = Object.keys(bundle[cat]).length;
      expect(fileCount, `门类 ${cat} 的 Markdown 文件数量应 >= 2`).toBeGreaterThanOrEqual(2);
    }
  });

  it("知识库总体积应 < 500 KB，确保 Worker 边缘加载极速", () => {
    const stat = fs.statSync(bundlePath);
    const sizeKb = stat.size / 1024;
    expect(sizeKb).toBeLessThan(500);
  });

  it("所有 10 大门类均应有合法的 System Prompt 与 User Prompt 生成器", () => {
    for (const cat of categories) {
      expect(CATEGORY_NAMES[cat]).toBeDefined();
      const sys = getSystemPrompt(cat);
      expect(sys).toContain("preview");
      expect(sys).toContain("full_report");

      const userPrompt = buildUserDivinationPrompt(cat, { name: "张三", gender: "男" });
      expect(userPrompt).toContain(CATEGORY_NAMES[cat]);
      expect(userPrompt).toContain("张三");
    }
  });
});
