/**
 * usePaymentRequest Hook
 * Custom hook for interacting with the PaymentRequest smart contract
 */

import { useCallback, useState } from "react";
import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
  useAccount,
  usePublicClient,
} from "wagmi";
import { parseUnits, formatUnits, isAddress, decodeEventLog } from "viem";
import {
  PAYMENT_REQUEST_ABI,
  getPaymentRequestContractAddress,
  getChainInfo,
  POLYGON_CHAIN_ID,
  POLYGON_AMOY_CHAIN_ID,
  BNB_CHAIN_ID,
  formatPaymentId,
} from "@/constants/paymentRequest";
import {
  PaymentRequestData,
  PaymentRequestCreationResult,
  PaymentRequestRetrievalResult,
  PaymentMarkingResult,
  SupportedPaymentToken,
  PaymentStatus,
  FormattedPaymentRequestData,
} from "@/types/payment-request";
import { toast } from "sonner";

/**
 * Hook for creating payment requests
 */
export const useCreatePaymentRequest = (isTestnet: boolean = false) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { writeContractAsync, error: writeError } = useWriteContract();

  const createPaymentRequest = useCallback(
    async (
      merchantAddress: `0x${string}`,
      token: SupportedPaymentToken,
      chainId: number,
      amount: string,
    ): Promise<PaymentRequestCreationResult> => {
      console.log("🚀 [Payment Request] Starting creation process...");
      console.log("📋 [Payment Request] Input parameters:", {
        merchantAddress,
        token,
        chainId,
        amount,
        isTestnet,
      });

      if (!address) {
        const error = "Please connect your wallet";
        console.error("❌ [Payment Request] No wallet connected");
        setCreateError(error);
        return { success: false, error };
      }

      if (!isAddress(merchantAddress)) {
        const error = "Invalid merchant address";
        console.error(
          "❌ [Payment Request] Invalid merchant address:",
          merchantAddress,
        );
        setCreateError(error);
        return { success: false, error };
      }

      if (!amount || parseFloat(amount) <= 0) {
        const error = "Invalid amount";
        console.error("❌ [Payment Request] Invalid amount:", amount);
        setCreateError(error);
        return { success: false, error };
      }

      setIsCreating(true);
      setCreateError(null);

      try {
        // Determine target chain ID based on testnet flag
        const targetChainId = isTestnet ? POLYGON_AMOY_CHAIN_ID : BNB_CHAIN_ID;

        // Get contract address for the specific chain (supports BNB and Polygon)
        const contractAddress = getPaymentRequestContractAddress(
          isTestnet,
          targetChainId,
        );

        console.log("📝 [Payment Request] Contract details:", {
          contractAddress,
          targetChainId,
        });

        // Convert amount to wei (6 decimals for USDC/USDT)
        const amountWei = parseUnits(amount, 6);
        console.log(
          "💰 [Payment Request] Amount converted to wei:",
          amountWei.toString(),
        );

        // Write to contract and wait for transaction hash
        console.log("📤 [Payment Request] Sending transaction to contract...");
        const txHash = await writeContractAsync({
          address: contractAddress,
          abi: PAYMENT_REQUEST_ABI,
          functionName: "createPaymentRequest",
          args: [merchantAddress, token, BigInt(chainId), amountWei],
          chainId: targetChainId,
        });

        console.log("✅ [Payment Request] Transaction submitted:", txHash);
        console.log(
          "⏳ [Payment Request] Waiting for transaction confirmation...",
        );

        // Wait for transaction to be mined
        if (!publicClient) {
          throw new Error("Public client not available");
        }

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 1,
        });

        console.log("✅ [Payment Request] Transaction confirmed!");
        console.log("📦 [Payment Request] Receipt:", {
          blockNumber: receipt.blockNumber,
          status: receipt.status,
          gasUsed: receipt.gasUsed.toString(),
          logsCount: receipt.logs.length,
        });

        // Parse logs to find PaymentRequestCreated event
        console.log("🔍 [Payment Request] Parsing transaction logs...");
        let paymentId: number | undefined;

        for (const log of receipt.logs) {
          try {
            const decodedLog = decodeEventLog({
              abi: PAYMENT_REQUEST_ABI,
              data: log.data,
              topics: log.topics,
            });

            console.log("📋 [Payment Request] Decoded log:", decodedLog);

            if (decodedLog.eventName === "PaymentRequestCreated") {
              const args = decodedLog.args as any;
              paymentId = Number(args.paymentId);
              console.log("🎉 [Payment Request] Payment ID found:", paymentId);
              console.log("📊 [Payment Request] Event details:", {
                paymentId,
                merchant: args.merchant,
                tokenSymbol: args.tokenSymbol,
                chainId: args.chainId?.toString(),
                amount: args.amount?.toString(),
                timestamp: args.timestamp?.toString(),
              });
              break;
            }
          } catch (err) {
            // Skip logs that don't match our ABI
            console.log("⚠️ [Payment Request] Skipping non-matching log");
          }
        }

        if (!paymentId) {
          throw new Error("Payment ID not found in transaction logs");
        }

        console.log("✅ [Payment Request] Creation successful!");
        console.log("🎯 [Payment Request] Final payment ID:", paymentId);

        return {
          success: true,
          paymentId,
          transactionHash: txHash,
        };
      } catch (error: any) {
        console.error("❌ [Payment Request] Error during creation:", error);
        console.error("❌ [Payment Request] Error message:", error?.message);
        console.error("❌ [Payment Request] Error details:", error);

        const errorMessage =
          error?.message || "Failed to create payment request";
        setCreateError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsCreating(false);
        console.log("🏁 [Payment Request] Process completed");
      }
    },
    [address, writeContractAsync, publicClient, isTestnet],
  );

  return {
    createPaymentRequest,
    isCreating,
    createError: createError || writeError?.message || null,
  };
};

/**
 * Hook for reading payment request data
 */
export const useGetPaymentRequest = (
  paymentId: number | null,
  isTestnet: boolean = false,
  chainId?: number,
) => {
  const targetChainId =
    chainId || (isTestnet ? POLYGON_AMOY_CHAIN_ID : POLYGON_CHAIN_ID);
  const contractAddress = getPaymentRequestContractAddress(
    isTestnet,
    targetChainId,
  );
  const publicClient = usePublicClient();

  const {
    data: rawData,
    error,
    isLoading,
    refetch,
  } = useReadContract({
    address: contractAddress,
    abi: PAYMENT_REQUEST_ABI,
    functionName: "getPaymentRequest",
    args: paymentId ? [BigInt(paymentId)] : undefined,
    query: {
      enabled: paymentId !== null && paymentId > 0,
    },
    chainId: targetChainId,
  });

  const getPaymentRequest = useCallback(
    async (id: number): Promise<PaymentRequestRetrievalResult> => {
      console.log("🔍 [Get Payment Request] Loading payment ID:", id);

      if (id <= 0) {
        console.error("❌ [Get Payment Request] Invalid payment ID:", id);
        return { success: false, error: "Invalid payment ID", exists: false };
      }

      if (!publicClient) {
        console.error("❌ [Get Payment Request] Public client not available");
        return {
          success: false,
          error: "Public client not available",
          exists: false,
        };
      }

      try {
        console.log("📤 [Get Payment Request] Reading contract...");
        console.log("📝 [Get Payment Request] Contract:", contractAddress);
        console.log(
          "🆔 [Get Payment Request] Chain ID:",
          isTestnet ? POLYGON_AMOY_CHAIN_ID : POLYGON_CHAIN_ID,
        );

        // Make a direct contract read call with the specific payment ID
        const result = await publicClient.readContract({
          address: contractAddress,
          abi: PAYMENT_REQUEST_ABI,
          functionName: "getPaymentRequest",
          args: [BigInt(id)],
        });

        console.log("✅ [Get Payment Request] Contract read successful");
        console.log("📦 [Get Payment Request] Raw data:", result);
        console.log("📦 [Get Payment Request] Raw data type:", typeof result);
        console.log(
          "📦 [Get Payment Request] Is Array:",
          Array.isArray(result),
        );

        if (!result) {
          console.error("❌ [Get Payment Request] No data returned");
          return {
            success: false,
            error: "Payment request not found",
            exists: false,
          };
        }

        // TypeScript fix: Handle the struct return from contract (named properties)
        const data = result as any;

        console.log("🔍 [Get Payment Request] Parsing data fields:");
        console.log("  merchant:", data.merchant);
        console.log("  tokenSymbol:", data.tokenSymbol);
        console.log("  chainId:", data.chainId);
        console.log("  amount:", data.amount);
        console.log("  timestamp:", data.timestamp);
        console.log("  status:", data.status);
        console.log("  payer:", data.payer);
        console.log("  paidAt:", data.paidAt);

        // Validate all fields exist
        if (
          data.merchant === undefined ||
          data.tokenSymbol === undefined ||
          data.chainId === undefined ||
          data.amount === undefined ||
          data.timestamp === undefined ||
          data.status === undefined
        ) {
          console.error(
            "❌ [Get Payment Request] Missing required fields in contract data",
          );
          return {
            success: false,
            error: "Invalid payment request data returned from contract",
            exists: false,
          };
        }

        const merchant = data.merchant as string;
        const tokenSymbol = data.tokenSymbol as string;
        const chainId = data.chainId as bigint;
        const amount = data.amount as bigint;
        const timestamp = data.timestamp as bigint;
        const status = data.status as number;
        const payer = data.payer as string;
        const paidAt = data.paidAt as bigint;

        const paymentData: PaymentRequestData = {
          merchant: merchant as `0x${string}`,
          tokenSymbol: tokenSymbol as SupportedPaymentToken,
          chainId: Number(chainId),
          amount: amount.toString(),
          timestamp: Number(timestamp),
          status: status as PaymentStatus,
          payer:
            payer === "0x0000000000000000000000000000000000000000"
              ? null
              : (payer as `0x${string}`),
          paidAt: paidAt === BigInt(0) ? null : Number(paidAt),
        };

        console.log(
          "✅ [Get Payment Request] Payment data parsed:",
          paymentData,
        );
        return { success: true, data: paymentData, exists: true };
      } catch (error: any) {
        console.error("❌ [Get Payment Request] Error:", error);
        console.error(
          "❌ [Get Payment Request] Error message:",
          error?.message,
        );
        const errorMessage =
          error?.message || "Failed to fetch payment request";
        return { success: false, error: errorMessage, exists: false };
      }
    },
    [publicClient, contractAddress, isTestnet],
  );

  // Format the current data if available (using named properties)
  const formattedData: PaymentRequestData | null = rawData
    ? {
        merchant: (rawData as any).merchant as `0x${string}`,
        tokenSymbol: (rawData as any).tokenSymbol as SupportedPaymentToken,
        chainId: Number((rawData as any).chainId),
        amount: (rawData as any).amount.toString(),
        timestamp: Number((rawData as any).timestamp),
        status: (rawData as any).status as PaymentStatus,
        payer:
          (rawData as any).payer ===
          "0x0000000000000000000000000000000000000000"
            ? null
            : ((rawData as any).payer as `0x${string}`),
        paidAt:
          (rawData as any).paidAt === BigInt(0)
            ? null
            : Number((rawData as any).paidAt),
      }
    : null;

  return {
    data: formattedData,
    isLoading,
    error: error?.message || null,
    refetch,
    getPaymentRequest,
  };
};

/**
 * Hook for marking payments as paid
 */
export const useMarkPaymentAsPaid = (isTestnet: boolean = false) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [isMarking, setIsMarking] = useState(false);
  const [markError, setMarkError] = useState<string | null>(null);

  const { writeContractAsync, error: writeError } = useWriteContract();

  const markAsPaid = useCallback(
    async (
      paymentId: number,
      payerAddress: `0x${string}`,
    ): Promise<PaymentMarkingResult> => {
      console.log("💳 [Mark as Paid] Starting process...");
      console.log("💳 [Mark as Paid] Payment ID:", paymentId);
      console.log("💳 [Mark as Paid] Payer address:", payerAddress);

      if (!address) {
        const error = "Please connect your wallet";
        console.error("❌ [Mark as Paid] No wallet connected");
        setMarkError(error);
        return { success: false, error };
      }

      if (!isAddress(payerAddress)) {
        const error = "Invalid payer address";
        console.error("❌ [Mark as Paid] Invalid payer address:", payerAddress);
        setMarkError(error);
        return { success: false, error };
      }

      setIsMarking(true);
      setMarkError(null);

      try {
        // Determine target chain ID based on testnet flag
        const targetChainId = isTestnet ? POLYGON_AMOY_CHAIN_ID : BNB_CHAIN_ID;

        // Get contract address for the specific chain (supports BNB and Polygon)
        const contractAddress = getPaymentRequestContractAddress(
          isTestnet,
          targetChainId,
        );

        console.log("📝 [Mark as Paid] Contract details:", {
          contractAddress,
          targetChainId,
        });

        // Write to contract and wait for transaction hash
        console.log("📤 [Mark as Paid] Sending transaction to contract...");
        const txHash = await writeContractAsync({
          address: contractAddress,
          abi: PAYMENT_REQUEST_ABI,
          functionName: "markAsPaid",
          args: [BigInt(paymentId), payerAddress],
          chainId: targetChainId,
        });

        console.log("✅ [Mark as Paid] Transaction submitted:", txHash);
        console.log(
          "⏳ [Mark as Paid] Waiting for transaction confirmation...",
        );

        // Wait for transaction to be mined
        if (!publicClient) {
          throw new Error("Public client not available");
        }

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 1,
        });

        console.log("✅ [Mark as Paid] Transaction confirmed!");
        console.log("📦 [Mark as Paid] Receipt:", {
          blockNumber: receipt.blockNumber,
          status: receipt.status,
          gasUsed: receipt.gasUsed.toString(),
        });

        if (receipt.status === "reverted") {
          throw new Error("Transaction reverted");
        }

        console.log("✅ [Mark as Paid] Payment successfully marked as paid!");

        return { success: true, transactionHash: txHash };
      } catch (error: any) {
        console.error("❌ [Mark as Paid] Error:", error);
        console.error("❌ [Mark as Paid] Error message:", error?.message);

        const errorMessage = error?.message || "Failed to mark payment as paid";
        setMarkError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsMarking(false);
        console.log("🏁 [Mark as Paid] Process completed");
      }
    },
    [address, writeContractAsync, publicClient, isTestnet],
  );

  return {
    markAsPaid,
    isMarking,
    markError: markError || writeError?.message || null,
  };
};

/**
 * Hook for checking if a payment request exists
 */
export const usePaymentExists = (
  paymentId: number | null,
  isTestnet: boolean = false,
) => {
  const contractAddress = getPaymentRequestContractAddress(isTestnet);

  const {
    data: exists,
    isLoading,
    error,
  } = useReadContract({
    address: contractAddress,
    abi: PAYMENT_REQUEST_ABI,
    functionName: "paymentExists",
    args: paymentId ? [BigInt(paymentId)] : undefined,
    query: {
      enabled: paymentId !== null && paymentId > 0,
    },
    chainId: isTestnet ? POLYGON_AMOY_CHAIN_ID : POLYGON_CHAIN_ID,
  });

  return {
    exists: Boolean(exists),
    isLoading,
    error: error?.message || null,
  };
};

/**
 * Utility hook for formatting payment request data for display
 */
export const useFormatPaymentRequest = (isTestnet: boolean = false) => {
  const formatPaymentRequest = useCallback(
    (data: PaymentRequestData): FormattedPaymentRequestData => {
      const chainInfo = getChainInfo(data.chainId);
      return {
        ...data,
        formattedAmount: formatUnits(BigInt(data.amount), 6), // 6 decimals for USDC/USDT
        tokenSymbol: data.tokenSymbol,
        chainId: data.chainId,
        chainName: chainInfo?.name || `Chain ${data.chainId}`,
        createdAt: new Date(data.timestamp * 1000),
        paidAtDate: data.paidAt ? new Date(data.paidAt * 1000) : null,
        statusLabel:
          data.status === PaymentStatus.Pending
            ? "Pending"
            : data.status === PaymentStatus.Paid
              ? "Paid"
              : "Cancelled",
        isActive: data.status === PaymentStatus.Pending,
      };
    },
    [],
  );

  return { formatPaymentRequest };
};

/**
 * Combined hook that provides all payment request functionality
 */
export const usePaymentRequest = (isTestnet: boolean = false) => {
  const createHook = useCreatePaymentRequest(isTestnet);
  const markHook = useMarkPaymentAsPaid(isTestnet);
  const formatHook = useFormatPaymentRequest(isTestnet);

  const loadPaymentRequest = useCallback(
    async (paymentId: number): Promise<PaymentRequestRetrievalResult> => {
      // We'll need to create a fresh read for this
      // For now, this is a placeholder - the actual implementation will use useGetPaymentRequest
      return { success: false, error: "Not implemented", exists: false };
    },
    [],
  );

  return {
    // Creation
    createPaymentRequest: createHook.createPaymentRequest,
    isCreating: createHook.isCreating,
    createError: createHook.createError,

    // Marking as paid
    markAsPaid: markHook.markAsPaid,
    isMarking: markHook.isMarking,
    markError: markHook.markError,

    // Utility
    formatPaymentRequest: formatHook.formatPaymentRequest,
    loadPaymentRequest,

    // Helper functions
    formatPaymentId,
  };
};
