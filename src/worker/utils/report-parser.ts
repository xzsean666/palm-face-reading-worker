import type { DivinationCategory } from "../db/types";
import type { GeneratedDivinationOutput } from "../ai/prompts/types";
import { CATEGORY_NAMES } from "../ai/prompts";

/**
 * 从模型输出文本中提取并解析 JSON 对象
 */
export function parseAIOutput(rawText: string, category: DivinationCategory): GeneratedDivinationOutput {
  let cleaned = rawText.trim();

  // 去除 markdown 标记
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // 寻找最外层的 {}
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.preview && parsed.full_report) {
      return {
        preview: {
          score: typeof parsed.preview.score === "number" ? parsed.preview.score : 88,
          rating: parsed.preview.rating || "天运吉相",
          title: parsed.preview.title || `${CATEGORY_NAMES[category]}·大吉乾元局`,
          summary: parsed.preview.summary || "推演显示气运流通顺遂，吉星高照。",
          highlights: Array.isArray(parsed.preview.highlights) ? parsed.preview.highlights : ["五行生化有情", "大运顺行逢贵", "福泽深远"],
          radar: Array.isArray(parsed.preview.radar) ? parsed.preview.radar : [
            { label: "先天势能", value: 88 },
            { label: "事业前程", value: 85 },
            { label: "财帛聚散", value: 92 },
            { label: "情缘和顺", value: 82 },
            { label: "福寿安康", value: 90 },
          ],
        },
        full_report: {
          overview: parsed.full_report.overview || "此局天人合发，机运天成，深得古法易理与时空相生之妙。",
          chapters: Array.isArray(parsed.full_report.chapters) ? parsed.full_report.chapters : createDefaultChapters(category),
          blessingAdvice: Array.isArray(parsed.full_report.blessingAdvice) ? parsed.full_report.blessingAdvice : [
            "存好心、说好话、行好事，以正道修心立德。",
            "逢关键转折节点宜稳扎稳打，切忌冒进投机。",
            "多近贵人与正能量圈层，相由心生，境随心转。",
          ],
        },
      };
    }
  } catch {
    // 解析失败则走保底回退
  }

  return generateFallbackReport(category);
}

/**
 * 缺省章节构造器
 */
export function createDefaultChapters(category: DivinationCategory) {
  const name = CATEGORY_NAMES[category] || "天机推演";
  return [
    {
      id: "chapter_origin",
      title: "【第一章】先天命格与气数渊源",
      tag: "天命底色",
      content: `根据《${name}精要》正统推演，当事人之先天命格得天地中和之气，神藏气聚。五行气局各司其职，虽有微细冲合，但有正印与通关吉神护身，早岁虽有砥砺，后劲绵长。`,
    },
    {
      id: "chapter_career",
      title: "【第二章】事业宏图与行商赛道",
      tag: "仕途财运",
      content: `事业宫吉星高照，主做事有章法、魄力内敛。若在科技、文化、商贸或专业技术领域深耕，必得行业贵人赏识。中年后食伤生财有道，正财稳固而偏财亦有机缘。`,
    },
    {
      id: "chapter_love",
      title: "【第三章】情缘因果与六亲交感",
      tag: "良缘和合",
      content: `情感气场温润细腻，与伴侣相处重在理念契合与精神共鸣。遇事多包容沟通，善用通关智慧化解口舌，可收琴瑟和鸣、家宅安泰之效。`,
    },
    {
      id: "chapter_future",
      title: "【第四章】未来流年关键转折机运",
      tag: "大运拐点",
      content: `推演未来周期，逢关键流年大运岁临喜用神，将迎来自我突破与身份蜕变之重大契机。建议提前三年储备资粮，待春风吹拂之时顺势而起。`,
    },
  ];
}

/**
 * 生成保底推演报告（用于离线模拟或错误防御）
 */
export function generateFallbackReport(category: DivinationCategory): GeneratedDivinationOutput {
  const catName = CATEGORY_NAMES[category] || "天机测算";
  return {
    preview: {
      score: 89,
      rating: "天运吉相",
      title: `${catName}·紫气东来聚吉格`,
      summary: `根据传统易理全息推演，当事人天命底色纯正，气机舒展，五行生克流通有情，展现出极强的抗压韧性与远大发展潜力。`,
      highlights: [
        "命理气象高远，得贵人与吉星暗中相助",
        "财源与事业根基深厚，中年之后渐入佳境",
        "善用本命喜用神，可收化煞为祥之奇效",
      ],
      radar: [
        { label: "先天潜能", value: 89 },
        { label: "事业功名", value: 86 },
        { label: "财源纳福", value: 92 },
        { label: "情感交泰", value: 83 },
        { label: "安康气色", value: 91 },
      ],
    },
    full_report: {
      overview: `此【${catName}】全息命局依据《易经》阴阳之道及相关传世典籍排布推演。通盘观之，当事人秉中正之气，虽偶有逆境磨砺，实为玉汝于成。`,
      chapters: createDefaultChapters(category),
      blessingAdvice: [
        "相由心生，境随心转；日行一善，广结善缘。",
        "在关键流年与重大抉择关头，戒骄戒躁，以静制动。",
        "善调身心阴阳平衡，劳逸结合，福寿自长。",
      ],
    },
  };
}
