# TASK-009: 搭建前端设计系统 Tokens、全局导航与路由体系

## Objective
在前端工程（Vue 3 + Tailwind CSS）中完整配置「天机」设计系统的所有设计变量（Colors, Typography, Elevation, Spacing），搭建核心全局导航框架（56px 顶部导航栏、72% 左侧抽屉、底部「＋」Action Sheet 快捷面板、44px 二级副菜单、右下角悬浮金球与跑马灯公告条），并建立覆盖 18 个页面的 Vue Router 路由骨架。

## Scope
1. 配置 `tailwind.config.js` 扩展色彩 Tokens（`--tj-primary: #D4AF37`、`--tj-bg: #0B0E1A`、`--tj-bg-card: #141828`、`--tj-purple: #7B5CFF`、`--tj-cyan: #4FD8E8` 等）与字体设置；
2. 引入 Google Fonts（Plus Jakarta Sans, Space Grotesk, DIN 备选）与 Material Symbols Outlined 图标库；
3. 实现顶层布局组件 `AppLayout.vue`，无缝支持「模块模式」与「流程模式」动态切换；
4. 实现一级主导航栏组件 `TopNavBar.vue`（高 56px，固定顶部，☰ / ← 智能切换，Logo+品牌名，消息铃铛红点，金色「＋」操作按钮）；
5. 实现左侧主菜单抽屉组件 `LeftDrawer.vue`（宽 72%，遮罩背景，顶部账户信息卡与 5 大功能导航）；
6. 实现快捷动作面板组件 `ActionSheet.vue`（底部滑出圆角弹层，快捷查看记录、海报生成、客服）；
7. 实现二级副菜单导航栏组件 `SubNavBar.vue`（高 44px，横向滑动，选中金色下划线）；
8. 配置 Vue Router 4，建立附录清单中的全部 18 个路由并添加页面切换动画过渡。

## Allowed Files
- `tailwind.config.js`
- `src/client/index.html`
- `src/client/src/assets/*`
- `src/client/src/router/index.ts`
- `src/client/src/components/layout/*`
- `src/client/src/components/common/*`
- `src/client/src/stores/ui.ts`
- `src/client/src/App.vue`

## Dependencies
TASK-002 (工程骨架)

## Inputs and Outputs
- **输入**：`docs/design/stitch_ui/ai_ui.md` 第一章（设计系统）与第二章（全局导航组件）。
- **输出**：可交互的全局导航框架，点击 ☰ 展开抽屉，点击「＋」展开快捷菜单，支持副菜单横向滑动与路由跳转。

## Acceptance Criteria
- [x] 界面调色板与圆角、阴影严格对应设计规范；
- [x] 顶部导航栏在流程模式与模块模式间自适应切换图标与标题；
- [x] 抽屉与 Action Sheet 具备平滑展开/收起过渡动效与点击遮罩关闭能力；
- [x] 18 个路由路径配置无误，无控制台报错。

## Verification Commands
```bash
pnpm run build:client
# 本地预览检查各导航组件交互与响应式表现
```

## Risks and Assumptions
- 需确保在移动端触摸滑动（touch event）时抽屉与副菜单交互流畅不发生页面抖动或穿透滚动。

## Status
DONE

