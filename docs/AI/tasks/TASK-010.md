# TASK-010: 实现前端核心入口与 10 大表单页面 (P01-P05)

## Objective
完整实现天机 AI 预测大师的前端核心入口路径，包括 P01 启动页、P02 登录页（Web3 钱包连接与游客模式）、P03 测算首页（10 大功能宫格与数据看板）、P04 AI看相二级选择页，以及 P05 中对应的全部 10 个算命预测门类的高保真录入表单。

## Scope
1. 实现 `P01_SplashView.vue`（沉浸式太极 Logo 呼吸光晕、2 秒自动跳转）；
2. 实现 `P02_LoginView.vue`（连接钱包登录、游客模式、登录送 2 次免费额度提示、用户协议）；
3. 实现 `P03_HomeView.vue`（Hero 横幅与三大核心背书数据、公告跑马灯、10 大功能卡片宫格、测算记录卡、开通会员与推广横幅）；
4. 实现 `P04_PalmFaceSelectView.vue`（手相解秘 vs 面相玄机两张选项卡与拍摄规范指南）；
5. 实现 `P05_InputView.vue` 核心表单宿主与 10 个独立门类表单子组件：
   - 手相/面相照片上传组件（带移动端拍照、相册选择与前端 Canvas 压缩、尺寸与清晰度校验）；
   - 性别乾坤命元切换（男阳/女阴）；
   - 公历/农历干支切换日期滚轮选择器与出生时辰选择器；
   - 双人合盘表单、手机号/车牌号表单、三才五格姓名表单、择日双日历表单、奇门成败多行文本表单、起名喜忌多选表单等；
6. 实现表单校验、隐私承诺、吸底主按钮状态切换（「开始推演」或「开始推演（免费）」）。

## Allowed Files
- `src/client/src/views/P01_SplashView.vue`
- `src/client/src/views/P02_LoginView.vue`
- `src/client/src/views/P03_HomeView.vue`
- `src/client/src/views/P04_PalmFaceSelectView.vue`
- `src/client/src/views/P05_InputView.vue`
- `src/client/src/components/forms/**/*`
- `src/client/src/utils/image-compress.ts`
- `src/client/src/stores/divination.ts`

## Dependencies
TASK-009 (设计系统与全局导航)

## Inputs and Outputs
- **输入**：`docs/design/stitch_ui/ai_ui.md` 第三部分 P01-P05 卡片规范与第四部分功能表单字段表。
- **输出**：可交互的 10 大表单输入界面，用户录入后校验通过可进入分析阶段。

## Acceptance Criteria
- [x] 首页 10 个宫格与测算记录卡片内容文案完全对齐规范；
- [x] 10 个表单的输入控件类型（Input, Radio, Multi, Picker, Upload）与必填校验完备；
- [x] 相学图片上传前在浏览器端自动缩放压缩至 1024px / < 200KB；
- [x] 表单未完成时主按钮按规范置灰，点击弹出准确的字段缺失 Toast 提示。

## Verification Commands
```bash
# 在浏览器中遍历进入 /splash, /login, /home, /feature/palm-face, /feature/bazi/input 等页面测试录入
pnpm run build:client
```

## Risks and Assumptions
- 移动端移动端滚轮选择器需具备良好的触摸阻尼感，可引入成熟的移动端选择器或封装高适配度的原生 select/滚动组件。

## Status
DONE

