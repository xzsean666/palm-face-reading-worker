# TASK-005: 10 大算命门类知识库扩充与虚拟知识包构建 (Virtual RAG)

## Objective
在已有的面相与手相知识库（`/ssd0/git/AI-Session-NodeJS/examples/palm-face-reading`）基础上，补充和扩充其余 8 个预测门类的系统 Prompt、专业易理典籍知识库切片，并编写知识库构建工具将其打包为 Cloudflare Worker 可直接无盘引入的 `knowledge-bundle.json`。

## Scope
1. 继承并扩充 `knowledge/palm_face/` 下的手相、面相与面手合参古籍和视觉指南；
2. 新增其余 8 大门类知识库 Markdown 文件与专业提示词：
   - `knowledge/bazi/`（《渊海子平》《滴天髓》四柱排盘、十神强弱、喜用神定论）；
   - `knowledge/love_match/`（双人八字纳音相生相克、生肖刑冲破害、十神婚配指南）；
   - `knowledge/phone_plate/`（八星数字能量学、延年天医伏位与凶星化解法）；
   - `knowledge/name_test/`（《康熙字典》三才五格剖象法、五行音律与数理吉凶）；
   - `knowledge/auspicious_date/`（黄道吉日、建除十二神、廿八宿、主事人八字冲煞方位）；
   - `knowledge/future_fortune/`（子平流年大运、五年势能曲线与关键拐点岁运并临）；
   - `knowledge/qimen_decision/`（奇门遁甲兵机、九星八门八神时空盘与成败决疑）；
   - `knowledge/naming/`（个人八字喜用神起名与企业商道法人命格相生取名战略）；
3. 编写 `src/worker/ai/prompts/`，为 10 大门类定义结构化输出提示词（包含免费摘要、评分指标与分章手风琴 JSON）；
4. 编写构建脚本 `scripts/bundle-knowledge.ts`，自动将 Markdown 知识库转换并输出为 `src/worker/ai/knowledge-bundle.json`。

## Allowed Files
- `knowledge/**/*`
- `scripts/bundle-knowledge.ts`
- `src/worker/ai/prompts/*`
- `src/worker/ai/knowledge-bundle.json`

## Dependencies
TASK-001 (文档基线)

## Inputs and Outputs
- **输入**：
  - `/ssd0/git/AI-Session-NodeJS/examples/palm-face-reading/knowledge/`；
  - `docs/design/stitch_ui/ai_ui.md` 第四部分表单字段与附录报告结构。
- **输出**：
  - 10 大门类的 Markdown 典籍知识库与对应 Prompt 模块；
  - 经打包压缩的 `knowledge-bundle.json`。

## Acceptance Criteria
- [x] 10 个预测门类全部具备独立的知识库切片（每门类至少 2-3 个专业 Markdown）；
- [x] 10 个门类均具备对应的 Prompt 生成器与结构化 JSON Schema 提示词约束；
- [x] 运行 `pnpm run build:knowledge` 成功生成 `src/worker/ai/knowledge-bundle.json`，且总大小受控（实际 109.5 KB，远低于 500KB）。

## Verification Commands
```bash
pnpm run build:knowledge
pnpm test
pnpm run typecheck
```

## Risks and Assumptions
- 打包后的 JSON 仅约 109.5 KB，在 Worker 边缘加载极速且安全。

## Status
DONE
