import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  fallback,
  parseUnits,
  formatUnits,
  type Address,
  erc20Abi,
  defineChain,
} from "viem";
import { ServiceCreditManagerABI } from "@service-credit-manager/sdk";
import contractsConfig from "../contracts/contracts.json";

export interface ContractsConfig {
  network: string;
  chainId: number;
  rpcUrl: string;
  proxyAddress: Address;
  implementationAddress: Address;
  paymentTokenAddress: Address;
  platformTreasury: Address;
  minWithdrawAmount: string;
  maxReferralDepth: number;
  commissionRates: number[];
}

export const config: ContractsConfig = contractsConfig as ContractsConfig;

/**
 * 动态配置当前活跃网络（支持 Localhost、Sepolia、BSC Testnet 等任意测试网）
 */
export const activeChain = defineChain({
  id: config.chainId || 31337,
  name:
    config.network === "localhost"
      ? "Hardhat Local Testnet"
      : config.network === "sepolia"
      ? "Sepolia Testnet"
      : config.network === "bscTestnet"
      ? "BNB Smart Chain Testnet"
      : config.network || "EVM Testnet",
  nativeCurrency: {
    name:
      config.network === "bscTestnet"
        ? "tBNB"
        : config.network === "polygonAmoy"
        ? "MATIC"
        : "ETH",
    symbol:
      config.network === "bscTestnet"
        ? "tBNB"
        : config.network === "polygonAmoy"
        ? "MATIC"
        : "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [config.rpcUrl || "http://127.0.0.1:8545"],
    },
  },
});

export const mockErc20Abi = [
  ...erc20Abi,
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "faucet",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;

export const bscTestnetRpcUrls = [
  config.rpcUrl || "https://bsc-testnet-rpc.publicnode.com",
  "https://data-seed-prebsc-1-s1.binance.org:8545",
  "https://data-seed-prebsc-2-s1.binance.org:8545",
  "https://bsc-testnet.public.blastapi.io",
];

/**
 * 获取 Viem Public Client (只读客户端，内置多节点容灾 Fallback)
 */
export function getPublicClient() {
  const transport =
    config.network === "bscTestnet" || config.chainId === 97
      ? fallback(bscTestnetRpcUrls.map((url) => http(url, { timeout: 15_000, retryCount: 3 })))
      : http(config.rpcUrl);

  return createPublicClient({
    chain: activeChain,
    transport,
  });
}

/**
 * 获取 Viem Wallet Client (交互写入客户端)
 */
export function getWalletClient(accountAddress?: Address) {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return createWalletClient({
      chain: activeChain,
      transport: custom((window as any).ethereum),
      account: accountAddress,
    });
  }
  return null;
}

/**
 * 切换或添加目标网络到钱包
 */
export async function ensureTargetNetwork() {
  if (typeof window === "undefined" || !(window as any).ethereum) return;
  const hexChainId = `0x${config.chainId.toString(16)}`;
  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError: any) {
    // 4902 表示该网络尚未添加到钱包
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      await (window as any).ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            chainName: activeChain.name,
            rpcUrls: [config.rpcUrl],
            nativeCurrency: activeChain.nativeCurrency,
            blockExplorerUrls:
              config.network === "bscTestnet"
                ? ["https://testnet.bscscan.com"]
                : config.network === "sepolia"
                ? ["https://sepolia.etherscan.io"]
                : undefined,
          },
        ],
      });
    }
  }
}

// 保持向下兼容
export const ensureLocalNetwork = ensureTargetNetwork;

/**
 * 判断当前是否处于测试网或开发环境
 */
export function isTestnet(): boolean {
  return (
    config.chainId !== 1 &&
    config.chainId !== 56 &&
    config.chainId !== 137 &&
    config.network !== "mainnet"
  );
}

/**
 * 查询钱包原生代币余额 (ETH / tBNB) 用于支付 Gas
 */
export async function getNativeBalance(userAddress: Address): Promise<number> {
  const client = getPublicClient();
  const balanceWei = await client.getBalance({ address: userAddress });
  return parseFloat(formatUnits(balanceWei, 18));
}

/**
 * 从 MockERC20 水龙头铸造/领取测试代币 (USDT)
 */
export async function mintTestTokens(
  userAddress: Address,
  amountUsdt: number = 1000
): Promise<string> {
  await ensureTargetNetwork();
  const walletClient = getWalletClient(userAddress);
  if (!walletClient) throw new Error("未检测到 Web3 钱包客户端");
  const publicClient = getPublicClient();

  const amountUnits = parseUnits(amountUsdt.toString(), 6);
  const hash = await walletClient.writeContract({
    address: config.paymentTokenAddress,
    abi: mockErc20Abi,
    functionName: "mint",
    args: [userAddress, amountUnits],
    account: userAddress,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * 请求钱包添加 USDT 代币显示 (watchAsset)
 */
export async function addTokenToWallet(): Promise<boolean> {
  if (typeof window === "undefined" || !(window as any).ethereum) return false;
  try {
    return await (window as any).ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: config.paymentTokenAddress,
          symbol: "USDT",
          decimals: 6,
        },
      },
    });
  } catch (err) {
    console.error("添加代币到钱包失败:", err);
    return false;
  }
}

/**
 * 查询用户在合约中是否有推荐人
 */
export async function checkHasReferrer(userAddress: Address): Promise<boolean> {
  const client = getPublicClient();
  return await client.readContract({
    address: config.proxyAddress,
    abi: ServiceCreditManagerABI,
    functionName: "hasReferrer",
    args: [userAddress],
  });
}

/**
 * 获取用户绑定的推荐人地址
 */
export async function getUserReferrer(userAddress: Address): Promise<Address> {
  const client = getPublicClient();
  return await client.readContract({
    address: config.proxyAddress,
    abi: ServiceCreditManagerABI,
    functionName: "getReferrer",
    args: [userAddress],
  });
}

/**
 * 查询用户在服务信用合约中的可用点数/佣金余额
 */
export async function getServiceBalance(userAddress: Address): Promise<number> {
  const client = getPublicClient();
  const raw = await client.readContract({
    address: config.proxyAddress,
    abi: ServiceCreditManagerABI,
    functionName: "getBalance",
    args: [userAddress],
  });
  return parseFloat(formatUnits(raw, 6));
}

/**
 * 查询用户钱包里的 USDT 余额
 */
export async function getUSDTBalance(userAddress: Address): Promise<number> {
  const client = getPublicClient();
  const raw = await client.readContract({
    address: config.paymentTokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress],
  });
  return parseFloat(formatUnits(raw, 6));
}

/**
 * 绑定推荐人
 */
export async function setContractReferrer(
  userAddress: Address,
  referrerAddress: Address
): Promise<string> {
  await ensureLocalNetwork();
  const walletClient = getWalletClient(userAddress);
  if (!walletClient) throw new Error("未检测到 Web3 钱包客户端");

  let target = referrerAddress;
  if (target.toLowerCase() === userAddress.toLowerCase()) {
    target = "0x000000000000000000000000000000000000dEaD" as Address;
  }

  const hash = await walletClient.writeContract({
    address: config.proxyAddress,
    abi: ServiceCreditManagerABI,
    functionName: "setReferrer",
    args: [target],
    account: userAddress,
  });

  const publicClient = getPublicClient();
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * 服务点数充值（完整流程：绑定推荐人 -> 授权 USDT -> Deposit 充值入合约余额）
 * 重要规则：充值仅增加用户的服务信用点数，不触发分佣奖励；推荐人奖励仅在实际消费核销时按比例发放。
 */
export async function executeDeposit(params: {
  userAddress: Address;
  amountUsdt: number;
  referrerAddress?: Address;
  onProgress?: (step: string) => void;
}): Promise<string> {
  await ensureTargetNetwork();
  const { userAddress, amountUsdt, onProgress } = params;
  const walletClient = getWalletClient(userAddress);
  if (!walletClient) throw new Error("未检测到 Web3 钱包客户端");
  const publicClient = getPublicClient();

  if (amountUsdt <= 0) {
    throw new Error("充值金额必须大于 0");
  }

  const amountUnits = parseUnits(amountUsdt.toString(), 6);

  // 1. 检查钱包 USDT 余额
  onProgress?.("正在检查钱包 USDT 余额...");
  const usdtBal = await getUSDTBalance(userAddress);
  if (usdtBal < amountUsdt) {
    throw new Error(
      `钱包 USDT 余额不足 (当前: ${usdtBal.toFixed(2)} USDT, 充值需: ${amountUsdt} USDT)`
    );
  }

  // 2. 检查并绑定推荐人（合约 deposit 前必须绑定 referrer）
  onProgress?.("正在验证链上推荐人关系...");
  const hasRef = await checkHasReferrer(userAddress);
  if (!hasRef) {
    let targetReferrer = params.referrerAddress || config.platformTreasury;
    if (targetReferrer.toLowerCase() === userAddress.toLowerCase()) {
      targetReferrer = "0x000000000000000000000000000000000000dEaD" as Address;
    }
    onProgress?.(`正在链上绑定推荐人 (${targetReferrer.slice(0, 8)}...)...`);
    const refHash = await walletClient.writeContract({
      address: config.proxyAddress,
      abi: ServiceCreditManagerABI,
      functionName: "setReferrer",
      args: [targetReferrer],
      account: userAddress,
    });
    await publicClient.waitForTransactionReceipt({ hash: refHash });
  }

  // 3. 检查并授权 USDT
  onProgress?.("正在检查 USDT 授权额度...");
  const allowance = await publicClient.readContract({
    address: config.paymentTokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [userAddress, config.proxyAddress],
  });

  if (allowance < amountUnits) {
    onProgress?.("请在钱包中确认 USDT 授权...");
    const approveHash = await walletClient.writeContract({
      address: config.paymentTokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [config.proxyAddress, amountUnits * 10n],
      account: userAddress,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
  }

  // 4. 充值点数 (Deposit)
  onProgress?.(`正在向合约充值 ${amountUsdt} USDT 服务点数...`);
  const depositTxHash = await walletClient.writeContract({
    address: config.proxyAddress,
    abi: ServiceCreditManagerABI,
    functionName: "deposit",
    args: [amountUnits],
    account: userAddress,
  });
  await publicClient.waitForTransactionReceipt({ hash: depositTxHash });

  return depositTxHash;
}

/**
 * 服务点数消费核销（扣减已充值点数，并在链上触发推荐人分佣发放）
 * 规则：推荐人分佣在此刻由智能合约及后端按实际消费金额发放（直推15%、间推5%）。
 */
export async function executeConsume(params: {
  userAddress: Address;
  amountUsdt: number;
  referrerAddress?: Address;
  onProgress?: (step: string) => void;
}): Promise<string> {
  await ensureTargetNetwork();
  const { userAddress, amountUsdt, onProgress } = params;
  const walletClient = getWalletClient(userAddress);
  if (!walletClient) throw new Error("未检测到 Web3 钱包客户端");
  const publicClient = getPublicClient();

  const amountUnits = parseUnits(amountUsdt.toString(), 6);

  // 1. 检查合约内可用点数余额
  onProgress?.("正在检查合约可用点数余额...");
  const currentCredit = await clientReadBalance(userAddress);
  if (currentCredit < amountUnits) {
    const currentCreditUsdt = Number(currentCredit) / 1e6;
    throw new Error(
      `合约可用点数不足 (当前: ${currentCreditUsdt.toFixed(2)} USDT, 所需: ${amountUsdt} USDT)，请先充值`
    );
  }

  // 2. 检查并绑定推荐人（保底防御）
  const hasRef = await checkHasReferrer(userAddress);
  if (!hasRef) {
    let targetReferrer = params.referrerAddress || config.platformTreasury;
    if (targetReferrer.toLowerCase() === userAddress.toLowerCase()) {
      targetReferrer = "0x000000000000000000000000000000000000dEaD" as Address;
    }
    onProgress?.(`正在链上绑定推荐人 (${targetReferrer.slice(0, 8)}...)...`);
    const refHash = await walletClient.writeContract({
      address: config.proxyAddress,
      abi: ServiceCreditManagerABI,
      functionName: "setReferrer",
      args: [targetReferrer],
      account: userAddress,
    });
    await publicClient.waitForTransactionReceipt({ hash: refHash });
  }

  // 3. 核销点数 (Consume) 并触发分佣
  onProgress?.("正在链上核销点数并结算推荐人分佣...");
  const consumeTxHash = await walletClient.writeContract({
    address: config.proxyAddress,
    abi: ServiceCreditManagerABI,
    functionName: "consume",
    args: [amountUnits],
    account: userAddress,
  });
  await publicClient.waitForTransactionReceipt({ hash: consumeTxHash });

  return consumeTxHash;
}

/**
 * 支付与核销服务（兼容接口：执行消费核销，若点数不足则抛错提示跳转充值）
 */
export async function executePayAndConsume(params: {
  userAddress: Address;
  amountUsdt: number;
  referrerAddress?: Address;
  onProgress?: (step: string) => void;
}): Promise<{
  depositTxHash?: string;
  consumeTxHash: string;
}> {
  const consumeTxHash = await executeConsume(params);
  return { consumeTxHash };
}

/**
 * 申请提现佣金/点数到钱包 USDT
 */
export async function executeWithdraw(
  userAddress: Address,
  amountUsdt: number
): Promise<string> {
  await ensureLocalNetwork();
  const walletClient = getWalletClient(userAddress);
  if (!walletClient) throw new Error("未检测到 Web3 钱包客户端");
  const publicClient = getPublicClient();

  const amountUnits = amountUsdt === 0 ? 0n : parseUnits(amountUsdt.toString(), 6);

  const hash = await walletClient.writeContract({
    address: config.proxyAddress,
    abi: ServiceCreditManagerABI,
    functionName: "withdraw",
    args: [amountUnits],
    account: userAddress,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

async function clientReadBalance(userAddress: Address): Promise<bigint> {
  const client = getPublicClient();
  return await client.readContract({
    address: config.proxyAddress,
    abi: ServiceCreditManagerABI,
    functionName: "getBalance",
    args: [userAddress],
  });
}
