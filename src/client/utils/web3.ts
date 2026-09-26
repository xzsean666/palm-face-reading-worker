import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseUnits,
  formatUnits,
  type Address,
  erc20Abi,
} from "viem";
import { hardhat } from "viem/chains";
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
 * 获取 Viem Public Client (只读客户端)
 */
export function getPublicClient() {
  return createPublicClient({
    chain: hardhat,
    transport: http(config.rpcUrl),
  });
}

/**
 * 获取 Viem Wallet Client (交互写入客户端)
 */
export function getWalletClient(accountAddress?: Address) {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return createWalletClient({
      chain: hardhat,
      transport: custom((window as any).ethereum),
      account: accountAddress,
    });
  }
  return null;
}

/**
 * 切换或添加本地 Hardhat 网络到钱包
 */
export async function ensureLocalNetwork() {
  if (typeof window === "undefined" || !(window as any).ethereum) return;
  const hexChainId = `0x${config.chainId.toString(16)}`;
  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError: any) {
    // 4902 表示该网络尚未添加到钱包
    if (switchError.code === 4902) {
      await (window as any).ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            chainName: "Hardhat Local Testnet",
            rpcUrls: [config.rpcUrl],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          },
        ],
      });
    }
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

  const hash = await walletClient.writeContract({
    address: config.proxyAddress,
    abi: ServiceCreditManagerABI,
    functionName: "setReferrer",
    args: [referrerAddress],
    account: userAddress,
  });

  const publicClient = getPublicClient();
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * 支付与核销服务（完整流程：绑定推荐人 -> Approve -> Deposit -> Consume）
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
  await ensureLocalNetwork();
  const { userAddress, amountUsdt, onProgress } = params;
  const walletClient = getWalletClient(userAddress);
  if (!walletClient) throw new Error("未检测到 Web3 钱包客户端");
  const publicClient = getPublicClient();

  const amountUnits = parseUnits(amountUsdt.toString(), 6);

  // 1. 检查并绑定推荐人（若未绑定）
  onProgress?.("正在验证链上推荐人关系...");
  const hasRef = await checkHasReferrer(userAddress);
  if (!hasRef) {
    const targetReferrer = params.referrerAddress || config.platformTreasury;
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

  // 2. 检查合约内可用余额
  const currentCredit = await clientReadBalance(userAddress);
  let depositTxHash: `0x${string}` | undefined = undefined;

  // 如果可用点数不足，则需要 deposit
  if (currentCredit < amountUnits) {
    const needed = amountUnits - currentCredit;

    // 检查 USDT 授权
    onProgress?.("正在检查 USDT 授权额度...");
    const allowance = await publicClient.readContract({
      address: config.paymentTokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [userAddress, config.proxyAddress],
    });

    if (allowance < needed) {
      onProgress?.("请在钱包中确认 USDT 授权...");
      const approveHash = await walletClient.writeContract({
        address: config.paymentTokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [config.proxyAddress, amountUnits * 10n], // 授权充足额度
        account: userAddress,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
    }

    // 充值点数 (Deposit)
    onProgress?.(`正在充值 ${(Number(needed) / 1e6).toFixed(2)} USDT 到服务点数...`);
    depositTxHash = await walletClient.writeContract({
      address: config.proxyAddress,
      abi: ServiceCreditManagerABI,
      functionName: "deposit",
      args: [needed],
      account: userAddress,
    });
    await publicClient.waitForTransactionReceipt({ hash: depositTxHash });
  }

  // 3. 核销点数 (Consume) 并触发分佣
  onProgress?.("正在链上核销并结算推荐人分佣...");
  const consumeTxHash = await walletClient.writeContract({
    address: config.proxyAddress,
    abi: ServiceCreditManagerABI,
    functionName: "consume",
    args: [amountUnits],
    account: userAddress,
  });
  await publicClient.waitForTransactionReceipt({ hash: consumeTxHash });

  return { depositTxHash, consumeTxHash };
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
