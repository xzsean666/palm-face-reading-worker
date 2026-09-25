# TASK-008: 实现 VIP 会员中心、推荐分润佣金计算与提现 API

## Objective
在 Cloudflare Worker 后端实现 VIP 会员开通与权益状态管理、两级推荐分销裂变分润引擎（直推 15%、间推 5%）、推广收益明细统计与 USDT 提现申请接口，为 P10 会员中心、P11 推广中心、P12 收益提现与 P18 统计页提供完整的服务端支撑。

## Scope
1. 实现 VIP 购买与续费接口（`POST /api/vip/subscribe`）：
   - 支持月度（29 USDT）、季度（69 USDT）、年度（199 USDT）三种档位；
   - 更新用户 `is_vip = 1` 及 `vip_expire_at` 时间戳；
2. 实现推荐码绑定与激活逻辑：
   - 用户首次产生付费行为（测算付费或开通会员）时，自动生成唯一 7 位推荐码（`referral_code`）；
   - 提供 `POST /api/user/bind-referrer` 允许下级绑定邀请人推荐码；
3. 实现订单分润结算引擎（在订单支付成功钩子中触发）：
   - 查询直接邀请人：若存在，计算 `order.price * 15%` 写入佣金并增加其 `earnings_balance`；
   - 查询间接邀请人（邀请人的上级）：若存在，计算 `order.price * 5%` 写入佣金；
4. 实现收益明细与提现接口：
   - `GET /api/promote/overview`：返回当前直推人数、间推人数、累计收益、可提现余额；
   - `GET /api/promote/earnings`：返回分页收益明细流水；
   - `POST /api/withdraw`：校验余额 >= 10 USDT，扣除 1 USDT 手续费，写入 `withdrawals` 表；
5. 实现统计数据接口（`GET /api/stats/platform` 与 `GET /api/stats/user`）。

## Allowed Files
- `src/worker/routes/vip.ts`
- `src/worker/routes/promote.ts`
- `src/worker/routes/stats.ts`
- `src/worker/services/vip-service.ts`
- `src/worker/services/referral-service.ts`
- `test/worker/referral.test.ts`

## Dependencies
TASK-007 (用户与订单状态机)

## Inputs and Outputs
- **输入**：VIP 订阅请求、推荐码绑定、提现申请参数。
- **输出**：VIP 权益更新、两级佣金记账、提现申请记录与平台大盘数据。

## Acceptance Criteria
- [x] 付费订单能精确触发 15% / 5% 两级分润，分润记录与余额原子性更新；
- [x] 提现申请在余额不足 10 USDT 时返回清晰拒绝提示；
- [x] 平台统计大盘接口具备缓存或低开销聚合查询；
- [x] 测试用例完整覆盖两级分销记账与提现流转。

## Verification Commands
```bash
pnpm test
pnpm run typecheck
pnpm run build
```

## Risks and Assumptions
- 提现涉及资金变动，已在 D1 数据层实现余额检查与原子更新防透支机制。

## Status
DONE
