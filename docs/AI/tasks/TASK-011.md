# TASK-011: 实现前端星盘推演动效、付费墙预览与完整分章报告 (P06-P09)

## Objective
实现从 AI 推演到报告查看的全闭环用户交互，包含 P06 分析中页（220px 罗盘八卦星盘双向旋转动效与进度阶段轮播）、P07 报告预览页（免费结论、评分指数条与模糊付费遮罩墙）、P08 确认支付页（USDT 方式切换与免费额度抵扣）以及 P09 完整报告页（命盘全息可视化、分章手风琴深度解读与 PDF 下载/海报分享）。

## Scope
1. 实现 `P06_AnalyzingView.vue`：
   - 纯 CSS3 / SVG 实现 220px 乾坤罗盘动效（外环罗盘 8s 顺转、八卦内环 12s 逆转、中心太极缓转与粒子动效）；
   - 环形进度条与阶段文案轮播定时器（连接智库 -> 排布命盘 -> 推演五行 -> 生成报告）；
   - 诗句轮播与「后台推演」跳转逻辑；
2. 实现 `P07_PreviewView.vue`：
   - 报告编号头卡；
   - 免费综合结论与三大综合评分指数（财运/事业/姻缘）进度动画；
   - 付费遮罩墙（`backdrop-filter: blur(8px)` + 5 大专属权益清单）；
   - 价格卡（6 USDT / 会员 4.8 USDT）与吸底解锁主按钮；
3. 实现 `P08_PayView.vue`：
   - 订单信息卡与支付单选项（USDT-TRC20 / USDT-ERC20 / 免费次数抵扣）；
   - 支付中等待转圈与完成庆祝弹窗（首单解锁获得专属推荐码 🎉）；
4. 实现 `P09_FullReportView.vue`：
   - 命盘可视化拓扑卡片（八字四柱干支图/手面相全息图/合盘对照图）；
   - 分章手风琴解读卡片（独立展开/折叠，行高 1.8，重点加粗）；
   - 吸底双按钮（「下载报告」与「分享报告」生成落地长图/PDF 弹层）。

## Allowed Files
- `src/client/src/views/P06_AnalyzingView.vue`
- `src/client/src/views/P07_PreviewView.vue`
- `src/client/src/views/P08_PayView.vue`
- `src/client/src/views/P09_FullReportView.vue`
- `src/client/src/components/report/**/*`
- `src/client/src/components/astrology/AstroCompass.vue`
- `src/client/src/utils/pdf-export.ts`

## Dependencies
TASK-006 (推演 API 与 SSE), TASK-010 (表单与输入页)

## Inputs and Outputs
- **输入**：SSE 流式推演事件、`divination_reports` 结构化报告数据。
- **输出**：生动细腻的推演过程、严密阻断的付费墙体验以及华丽详尽的完整命盘报告展示。

## Acceptance Criteria
- [x] 星盘动效流畅达到 60fps，不占用过多移动端 CPU；
- [x] 付费遮罩在未支付前完全阻断底层内容窥探；
- [x] 支付完成后页面平滑滚动至完整报告顶部并展开全部章节；
- [x] 手风琴展开与收起交互自然顺畅。

## Verification Commands
```bash
# 模拟全流程：表单提交 -> 进入分析页等待 -> 预览页弹出付费墙 -> 扣减免费次数 -> 查看完整报告
pnpm run build:client
```

## Risks and Assumptions
- 移动端生成高分辨率分享海报/PDF 依赖 HTML5 Canvas 绘制，需控制图像像素密度与跨域图片资源。

## Status
DONE

