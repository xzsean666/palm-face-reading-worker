import { describe, it, expect } from "vitest";
import {
  getSystemPrompt,
  buildUserDivinationPrompt,
  CATEGORY_OUTPUT_REQUIREMENTS,
} from "../../src/worker/ai/prompts";
import {
  createDefaultChapters,
  generateFallbackReport,
  parseAIOutput,
} from "../../src/worker/utils/report-parser";
import knowledgeBundle from "../../src/worker/ai/knowledge-bundle.json";

describe("Prompts, Knowledge & Report Parser Enhancement Tests", () => {
  it("【择日吉日】系统提示词必须包含起止日期推演、精选吉日列表、黄金吉时与避煞要求", () => {
    const sysPrompt = getSystemPrompt("auspicious_date");
    expect(sysPrompt).toContain("【首选良辰吉日精选清单及干支万年历排盘】");
    expect(sysPrompt).toContain("精选吉日列表");
    expect(sysPrompt).toContain("【黄金吉时与良辰贵人时段精析】");
    expect(sysPrompt).toContain("冲煞生肖与当日煞方");
    expect(sysPrompt).toContain("建除十二神");
  });

  it("【择日吉日】用户输入提示词应精准注入起止日期范围与主事人信息", () => {
    const userPrompt = buildUserDivinationPrompt("auspicious_date", {
      event: "结婚嫁娶",
      startDate: "2026-10-01",
      endDate: "2026-10-31",
      birthDate: "1995-08-08",
      birthTime: "午时 (11:00 - 13:00)",
      city: "北京",
    });

    expect(userPrompt).toContain("结婚嫁娶");
    expect(userPrompt).toContain("2026-10-01");
    expect(userPrompt).toContain("2026-10-31");
    expect(userPrompt).toContain("必须在【2026-10-01】至【2026-10-31】这一具体时间区间内");
    expect(userPrompt).toContain("精选出 3 至 5 个最适合【结婚嫁娶】的上上吉日");
  });

  it("【择日吉日】保底报告必须包含具体的公历/农历吉日列表与时辰，绝不可空洞无物", () => {
    const report = generateFallbackReport("auspicious_date");
    expect(report.preview.title).toContain("首选上上吉日");
    expect(report.preview.title).toContain("2026年");
    expect(report.preview.highlights.some((h) => h.includes("首选吉日"))).toBe(true);

    const dateChapter = report.full_report.chapters.find((c) => c.id === "chapter_dates");
    expect(dateChapter).toBeDefined();
    expect(dateChapter!.content).toContain("2026年10月18日");
    expect(dateChapter!.content).toContain("丙午年");
    expect(dateChapter!.content).toContain("成日");
    expect(dateChapter!.content).toContain("青龙黄道吉日");
    expect(dateChapter!.content).toContain("冲牛煞西");

    const hourChapter = report.full_report.chapters.find((c) => c.id === "chapter_hours");
    expect(hourChapter).toBeDefined();
    expect(hourChapter!.content).toContain("巳时");
    expect(hourChapter!.content).toContain("09:58");
  });

  it("【个人起名】保底与章节必须包含不少于 5 套具有诗词出处的吉名方案", () => {
    const report = generateFallbackReport("personal_naming");
    const nameChapter = report.full_report.chapters.find((c) => c.id === "chapter_names");
    expect(nameChapter).toBeDefined();
    expect(nameChapter!.content).toContain("景行");
    expect(nameChapter!.content).toContain("昭华");
    expect(nameChapter!.content).toContain("诗经");
  });

  it("【公司取名】保底与章节必须包含商号方案、行业五行与品牌口号", () => {
    const report = generateFallbackReport("company_naming");
    const brandChapter = report.full_report.chapters.find((c) => c.id === "chapter_brands");
    expect(brandChapter).toBeDefined();
    expect(brandChapter!.content).toContain("华盛智达");
    expect(brandChapter!.content).toContain("品牌 Slogan");
  });

  it("【知识库编译】knowledge-bundle.json 必须完整包含 auspicious_date 的择日历法与吉时秘笈", () => {
    const bundle = (knowledgeBundle as any)["auspicious_date"];
    expect(bundle).toBeDefined();
    expect(bundle["wannianli_zejiri_biao.md"]).toBeDefined();
    expect(bundle["shichen_liangchen_jiri.md"]).toBeDefined();
    expect(bundle["wannianli_zejiri_biao.md"]).toContain("协纪辨方书");
    expect(bundle["shichen_liangchen_jiri.md"]).toContain("青龙黄道推排口诀");
  });
});
