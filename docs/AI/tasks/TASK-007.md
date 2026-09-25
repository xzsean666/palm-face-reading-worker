# TASK-007: 实现用户鉴权、免费额度扣减与订单支付 (USDT) 状态机

## Objective
实现用户身份识别（钱包登录 EIP-1193 / 游客模式）、新用户注册赠送 2 次免费测算额度、创建测算订单、免费次数抵扣、模拟/真实 USDT 支付确认状态机，以及订单详情查询接口。

## Scope
1. 实现用户认证与初始化逻辑（`POST /api/user/auth`）：
   - 支持传入钱包地址，不存在时创建用户并赠送 2 次免费额度；
   - 支持游客模式生成 `guest_uuid`；
   - 支持读取用户资产（`GET /api/user/profile`：剩余免费次数、余额、VIP 状态、推荐码）；
2. 实现创建订单接口（`POST /api/orders`）：
   - 包含门类、应付金额（标准 6 USDT / VIP 4.8 USDT）、绑定推荐人；
3. 实现支付确认接口（`POST /api/orders/:id/pay`）：
   - 支持 `FREE_QUOTA`（扣减 1 次免费额度，立即完成）；
   - 支持 `USDT_TRC20` / `USDT_ERC20`（记录传入的 `txHash`，状态变更为 `CONFIRMING`，在本地模拟环境下支持自动确认或一键回调标记为 `COMPLETED`）；
4. 订单完成后，自动触发将对应报告标记为 `is_unlocked = 1`；
5. 实现订单列表与详情接口（`GET /api/orders`、`GET /api/orders/:id`，支持 P14 测算记录与 P15 订单详情）。

## Allowed Files
- `src/worker/routes/user.ts`
- `src/worker/routes/order.ts`
- `src/worker/services/user-service.ts`
- `src/worker/services/order-service.ts`
- `test/worker/order.test.ts`

## Dependencies
TASK-003 (D1 数据库与 Schema)

## Inputs and Outputs
- **输入**：用户钱包地址、订单创建参数、支付方式与凭据。
- **输出**：用户账户状态更新、订单流水流转、报告解锁状态更新。

## Acceptance Criteria
- [x] 新用户首次进入自动获得 `free_quota = 2`；
- [x] 免费次数充足时，用户能免支付直接解锁报告；
- [x] 支付接口在并发情况下扣减免费额度保持原子性（避免超扣或重复使用）；
- [x] 订单详情接口正确返回下单时间、支付时间、支付方式与报告关联编号。

## Verification Commands
```bash
pnpm test
pnpm run typecheck
pnpm run build
```

## Risks and Assumptions
- 本地与测试环境采用模拟交易哈希流转与即时结算，生产环境可平滑接入链上 RPC 监听。

## Status
DONE
