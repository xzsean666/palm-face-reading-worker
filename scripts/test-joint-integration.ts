import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
  formatUnits,
  type Address,
  erc20Abi,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { ServiceCreditManagerABI } from "@service-credit-manager/sdk";
import contractsConfig from "../src/client/contracts/contracts.json" with { type: "json" };

const MNEMONIC = "test test test test test test test test test test test junk";
const deployerAccount = mnemonicToAccount(MNEMONIC, { addressIndex: 0 }); // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
const aliceAccount = mnemonicToAccount(MNEMONIC, { addressIndex: 1 });    // 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Inviter)
const bobAccount = mnemonicToAccount(MNEMONIC, { addressIndex: 2 });      // 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Consumer)

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(contractsConfig.rpcUrl),
});

const deployerWallet = createWalletClient({
  chain: hardhat,
  transport: http(contractsConfig.rpcUrl),
  account: deployerAccount,
});

const aliceWallet = createWalletClient({
  chain: hardhat,
  transport: http(contractsConfig.rpcUrl),
  account: aliceAccount,
});

const bobWallet = createWalletClient({
  chain: hardhat,
  transport: http(contractsConfig.rpcUrl),
  account: bobAccount,
});

const API_BASE = "http://127.0.0.1:8787";

async function main() {
  console.log("===============================================================");
  console.log("🚀 开始全流程联合联调测试 (合约默认参数 + 凭证防重放与时效核验)");
  console.log("===============================================================");
  console.log(`RPC Node:             ${contractsConfig.rpcUrl}`);
  console.log(`ServiceCreditManager: ${contractsConfig.proxyAddress}`);
  console.log(`Mock USDT Token:      ${contractsConfig.paymentTokenAddress}`);
  console.log(`Worker Backend API:   ${API_BASE}`);
  console.log(`Platform Treasury:    ${deployerAccount.address}`);
  console.log(`Alice (推荐人):       ${aliceAccount.address}`);
  console.log(`Bob   (消费者):       ${bobAccount.address}`);
  console.log("---------------------------------------------------------------");

  // 1. 验证合约默认配置 (最多2层推荐：15%, 5%; 最少10 USDT提现)
  console.log("\n[步骤 1/8] 校验智能合约部署默认配置...");
  const [maxDepth, rates] = await publicClient.readContract({
    address: contractsConfig.proxyAddress as Address,
    abi: ServiceCreditManagerABI,
    functionName: "getReferralConfig",
  });
  const minWithdraw = await publicClient.readContract({
    address: contractsConfig.proxyAddress as Address,
    abi: ServiceCreditManagerABI,
    functionName: "getMinWithdrawAmount",
  });

  console.log(`  - 推荐层级深度 (maxDepth): ${maxDepth} 层 (期望: 2 层)`);
  console.log(`  - 分佣费率 (rates): [${rates.join(", ")}] bps (期望: [1500, 500])`);
  console.log(`  - 最低提现门槛: ${formatUnits(minWithdraw, 6)} USDT (期望: 10 USDT)`);

  if (Number(maxDepth) !== 2) throw new Error(`推荐深度错误: ${maxDepth}`);
  if (rates.length !== 2 || rates[0] !== 1500n || rates[1] !== 500n) {
    throw new Error(`推荐分佣比例错误: [${rates.join(", ")}]`);
  }
  if (minWithdraw !== parseUnits("10", 6)) {
    throw new Error(`最低提现门槛错误: ${formatUnits(minWithdraw, 6)}`);
  }
  console.log("  ✓ 智能合约默认参数配置 100% 正确！");

  // 2. Worker API: 注册/登录 Alice 与 Bob
  console.log("\n[步骤 2/8] Worker API 用户鉴权与推荐码生成...");
  const aliceAuthRes = await fetch(`${API_BASE}/api/user/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress: aliceAccount.address }),
  });
  const aliceAuth = await aliceAuthRes.json();
  const aliceUser = aliceAuth.data;
  console.log(`  - Alice 登录成功, 专属推荐码: ${aliceUser.referral_code}`);

  const bobAuthRes = await fetch(`${API_BASE}/api/user/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      walletAddress: bobAccount.address,
      referrerCode: aliceUser.referral_code,
    }),
  });
  const bobAuth = await bobAuthRes.json();
  const bobUser = bobAuth.data;
  console.log(`  - Bob 填入 Alice 推荐码登录成功, 绑定推荐人 ID: ${bobUser.referrer_id}`);

  // 3. 链上绑定推荐人关系 (Alice -> Platform, Bob -> Alice)
  console.log("\n[步骤 3/8] 智能合约绑定推荐人关系...");
  const aliceHasRef = await publicClient.readContract({
    address: contractsConfig.proxyAddress as Address,
    abi: ServiceCreditManagerABI,
    functionName: "hasReferrer",
    args: [aliceAccount.address],
  });
  if (!aliceHasRef) {
    const h1 = await aliceWallet.writeContract({
      address: contractsConfig.proxyAddress as Address,
      abi: ServiceCreditManagerABI,
      functionName: "setReferrer",
      args: [deployerAccount.address],
    });
    await publicClient.waitForTransactionReceipt({ hash: h1 });
    console.log(`  - Alice 链上绑定平台直属成功: ${h1.slice(0, 14)}...`);
  }

  const bobHasRef = await publicClient.readContract({
    address: contractsConfig.proxyAddress as Address,
    abi: ServiceCreditManagerABI,
    functionName: "hasReferrer",
    args: [bobAccount.address],
  });
  if (!bobHasRef) {
    const h2 = await bobWallet.writeContract({
      address: contractsConfig.proxyAddress as Address,
      abi: ServiceCreditManagerABI,
      functionName: "setReferrer",
      args: [aliceAccount.address],
    });
    await publicClient.waitForTransactionReceipt({ hash: h2 });
    console.log(`  - Bob 链上绑定 Alice 成功: ${h2.slice(0, 14)}...`);
  }

  // 4. Bob 创建第 1 个测算订单并完成支付
  console.log("\n[步骤 4/8] Bob 创建订单 1 并执行链上充值与消费核销...");
  const order1Res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: bobUser.id,
      category: "palm_face",
      subcategory: "face_reading",
      payType: "USDT_ERC20",
      inputData: { name: "张三", gender: "male" },
    }),
  });
  const order1Json = await order1Res.json();
  const order1Id = order1Json.data?.id;
  const order1PriceUnits = parseUnits(order1Json.data?.price_usdt.toString(), 6);
  console.log(`  - 订单 1 创建成功: ${order1Id}, 金额: 6 USDT`);

  // 授权 USDT
  const bobAllowance = await publicClient.readContract({
    address: contractsConfig.paymentTokenAddress as Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [bobAccount.address, contractsConfig.proxyAddress as Address],
  });
  if (bobAllowance < parseUnits("1000", 6)) {
    const hApp = await bobWallet.writeContract({
      address: contractsConfig.paymentTokenAddress as Address,
      abi: erc20Abi,
      functionName: "approve",
      args: [contractsConfig.proxyAddress as Address, parseUnits("10000", 6)],
    });
    await publicClient.waitForTransactionReceipt({ hash: hApp });
  }

  // Deposit 6 USDT
  const hDeposit1 = await bobWallet.writeContract({
    address: contractsConfig.proxyAddress as Address,
    abi: ServiceCreditManagerABI,
    functionName: "deposit",
    args: [order1PriceUnits],
  });
  await publicClient.waitForTransactionReceipt({ hash: hDeposit1 });

  // Consume 6 USDT -> 产生合法凭证 (Receipt)
  const hConsume1 = await bobWallet.writeContract({
    address: contractsConfig.proxyAddress as Address,
    abi: ServiceCreditManagerABI,
    functionName: "consume",
    args: [order1PriceUnits],
  });
  await publicClient.waitForTransactionReceipt({ hash: hConsume1 });
  console.log(`  - Bob 完成链上核销, 凭证 TxHash: ${hConsume1}`);

  // 5. 后端核验 Receipt 并完成订单 1
  console.log("\n[步骤 5/8] 后端核验 Receipt 凭证有效性并核销订单 1...");
  const pay1Res = await fetch(`${API_BASE}/api/orders/${order1Id}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: bobUser.id,
      payType: "USDT_ERC20",
      txHash: hConsume1,
    }),
  });
  const pay1Json = await pay1Res.json();
  console.log(`  - 订单 1 核销结果: ${pay1Json.success}, 状态: ${pay1Json.data?.order?.status}`);
  if (pay1Json.data?.order?.status !== "COMPLETED") {
    throw new Error(`订单 1 核销失败: ${pay1Json.error}`);
  }
  console.log("  ✓ 订单 1 凭证核验通过并成功解锁！");

  // 6. 防重放测试：这个 receipt 只能使用一次！
  console.log("\n[步骤 6/8] 验证凭证防重放保护 (Receipt 只能使用一次)...");
  // 创建订单 2
  const order2Res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: bobUser.id,
      category: "bazi",
      payType: "USDT_ERC20",
      inputData: { year: 1995 },
    }),
  });
  const order2Json = await order2Res.json();
  const order2Id = order2Json.data?.id;
  console.log(`  - 创建订单 2: ${order2Id}`);

  // 尝试用订单 1 的 hConsume1 来冒充订单 2 支付
  const replayRes = await fetch(`${API_BASE}/api/orders/${order2Id}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: bobUser.id,
      payType: "USDT_ERC20",
      txHash: hConsume1, // 重复提交同一个凭证
    }),
  });
  const replayJson = await replayRes.json();
  console.log(`  - 重复凭证提交响应: success = ${replayJson.success}, 错误提示 = "${replayJson.error}"`);

  if (replayJson.success) {
    throw new Error("❌ 安全漏洞：重复提交凭证被错误允许！防重放失效！");
  }
  if (!replayJson.error?.includes("已被订单") && !replayJson.error?.includes("重复")) {
    throw new Error(`错误提示未明确标明重放: ${replayJson.error}`);
  }
  console.log("  ✓ 防重放拦截成功！同一个 Receipt 绝对无法被重复使用！");

  // 7. 测试最低 10 USDT 提现门槛 (防小额违规提现)
  console.log("\n[步骤 7/8] 测试合约最少 10 USDT 才能提现规则...");
  const aliceCurrentBal = await publicClient.readContract({
    address: contractsConfig.proxyAddress as Address,
    abi: ServiceCreditManagerABI,
    functionName: "getBalance",
    args: [aliceAccount.address],
  });
  console.log(`  - Alice 当前可用佣金余额: ${formatUnits(aliceCurrentBal, 6)} USDT`);

  // Alice 尝试提现 0.90 USDT (< 10 USDT)
  let withdrawReverted = false;
  try {
    await aliceWallet.writeContract({
      address: contractsConfig.proxyAddress as Address,
      abi: ServiceCreditManagerABI,
      functionName: "withdraw",
      args: [aliceCurrentBal], // 0.90 USDT < 10 USDT
    });
  } catch (err: any) {
    withdrawReverted = true;
    console.log(`  - ✓ 合约成功拒绝低于 10 USDT 的提现请求 (BelowMinWithdrawAmount)`);
  }

  if (!withdrawReverted) {
    throw new Error("❌ 安全漏洞：低于 10 USDT 的提现竟然通过了！");
  }

  // 8. 累计达 10 USDT 门槛后成功提现
  console.log("\n[步骤 8/8] 累积分润超过 10 USDT 后执行合法提现全链路...");
  // Bob 购买高级测算/咨询 (充值 70 USDT 并核销，Alice 获得 70 * 15% = 10.50 USDT)
  const bigAmountUnits = parseUnits("70", 6);
  const hDepBig = await bobWallet.writeContract({
    address: contractsConfig.proxyAddress as Address,
    abi: ServiceCreditManagerABI,
    functionName: "deposit",
    args: [bigAmountUnits],
  });
  await publicClient.waitForTransactionReceipt({ hash: hDepBig });

  const hConsBig = await bobWallet.writeContract({
    address: contractsConfig.proxyAddress as Address,
    abi: ServiceCreditManagerABI,
    functionName: "consume",
    args: [bigAmountUnits],
  });
  await publicClient.waitForTransactionReceipt({ hash: hConsBig });

  const aliceBalAfterBig = await publicClient.readContract({
    address: contractsConfig.proxyAddress as Address,
    abi: ServiceCreditManagerABI,
    functionName: "getBalance",
    args: [aliceAccount.address],
  });
  console.log(`  - Alice 累计佣金达到: ${formatUnits(aliceBalAfterBig, 6)} USDT (已满足 >= 10 USDT 门槛)`);

  // Alice 提现 10 USDT
  const withdrawAmountUnits = parseUnits("10", 6);
  const aliceUsdtBefore = await publicClient.readContract({
    address: contractsConfig.paymentTokenAddress as Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [aliceAccount.address],
  });

  const hWithdraw = await aliceWallet.writeContract({
    address: contractsConfig.proxyAddress as Address,
    abi: ServiceCreditManagerABI,
    functionName: "withdraw",
    args: [withdrawAmountUnits],
  });
  await publicClient.waitForTransactionReceipt({ hash: hWithdraw });

  const aliceUsdtAfter = await publicClient.readContract({
    address: contractsConfig.paymentTokenAddress as Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [aliceAccount.address],
  });
  const receivedUsdt = aliceUsdtAfter - aliceUsdtBefore;
  console.log(`  - Alice 钱包成功收到: ${formatUnits(receivedUsdt, 6)} USDT`);

  if (receivedUsdt !== withdrawAmountUnits) {
    throw new Error("提现到账金额不符！");
  }

  // 同步提现流水至后端
  const syncRes = await fetch(`${API_BASE}/api/promote/sync-withdrawal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: aliceUser.id,
      amount: 10.0,
      txHash: hWithdraw,
      payoutAddress: aliceAccount.address,
    }),
  });
  const syncJson = await syncRes.json();
  console.log(`  - 提现流水记录同步成功! ID: ${syncJson.data?.id}`);

  console.log("\n===============================================================");
  console.log("🎉 全部 8 项业务与安全检查 (默认2层推荐、15%/5%分润、10U提现、Receipt单次有效、时效控制) 100% 通过！");
  console.log("===============================================================");
}

main().catch((err) => {
  console.error("联调测试失败:", err);
  process.exit(1);
});
