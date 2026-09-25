export interface DivinationPreviewResult {
  score: number; // 0-100 综合评分
  rating: string; // 如 "天运大吉"、"上上吉"、"元吉"
  title: string; // 核心格局或总评标语
  summary: string; // 综合运势简评
  highlights: string[]; // 核心亮点断语（3-4条）
  radar: { label: string; value: number }[]; // 五维雷达图指标 (0-100)
}

export interface ReportChapter {
  id: string;
  title: string;
  tag?: string;
  content: string; // Markdown 格式详批深度解读
}

export interface DivinationFullReportResult {
  overview: string;
  chapters: ReportChapter[];
  blessingAdvice: string[]; // 宗师开运锦囊与修德指引
}

export interface GeneratedDivinationOutput {
  preview: DivinationPreviewResult;
  full_report: DivinationFullReportResult;
}
