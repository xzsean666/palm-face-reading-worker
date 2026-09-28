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
      const rawRadar = Array.isArray(parsed.preview.radar) ? parsed.preview.radar : [];
      const defaultRadar = getDefaultRadar(category);
      let radar = rawRadar.length >= 4 ? rawRadar : [...rawRadar];
      if (radar.length < 5) {
        const existingLabels = new Set(radar.map((r: any) => r.label));
        for (const item of defaultRadar) {
          if (radar.length >= 5) break;
          if (!existingLabels.has(item.label)) {
            radar.push(item);
          }
        }
      }

      const defaultChapters = createDefaultChapters(category);
      const chapters = normalizeChapters(parsed.full_report.chapters, defaultChapters);
      const blessingAdvice = normalizeBlessingAdvice(parsed.full_report.blessingAdvice, category);

      return {
        preview: {
          score: typeof parsed.preview.score === "number" ? parsed.preview.score : 92,
          rating: parsed.preview.rating || "天运吉相",
          title: parsed.preview.title || getDefaultTitle(category),
          summary: parsed.preview.summary || getDefaultSummary(category),
          highlights: Array.isArray(parsed.preview.highlights) && parsed.preview.highlights.length >= 2
            ? parsed.preview.highlights
            : getDefaultHighlights(category),
          radar,
        },
        full_report: {
          overview: parsed.full_report.overview || getDefaultOverview(category),
          chapters,
          blessingAdvice,
        },
      };
    }
  } catch {
    // 解析失败则走保底回退
  }

  return generateFallbackReport(category);
}

export function normalizeBlessingAdvice(items: any[] | undefined, category: DivinationCategory): any[] {
  if (!Array.isArray(items) || items.length === 0) {
    return getDefaultBlessingAdvice(category);
  }
  return items.map((item) => {
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          return {
            title: parsed.title || parsed.name || "开运指引",
            content: parsed.content || parsed.desc || parsed.text || trimmed,
          };
        } catch {}
      }
      return item;
    }
    if (typeof item === "object" && item !== null) {
      return {
        title: item.title || item.name || "开运指引",
        content: item.content || item.text || item.advice || item.desc || Object.values(item).join("，"),
      };
    }
    return String(item);
  });
}

export function normalizeChapters(chapters: any[] | undefined, defaultChapters: any[]): any[] {
  if (!Array.isArray(chapters) || chapters.length < 3) {
    return defaultChapters;
  }

  // 计算章节平均字数，如果大模型输出的篇幅严重不足（如单句敷衍），则融合知识库大纲深度扩充
  const totalLength = chapters.reduce((sum, ch) => {
    const text = typeof ch.content === "string" ? ch.content : JSON.stringify(ch.content || "");
    return sum + text.length;
  }, 0);

  const isTooShort = totalLength < 500 || (totalLength / chapters.length) < 130;

  return chapters.map((ch, idx) => {
    let content = ch.content;
    if (typeof content !== "string") {
      if (typeof content === "object" && content !== null) {
        content = Object.entries(content)
          .map(([k, v]) => `**${k}**：${typeof v === "object" ? JSON.stringify(v) : v}`)
          .join("\n\n");
      } else {
        content = String(content || "");
      }
    }

    const fallbackCh = defaultChapters[idx] || defaultChapters[0];

    // 如果章节字数过短（如只有两三句话），将大模型个性化输出置顶，随后追加知识库详批规范，确保内容充实详实
    if (isTooShort || content.trim().length < 130) {
      if (fallbackCh && fallbackCh.content) {
        content = content.trim() ? `${content.trim()}\n\n${fallbackCh.content}` : fallbackCh.content;
      }
    }

    // 纠正大模型使用整句话作为章节标题的不规范情况
    let title = ch.title || "";
    const isInvalidTitle = !title || title.length > 25 || (!title.includes("章") && !title.includes("【") && !title.includes("节"));
    if (isInvalidTitle && fallbackCh?.title) {
      title = fallbackCh.title;
    }

    return {
      id: ch.id || fallbackCh?.id || `chapter_${idx + 1}`,
      title: title || `第${idx + 1}章`,
      tag: ch.tag || fallbackCh?.tag || undefined,
      content,
    };
  });
}

function getDefaultRadar(category: DivinationCategory) {
  if (category === "auspicious_date") {
    return [
      { label: "天时气象", value: 96 },
      { label: "地利生旺", value: 92 },
      { label: "主命契合", value: 95 },
      { label: "吉神护佑", value: 98 },
      { label: "事态亨通", value: 94 },
    ];
  }
  if (category === "love_match") {
    return [
      { label: "天合地合", value: 95 },
      { label: "性格默契", value: 90 },
      { label: "五行互补", value: 92 },
      { label: "福泽绵长", value: 88 },
      { label: "白头偕老", value: 94 },
    ];
  }
  if (category === "phone_plate") {
    return [
      { label: "天医财星", value: 94 },
      { label: "延年贵人", value: 91 },
      { label: "出行平安", value: 96 },
      { label: "磁场调和", value: 89 },
      { label: "八星总合", value: 93 },
    ];
  }
  if (category === "personal_naming" || category === "company_naming" || category === "name_test") {
    return [
      { label: "三才吉数", value: 96 },
      { label: "五音音律", value: 93 },
      { label: "用神互补", value: 98 },
      { label: "文化意境", value: 95 },
      { label: "运势加持", value: 92 },
    ];
  }
  if (category === "qimen_decision") {
    return [
      { label: "天时机遇", value: 92 },
      { label: "地利门道", value: 88 },
      { label: "人和贵助", value: 95 },
      { label: "格局胜算", value: 94 },
      { label: "避险破局", value: 90 },
    ];
  }
  return [
    { label: "先天势能", value: 90 },
    { label: "事业前程", value: 88 },
    { label: "财帛聚散", value: 95 },
    { label: "情缘和顺", value: 86 },
    { label: "福寿安康", value: 92 },
  ];
}

function getDefaultTitle(category: DivinationCategory): string {
  switch (category) {
    case "auspicious_date":
      return "首选上上吉日：2026年10月18日(农历九月初九)·成日青龙黄道";
    case "personal_naming":
      return "首选天赐吉名：景行·木火通明富贵格";
    case "company_naming":
      return "首选大吉商号：华盛智达·金水相生大业格";
    case "phone_plate":
      return "数字能量测算·天医延年伏位聚吉格";
    case "name_test":
      return "测姓名店名·三才相生富贵荣达格";
    case "love_match":
      return "双人合婚推演·琴瑟和鸣天作之合";
    case "qimen_decision":
      return "奇门遁甲决疑·青龙转光胜券在握局";
    case "future_fortune":
      return "未来流年运程·紫气东来岁运亨通格";
    case "bazi":
      return "正统子平八字·正官配印食神生财格";
    case "palm_face":
    default:
      return "面手全息相法·天圆地方朝拱聚财格";
  }
}

function getDefaultSummary(category: DivinationCategory): string {
  switch (category) {
    case "auspicious_date":
      return "依钦天监《协纪辨方书》推算，在所选周期内严选出4个百福骈臻之吉日。首选2026年10月18日（丙午年戊戌月乙未日），成日与青龙黄道吉神照临，主生旺主事人元神，黄金仪式宜取巳时与辰时。";
    case "personal_naming":
      return "命主八字元神清贵，五行木火相涵。名字立足喜用神补救，精选兼备《诗经》《楚辞》文雅底蕴之天赐佳名方案，音律和谐，前程宏阔。";
    case "company_naming":
      return "立足行业赛道五行与法人八字喜用神，商号纳财数理合于洛书大吉之数，品牌心智明晰，具备强大的商业穿透力与长久信誉度。";
    case "phone_plate":
      return "号码磁场中天医与延年吉星当令，洛书数理生旺机主八字喜用，正财丰隆、出入平安，整体呈现良性能量循环。";
    case "name_test":
      return "名字三才五格格局端正，天人地三才相生有情，八十一数理逢大吉之数，音律跌宕起伏，极具辨识度与气运福泽。";
    case "love_match":
      return "双方八字日柱干支天合地合，六十甲子纳音五行生克有情，十神性格互补极佳，遇事共商共济，乃百年好合之美局。";
    case "qimen_decision":
      return "奇门起局得吉门开门受生，九星辅弼相助，时干落生旺之宫，综合胜算率高达 82%，顺势推进必见丰厚回报。";
    case "future_fortune":
      return "未来周期岁运临喜用神，岁君引动禄马交驰，将迎来自我突破与事业财富跃升之黄金窗口，宜顺势而为。";
    case "bazi":
      return "日主元神中正不偏，月令财官印绶各得其所，大运顺行逢天乙贵人与喜用神调候，后劲绵长，大器晚成。";
    case "palm_face":
    default:
      return "面相三停匀称、五岳朝拱，手相掌纹深长清晰无杂乱煞纹，掌丘饱满红润，主心智果决、聚财纳福之良格。";
  }
}

function getDefaultHighlights(category: DivinationCategory): string[] {
  switch (category) {
    case "auspicious_date":
      return [
        "首选吉日：2026-10-18 (成日青龙黄道)",
        "黄金仪式吉时：巳时 (09:18 - 10:58)",
        "天德月德照临，百福俱全",
        "冲煞避忌：冲牛煞西 (属牛者退避)",
      ];
    case "personal_naming":
      return [
        "首选吉名：景行 (《诗经·小雅》)",
        "喜用神互补：木火相生",
        "三才数理：大吉兴隆 98分",
        "音律五音：宫商角徵平仄流转",
      ];
    case "company_naming":
      return [
        "首选字号：华盛智达",
        "行业五行相生：水火通明",
        "数理诱导：24数 (大展鸿图·家门余庆)",
        "品牌定位：科技聚财·国际视野",
      ];
    case "phone_plate":
      return [
        "核心磁场：天医 13/31 财帛盈门",
        "生助磁场：延年 19/91 事业统御",
        "洛书五行：金水相涵利行商",
        "出入平安：伏位稳健辟邪避灾",
      ];
    case "name_test":
      return [
        "天格人格地格：水木相生大吉",
        "总格数理：31 数 (智勇双全大立成功)",
        "音律声调：平仄协调朗朗上口",
        "八字契合：精准补足命局所需",
      ];
    case "love_match":
      return [
        "日柱天干：甲己中正之合",
        "纳音五行：海中金遇大溪水相生",
        "生肖契合：三合相生无刑冲",
        "白头偕老：夫妻宫清和有度",
      ];
    case "qimen_decision":
      return [
        "格局断语：青龙转光·得贵相助",
        "天时胜算：综合评估 82%",
        "有利时空：东方震宫、东南巽宫",
        "贵人相辅：行业长者鼎力支持",
      ];
    case "future_fortune":
      return [
        "运势上升期：未来三年逐年递增",
        "转折拐点：岁在丙午夏秋之交",
        "正偏财源：开源有道广聚四海",
        "调候用神：善用木火扶抑元神",
      ];
    case "bazi":
      return [
        "日主元神：戊土端凝厚德载物",
        "格调气象：正印格透杀化权",
        "大运趋势：顺行吉地步步生莲",
        "福泽根基：祖荫丰厚后劲绵长",
      ];
    case "palm_face":
    default:
      return [
        "面相三停：上停天庭饱满早年发越",
        "十二宫位：财帛鼻准丰隆聚财",
        "手相三大线：生命线长深事业线清晰",
        "掌丘气色：水星丘木星丘红润光泽",
      ];
  }
}

function getDefaultOverview(category: DivinationCategory): string {
  const catName = CATEGORY_NAMES[category] || "天机推演";
  return `此局依据《${catName}全书》与正统国学典籍排布推演。通盘观之，当事人秉中正祥和之气，天时地利人和俱全，虽偶有微细冲克，但有吉神与通关智慧护佑，气机顺达，诸事可期。`;
}

function getDefaultBlessingAdvice(category: DivinationCategory): string[] {
  switch (category) {
    case "auspicious_date":
      return [
        "用事当日保持心情喜悦平和，口出吉利之言，自感召天地祥瑞。",
        "核心启动仪式严格依吉时节点推进，生肖冲煞者暂避三步观礼即可化解。",
        "仪式完毕多与亲朋同享福食喜果，聚敛八方人气与财禄气场。",
      ];
    case "personal_naming":
      return [
        "常唤吉祥美名，名字即为终身随行之声波能量场，常唤则气场日渐凝聚。",
        "注重立德修身，使名与德相得益彰，知行合一以致远大。",
        "逢升学、成年及人生重大节点，可制一枚吉印长伴左右加持运势。",
      ];
    case "company_naming":
      return [
        "商号定名后，企业VI色彩建议严格呼应行业五行生克色调。",
        "经商以诚信合规为本，信誉即是商号最大的无形资产与风水磁场。",
        "开市挂牌选定良辰吉时鸣炮揭幕，先声夺人，汇聚商脉。",
      ];
    default:
      return [
        "相由心生，境随心转；日行一善，广结善缘。",
        "在关键流年与重大抉择关头，戒骄戒躁，以静制动。",
        "善调身心阴阳平衡，劳逸结合，福寿自长。",
      ];
  }
}

/**
 * 缺省章节构造器：为全 10 大门类出具真实深度且包含具体列表的报告章节
 */
export function createDefaultChapters(category: DivinationCategory) {
  if (category === "auspicious_date") {
    return [
      {
        id: "chapter_dates",
        title: "【首选良辰吉日精选清单及干支万年历排盘】",
        tag: "精选吉日列表",
        content: `根据钦天监《协纪辨方书》推算，在缘主所选时间范围内，经过建除十二神、青龙明堂六黄道吉神及冲煞严选，为您精选以下【4个上上良辰吉日】：

### 🏆 吉日一（首选上上大吉·★★★★★）
- **【公历日期】**：2026年10月18日 星期日
- **【农历干支】**：丙午年 戊戌月 乙未日
- **【建除值日】**：成日（万事大成，开市、嫁娶、乔迁、动土第一吉日）
- **【黄道值神】**：青龙黄道吉日（天乙贵人乘旺，百邪回避，万事亨通）
- **【吉神宜趋】**：天德合、月德、岁德、三合、天喜、玉堂、母仓
- **【凶煞宜忌】**：忌诉讼词讼；小耗不碍大局
- **【冲煞避忌】**：冲牛煞西（岁冲辛丑，生肖属牛者用事仪式退避三舍，用事方位忌向正西动土启程）
- **【用事评级】**：上上元吉，诸事通达，福泽深远

### 🌟 吉日二（次选开运大吉·★★★★★）
- **【公历日期】**：2026年10月22日 星期四
- **【农历干支】**：丙午年 戊戌月 己亥日
- **【建除值日】**：开日（豁然开朗，商贾开市、乔迁移徙大吉）
- **【黄道值神】**：司命黄道吉日（寿考福禄，文昌得位）
- **【吉神宜趋】**：母仓、天愿、六合、天财、五富
- **【凶煞宜忌】**：忌安葬修坟；忌远涉风浪
- **【冲煞避忌】**：冲蛇煞西（属蛇者避用第一剪彩/进门仪式）
- **【用事评级】**：大吉，特别利于开业开市、签约经商与入宅迎财

### 🌿 吉日三（备选安定良吉·★★★★☆）
- **【公历日期】**：2026年10月28日 星期三
- **【农历干支】**：丙午年 戊戌月 乙巳日
- **【建除值日】**：定日（基石永固，买卖立契、缔结良缘大吉）
- **【黄道值神】**：明堂黄道吉日（贵人高照，声名远扬）
- **【吉神宜趋】**：天德、阳德、守日、吉期
- **【凶煞宜忌】**：往亡日小忌；避正南三煞方
- **【冲煞避忌】**：冲猪煞东（生肖属猪者退避）
- **【用事评级】**：上吉，根基扎实，主家业长青

### 💎 吉日四（增补兴旺吉日·★★★★☆）
- **【公历日期】**：2026年11月06日 星期五
- **【农历干支】**：丙午年 己亥月 甲寅日
- **【建除值日】**：执日（固守基业，修造兴工、求财大吉）
- **【黄道值神】**：金匮黄道吉日（财帛盈库，万宝来聚）
- **【吉神宜趋】**：岁德合、天德、福生、禄库
- **【冲煞避忌】**：冲猴煞北（生肖属猴者避用）
- **【用事评级】**：上吉，财源茂盛，万事顺遂`,
      },
      {
        id: "chapter_hours",
        title: "【黄金吉时与良辰贵人时段精析】",
        tag: "良辰吉时",
        content: `古语云：“年利不如月德，月德不如日吉，日吉不如时良。”针对精选吉日，特排定具体黄金仪式时辰如下：

### ⏰ 首选吉日（10月18日）黄金时段推演
1. **【辰时（07:00 - 09:00）·天乙生旺时】**：青龙当值，日光初升，气运蒸腾。迎亲车队出发或开门揭幕最佳时刻建议为 **08:18 或 08:28**。
2. **【巳时（09:00 - 11:00）·明堂聚财时】**：日照中天，财帛星照临。签约交易、开市鸣炮、动土第一锹土最佳黄金时刻为 **09:58 或 10:18**。
3. **【未时（13:00 - 15:00）·贵人相生时】**：主宾尽欢，福泽满堂。适合宴请宾朋与正式宣告礼成。
4. **【当日忌用凶时】**：午时犯日破，子午对冲，谨防人员急躁口角，重大礼仪请避开 11:30 - 12:30 区间。`,
      },
      {
        id: "chapter_compatibility",
        title: "【主事人生辰八字合局与冲克煞气化解】",
        tag: "本命合生",
        content: `选定之首选吉日日柱（乙未）木土相生，与主事人命宫气运呼应，具有极其显著的扶抑生旺功效。

### 🛡️ 随行冲煞属相现场化解法则
- 若现场核心亲朋或合伙人中有生肖属牛（丑未冲）或属狗（丑戌未三刑）者，用事“第一关键时刻”（如下第一铲、开门第一步、签约落笔）宜退至三步之外观礼；
- 待仪式完成后再行入座交流，并建议当天随身佩戴红色或紫色织物作为通关化煞护身之用，则诸事无虞。`,
      },
      {
        id: "chapter_ceremony",
        title: "【用事专属正统科仪仪轨与迎祥开运指南】",
        tag: "科仪指引",
        content: `### 🏮 进门与启动正统规矩
- **乔迁/开业**：必须由主事人亲自引领，双手捧火炉、招财金米或核心财物进门，口念“吉日良辰，紫气东来，万事亨通”；
- **安神进宅**：入室后第一件事先开水龙头（细水长流）、开全室灯光（光明普照）、开窗通风（财气流通）。
- **动土修造**：自东南生旺吉方下第一锹土，顺时针环绕，煞方最后动土，上香三支敬奉八方地祇。`,
      },
    ];
  }

  if (category === "personal_naming") {
    return [
      {
        id: "chapter_bazi",
        title: "【生辰八字五行生克与喜用神诊断】",
        tag: "命局用神",
        content: `命主生辰干支八字五行流通有情，日主元神清秀，天干透出文明之象。五行推演显示命局偏重于金水，略欠木火通明之气。因此起名治本之道当以【木】为用神，以【火】为喜神，以五音角音与徵音配合，调和阴阳，扶抑元神。`,
      },
      {
        id: "chapter_names",
        title: "【天赐吉名推荐方案库（精选 5 套深度推荐）】",
        tag: "吉名方案",
        content: `根据命主喜用神与古典经籍典故，宗师严选以下 5 套高分吉名方案：

### 方案一：【景行】(Jǐng Xíng) · 得分 98 分
- **【五行属性】**：木火相生 (景属木，行属水木相生)
- **【典籍出处】**：《诗经·小雅·车舝》：“高山仰止，景行行止。”
- **【文化寓意】**：景仰崇高品格，行为光明磊落。主学业卓荦，为人方正大度，得万人敬仰。
- **【三才数理】**：天格大吉、人格兴隆、地格福寿，总格大成。

### 方案二：【昭华】(Zhāo Huá) · 得分 96 分
- **【五行属性】**：火木通明 (昭属火，华属木)
- **【典籍出处】**：《楚辞·九思·疾世》：“宝思昭华兮，宛若神龙。”
- **【文化寓意】**：才华昭彰如日月光华，气质优雅超逸，未来事业必具强大领袖魅力与行业号召力。

### 方案三：【承德】(Chéng Dé) · 得分 95 分
- **【五行属性】**：金土相生 (承属金，德属土火)
- **【典籍出处】**：《周易·坤卦》：“君子以厚德载物，承天顺位。”
- **【文化寓意】**：承继天地之德，底蕴深厚，抗压能力强，中年后必见大器晚成。

### 方案四：【润泽】(Rùn Zé) · 得分 94 分
- **【五行属性】**：水水相涵生木
- **【典籍出处】**：《周易·说卦传》：“润万物者莫润乎水。”
- **【文化寓意】**：性情温润如玉，福泽延绵，善结善缘，一生多得长辈与贵人恩泽庇佑。

### 方案五：【蔚然】(Wèi Rán) · 得分 95 分
- **【五行属性】**：木火相涵 (蔚属木，然属火)
- **【典籍出处】**：欧阳修《醉翁亭记》：“望之蔚然而深秀者，琅琊也。”
- **【文化寓意】**：生机勃勃，学识宏富，文思泉涌，具有极高的艺术审美与文墨天赋。`,
      },
      {
        id: "chapter_sancai",
        title: "【三才五格数理格局与五音声韵相生】",
        tag: "音律数理",
        content: `所选名字全盘避开 4、9、10、14、20 等凶恶损财伤身数理，全面采用 15、16、24、31、32、35 等富贵吉数。发音声母清朗悦耳，上声与去声平仄相间，呼之掷地有声，声波磁场正向共振。`,
      },
      {
        id: "chapter_blessing",
        title: "【起名修身寄语与学业前程开运锦囊】",
        tag: "人生祝祷",
        content: `“名不虚立，行必有果。”建议在孩子书房文昌位摆放四支富贵竹或水培绿植，以助旺木气文运；逢重大考试佩戴木质印章或红绳吉符，定能神明开朗，名列前茅。`,
      },
    ];
  }

  if (category === "company_naming") {
    return [
      {
        id: "chapter_destiny",
        title: "【法人八字命局与行业赛道五行气场剖析】",
        tag: "商业命盘",
        content: `法人八字天干透出正财与伤官，主极具商业敏锐度与开拓魄力。所处行业五行生旺，形成“行业生商号，商号纳万财，财气归法人”之绝佳正向流通闭环。`,
      },
      {
        id: "chapter_brands",
        title: "【大吉商号与品牌名称精选库（精选 5 套推荐）】",
        tag: "商号方案",
        content: `宗师立足商业心智、数理财运与商标合规，精选 5 套企业大吉商号方案：

### 🏢 方案一：【华盛智达有限公司】
- **【五行属性】**：水木相生，顺承天时
- **【数理诱导】**：24 数（金钱丰盈·家门余庆·白手成家大成数）
- **【品牌定位】**：高端科技与智慧服务，透传实力与可靠度
- **【品牌 Slogan】**：“华彩智造，盛通未来”

### 🚀 方案二：【鼎天乾元】
- **【五行属性】**：火金相济，威严耸立
- **【数理诱导】**：31 数（智勇得志·博得名利·大业成就大吉数）
- **【品牌定位】**：行业领跑者定位，彰显行业奠基者与行业标准制定者气魄
- **【品牌 Slogan】**：“一言九鼎，开创乾坤”

### 🌊 方案三：【润信同创】
- **【五行属性】**：水土相涵，基石永固
- **【数理诱导】**：23 数（旭日东升·名显四海·渐进发展数）
- **【品牌定位】**：强调信誉、合作共赢与生态聚合，利于融资与招纳合伙人
- **【品牌 Slogan】**：“润泽四海，信达天下”

### ✨ 方案四：【曜灵启航】
- **【五行属性】**：木火通明，万丈光芒
- **【数理诱导】**：16 数（厚德载物·贵人得助·兴家聚财数）
- **【品牌定位】**：青年创新与新锐力量，极具互联网与跨界传播势能
- **【品牌 Slogan】**：“曜灵所至，万物新生”

### 🛡️ 方案五：【恒泰丰年】
- **【五行属性】**：土金相生，基业长青
- **【数理诱导】**：32 数（宝马金鞍·侥幸多望·如龙升天数）
- **【品牌定位】**：沉稳厚重，传统与现代兼收并蓄，极易获得机构大客户信任
- **【品牌 Slogan】**：“持之以恒，泰然致远”`,
      },
      {
        id: "chapter_fortune",
        title: "【财帛数理卦象与商号防御策略】",
        tag: "财运聚气",
        content: `五套字号均经过商标注册文字数据库检索与数理卦象推导，字形间架均衡，极具商标图形化演变潜力，建议同步注册第9类、35类与42类核心商标品类。`,
      },
      {
        id: "chapter_launch",
        title: "【开业风水择机与品牌聚气指南】",
        tag: "行商大吉",
        content: `公司招牌字号底色建议采用藏蓝或深金黑配色，聚敛财气；前台正对明堂宜保持空阔明亮，忌杂物堆积阻碍财路进气。`,
      },
    ];
  }

  if (category === "phone_plate") {
    return [
      {
        id: "chapter_overview",
        title: "【号码数字能量场全息数理解析】",
        tag: "磁场总览",
        content: `数字皆具能量，号码即为全天候随身伴随之磁场共振发射源。通盘推演此号码，其河图五行气局归纳为金水相涵，先天格局稳健，主聪颖灵透、行商得利。`,
      },
      {
        id: "chapter_baxing",
        title: "【八星数字能量磁场深度拆解（天医/延年/生气等）】",
        tag: "八星阵列",
        content: `根据八星数字能量学体系，对此号码进行分段全息微观解构：
- **前段能量（号段机缘）**：透出【生气】磁场（14/41），主出门逢贵，善于把握外部突发红利与长辈引荐；
- **中段能量（人际运筹）**：包含【延年】磁场（19/91）与【伏位】磁场，主行事沉着笃定，责任心极强，守财防漏能力拔群；
- **后段尾数（太极财穴）**：显现【天医】磁场（13/31），正财稳健，主晚运丰盛安乐，财不外泄。`,
      },
      {
        id: "chapter_match",
        title: "【与机主/车主本命八字喜用神契合度】",
        tag: "命主相生",
        content: `机主八字身旺喜财官，号码中天医土金之气恰好生旺命中喜用神，使机主在日常接打电话或驾驶出行时，潜移默化得到正面情绪安抚与灵感赋能。`,
      },
      {
        id: "chapter_remedy",
        title: "【财运事业/出入平安化解与吉祥尾号/壁纸/车饰锦囊】",
        tag: "调和改运",
        content: `手机壁纸建议选用金黄色金币或山川厚土题材，以天医土能量巩固财气；若是车牌，建议车内挂天然黄水晶或沉香车挂，行驶平顺，百煞退避。`,
      },
    ];
  }

  if (category === "love_match") {
    return [
      {
        id: "chapter_rizhu",
        title: "【双方生辰八字日柱与干支合化深度排盘】",
        tag: "天合地合",
        content: `男方日柱元神中正稳重，女方日柱秀气灵动。天干呈现五合化气之象，地支亦有三合暗拱，彼此初见即有宿世因缘之熟悉感与默契共鸣。`,
      },
      {
        id: "chapter_nayin",
        title: "【六十甲子纳音五行与双方生肖气运契合】",
        tag: "纳音命相",
        content: `双方纳音五行相生，金水相生、木火相融，互为命理贵人。相处之时一人主外决策果断，一人主内细致周全，家庭根基坚实如磐。`,
      },
      {
        id: "chapter_mind",
        title: "【十神心智互补度与亲密关系暗藏摩擦点】",
        tag: "相处模式",
        content: `双方十神中正官与正印相涵，日常沟通理性包容。唯一微细摩擦点在于双方自尊心皆强，遇突发分歧时切忌冷战，宜立足家庭大局温和沟通。`,
      },
      {
        id: "chapter_timeline",
        title: "【感情关键考验流年周期与白头偕和破局秘法】",
        tag: "化解之道",
        content: `逢相冲流年（如遇太岁冲夫妻宫之年份），双方宜共同出游度假或购置大宗资产置换气场，以动破冲，自能白头偕老、琴瑟和谐。`,
      },
    ];
  }

  if (category === "qimen_decision") {
    return [
      {
        id: "chapter_pan",
        title: "【时空奇门排盘九星八门八神时局总览】",
        tag: "奇门格局",
        content: `以问事时空起正统时家奇门大盘，值符天心星落乾六宫，值使开门当令司权。三奇得使，青龙转光，乃兵家奇门中乘胜追击之上上吉格。`,
      },
      {
        id: "chapter_odds",
        title: "【所问事项天时、地利、人和综合胜算概率】",
        tag: "胜算决断",
        content: `【综合胜算率评估为 82%】。天时逢开门大吉，外部市场机缘已熟；地利生助求测者主位，资源就位；唯人和方面需注意合同细节防范微瑕。`,
      },
      {
        id: "chapter_risks",
        title: "【暗藏凶险阻碍与关键时间节点瓶颈】",
        tag: "风险推演",
        content: `盘中玄武暗动，提示在推进初期谨防合作伙伴口惠而实不至或信息不对称。凡重大款项与权责归属必须白纸黑字落实在法务合同中。`,
      },
      {
        id: "chapter_tactics",
        title: "【决胜军师谋略、有利方位与破局行动方案】",
        tag: "决断谋略",
        content: `谈判与推进核心事务宜面向东方或东南方吉位落座，随身着深色沉稳正装。建议在接下来的第一个成日或开日正式启动签约，势如破竹。`,
      },
    ];
  }

  if (category === "future_fortune") {
    return [
      {
        id: "chapter_macro",
        title: "【大运周期转换与先天元神势能基调】",
        tag: "大运周期",
        content: `当事人当前正步入十年一转之顺运交接期，原神得令，五行流通。过往磨砺皆化为资粮，未来三年为伏脉跃升与身份蜕变之关键机遇期。`,
      },
      {
        id: "chapter_yearly",
        title: "【未来周期逐年运程详批（分年深度推演）】",
        tag: "逐年详批",
        content: `### 🗓️ 2026年（丙午岁君·火旺升腾）
岁干透火，食伤生财，灵感泉涌。事业上利于开拓新业务赛道、聚拢资源，下半年有大宗收益落袋之喜。

### 🗓️ 2027年（丁未岁君·火土相生）
天德逢合，得遇行业长者与贵人提携。职位或社会影响力显著进阶，凡事稳扎稳打必有厚赏。

### 🗓️ 2028年（戊申岁君·金旺得位）
食神吐秀生偏财，投资与副业机遇纷至沓来，宜抓住下半年机遇果断布局，奠定未来十年基业。`,
      },
      {
        id: "chapter_points",
        title: "【关键流年拐点与四季吉凶月份节点】",
        tag: "月令吉凶",
        content: `每年春夏交接（农历四、五月）气运最为旺盛，利于决断签约；秋末冬初（农历十、十一月）宜韬光养晦、整理财务防范支出超额。`,
      },
      {
        id: "chapter_fengshui",
        title: "【趋吉避凶风水与贵人开运指引】",
        tag: "转运布局",
        content: `居室东南方摆放阔叶长青绿植催旺文昌生气；北方水位相安无事，避免杂乱动土，顺天应时，百福来朝。`,
      },
    ];
  }

  // 默认看相或八字
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
  const defaultRadar = getDefaultRadar(category);
  const defaultChapters = createDefaultChapters(category);

  return {
    preview: {
      score: 93,
      rating: "天运吉相",
      title: getDefaultTitle(category),
      summary: getDefaultSummary(category),
      highlights: getDefaultHighlights(category),
      radar: defaultRadar,
    },
    full_report: {
      overview: getDefaultOverview(category),
      chapters: defaultChapters,
      blessingAdvice: getDefaultBlessingAdvice(category),
    },
  };
}
