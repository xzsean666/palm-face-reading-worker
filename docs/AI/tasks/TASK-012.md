# TASK-012: 实现前端商业化、推广分销、个人中心与统计模块 (P10-P18)

## Objective
完整实现天机 AI 预测大师的商业变现闭环与用户资产支撑模块，包括 P10 会员中心、P11 推广中心、P12 收益明细与提现、P13 个人中心、P14 测算记录、P15 订单详情、P16 分享落地页、P17 说明与免责声明以及 P18 平台与个人统计大盘。

## Scope
1. 实现 `P10_VipView.vue`（月度/季度/年度会员卡、高亮最受欢迎、开通权益列表与 FAQ 折叠）；
2. 实现 `P11_PromoteView.vue`（未激活锁定态、已激活收益卡、专属推荐码复制、分享海报模版选择弹层）；
3. 实现 `P12_EarningsView.vue`（余额展示、收益记录/提现记录分段 Tab、申请提现弹窗）；
4. 实现 `P13_MeView.vue`（个人中心账户头卡、资产两列均分行、功能菜单组与退出登录）；
5. 实现 `P14_RecordsView.vue`（历史测算流水列表、状态绿/青/灰标签、空态引导）；
6. 实现 `P15_OrderDetailView.vue`（订单状态、金额、哈希、两级分润透明展示）；
7. 实现 `P16_InviteLandingView.vue`（受邀体验海报式落地页、热门功能卡片、「立即体验」跳转）；
8. 实现 `P17_AboutView.vue`（使用指引、正规免责声明折叠卡、协议条款入口）；
9. 实现 `P18_StatsView.vue`（平台大盘 2x2 四宫格、30 秒轮询动态流、个人专属统计）。

## Allowed Files
- `src/client/src/views/P10_VipView.vue`
- `src/client/src/views/P11_PromoteView.vue`
- `src/client/src/views/P12_EarningsView.vue`
- `src/client/src/views/P13_MeView.vue`
- `src/client/src/views/P14_RecordsView.vue`
- `src/client/src/views/P15_OrderDetailView.vue`
- `src/client/src/views/P16_InviteLandingView.vue`
- `src/client/src/views/P17_AboutView.vue`
- `src/client/src/views/P18_StatsView.vue`
- `src/client/src/components/common/SharePosterModal.vue`
- `src/client/src/components/common/WithdrawModal.vue`

## Dependencies
TASK-008 (会员与分润后端 API), TASK-009 (前端路由与导航)

## Inputs and Outputs
- **输入**：`docs/design/stitch_ui/ai_ui.md` 第三部分 P10-P18 页面卡片规范。
- **输出**：全部 18 个页面完整就绪，所有按钮文案严格符合统一动词表，空态与异常提示完备。

## Acceptance Criteria
- [x] 18 个页面全部可正常挂载并能无错误跳转；
- [x] 会员状态与推广激活状态具备清晰的未开通/已开通双重视图分支；
- [x] 提现弹层能实时校验金额与地址有效性并反馈 Toast；
- [x] 免责声明严格遵循合规条款。

## Verification Commands
```bash
# 浏览器检查 P10-P18 各页面视觉对齐度与各弹层组件动作
pnpm run build:client
```

## Risks and Assumptions
- 剪贴板复制推荐码需兼容不同移动端浏览器的 `navigator.clipboard` 权限策略。

## Status
DONE

