"use client";
import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useSwitchChain } from "wagmi";
import { useNexus } from "@/provider/NexusProvider";
import {
  SUPPORTED_CHAINS_IDS,
  SUPPORTED_TOKENS,
} from "@avail-project/nexus-core";
import {
  BNB_CHAIN_ID,
  PAYMENT_STATUS_LABELS,
} from "@/constants/paymentRequest";
import {
  useGetPaymentRequest,
  useMarkPaymentAsPaid,
} from "@/hooks/usePaymentRequest";
import ChainSelect from "./blocks/chain-select";
import TokenSelect from "./blocks/token-select";
import { SourceChainSelector } from "./blocks/source-chain-selector";
import { useTransactionProgress } from "@/hooks/useTransactionProgress";
import { useTransferTransaction } from "@/hooks/useTransferTransaction";
import { useSourceChainBalances } from "@/hooks/useSourceChainBalances";
import { SimulationPreview } from "./shared/simulation-preview";
import IntentModal from "./nexus-modals/intent-modal";
import AllowanceModal from "./nexus-modals/allowance-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { AlertTriangle, CheckCircle, Search } from "lucide-react";
import {
  formatPaymentId,
  parsePaymentId,
  getChainInfo,
} from "@/constants/paymentRequest";

// Define local types
interface PaymentLoadingState {
  paymentId: string;
  isLoading: boolean;
  data: any | null;
  error: string | null;
}

enum PaymentStatus {
  PENDING = 0,
  FULFILLED = 1,
  CANCELLED = 2,
}

interface TransferState {
  selectedChain: SUPPORTED_CHAINS_IDS;
  selectedToken: SUPPORTED_TOKENS | undefined;
  recipientAddress: `0x${string}` | undefined;
  amount: string;
  isTransferring: boolean;
  selectedSourceChains: number[];
  paymentLoading: PaymentLoadingState;
  isPaymentMode: boolean;
}

const NexusTransfer = ({ isTestnet }: { isTestnet: boolean }) => {
  const [state, setState] = useState<TransferState>({
    selectedChain: 56 as SUPPORTED_CHAINS_IDS, // Default to BNB Chain (56)
    selectedToken: undefined,
    recipientAddress: undefined,
    amount: "",
    isTransferring: false,
    selectedSourceChains: [],
    paymentLoading: {
      paymentId: "",
      isLoading: false,
      data: null,
      error: null,
    },
    isPaymentMode: false,
  });
  const {
    nexusSdk,
    intentModal,
    allowanceModal,
    setIntentModal,
    setAllowanceModal,
  } = useNexus();

  const {
    executeTransfer,
    simulation,
    isSimulating,
    simulationError,
    triggerTransferSimulation,
  } = useTransferTransaction();

  // Fetch available source chain balances
  const { availableChains, isLoading: isLoadingBalances } =
    useSourceChainBalances({
      selectedToken: state.selectedToken,
      destinationChainId: state.selectedChain,
      isTestnet,
    });

  // Payment request hooks
  const { getPaymentRequest } = useGetPaymentRequest(
    null,
    isTestnet,
    BNB_CHAIN_ID,
  );
  const { markAsPaid, isMarking } = useMarkPaymentAsPaid(isTestnet);

  // Wallet and network hooks
  const { chain, address: walletAddress } = useAccount();
  const { switchChain } = useSwitchChain();

  useTransactionProgress({
    transactionType: "transfer",
    formData: {
      selectedToken: state.selectedToken,
      amount: state.amount,
      selectedChain: state.selectedChain.toString(),
      recipientAddress: state.recipientAddress,
    },
  });

  // Trigger simulation when transfer parameters change
  useEffect(() => {
    if (
      state.selectedToken &&
      state.amount &&
      state.recipientAddress &&
      state.selectedChain &&
      parseFloat(state.amount) > 0
    ) {
      triggerTransferSimulation({
        token: state.selectedToken,
        amount: state.amount,
        chainId: state.selectedChain,
        recipient: state.recipientAddress,
        sourceChains:
          state.selectedSourceChains.length > 0
            ? state.selectedSourceChains
            : undefined,
      });
    }
  }, [
    state.selectedToken,
    state.amount,
    state.recipientAddress,
    state.selectedChain,
    state.selectedSourceChains,
    triggerTransferSimulation,
  ]);

  const handleChainSelect = (chainId: SUPPORTED_CHAINS_IDS) => {
    setState({ ...state, selectedChain: chainId });
  };

  const handleTokenSelect = (token: SUPPORTED_TOKENS) => {
    setState({ ...state, selectedToken: token });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, amount: e.target.value });
  };

  const handleRecipientAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setState({ ...state, recipientAddress: e.target.value as `0x${string}` });
  };

  const handleSourceChainsChange = (chainIds: number[]) => {
    setState({ ...state, selectedSourceChains: chainIds });
  };

  // Payment ID handlers
  const handlePaymentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({
      ...prevState,
      paymentLoading: {
        ...prevState.paymentLoading,
        paymentId: e.target.value,
        error: null,
      },
    }));
  };

  const loadPaymentRequest = async () => {
    const paymentIdInput = state.paymentLoading.paymentId;
    if (!paymentIdInput.trim()) {
      toast.error("Please enter a payment ID");
      return;
    }

    // Check if connected to BNB Chain Mainnet
    const targetChainId = BNB_CHAIN_ID; // 56
    console.log("🌐 [Load Payment] Current chain:", chain?.id);
    console.log("🌐 [Load Payment] Target chain:", targetChainId);

    if (chain?.id !== targetChainId) {
      console.warn("⚠️ [Load Payment] Wrong network detected");

      toast.error("Wrong Network", {
        description: `Please switch to BNB Chain Mainnet to load payment requests`,
      });

      // Attempt to switch network
      try {
        console.log("🔄 [Load Payment] Attempting to switch network...");
        await switchChain({ chainId: targetChainId });
        console.log("✅ [Load Payment] Network switched successfully");
        toast.success("Switched to BNB Chain Mainnet");
        // Continue with loading after successful switch
      } catch (error: any) {
        console.error("❌ [Load Payment] Failed to switch network:", error);
        setState((prevState) => ({
          ...prevState,
          paymentLoading: {
            ...prevState.paymentLoading,
            error: "Please switch to BNB Chain Mainnet in your wallet",
          },
        }));
        return;
      }
    }

    // Parse payment ID (handle both formatted and raw numbers)
    const parsedId =
      parsePaymentId(paymentIdInput) || parseInt(paymentIdInput, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      setState((prevState) => ({
        ...prevState,
        paymentLoading: {
          ...prevState.paymentLoading,
          error: "Invalid payment ID format",
        },
      }));
      return;
    }

    setState((prevState) => ({
      ...prevState,
      paymentLoading: {
        ...prevState.paymentLoading,
        isLoading: true,
        error: null,
      },
    }));

    try {
      const result = await getPaymentRequest(parsedId);

      if (!result.success) {
        setState((prevState) => ({
          ...prevState,
          paymentLoading: {
            ...prevState.paymentLoading,
            isLoading: false,
            error: result.error || "Failed to load payment request",
          },
        }));
        return;
      }

      if (!result.data) {
        setState((prevState) => ({
          ...prevState,
          paymentLoading: {
            ...prevState.paymentLoading,
            isLoading: false,
            error: "Payment request not found",
          },
        }));
        return;
      }

      // Get chain info for the target chain
      const chainInfo = getChainInfo(result.data.chainId);

      // Format the payment data
      const formattedData = {
        ...result.data,
        formattedAmount: (parseFloat(result.data.amount) / 1000000).toString(), // Convert from wei (6 decimals)
        chainName: chainInfo?.name || `Chain ${result.data.chainId}`,
        createdAt: new Date(result.data.timestamp * 1000),
        paidAtDate: result.data.paidAt
          ? new Date(result.data.paidAt * 1000)
          : null,
        statusLabel: PAYMENT_STATUS_LABELS[result.data.status],
        isActive: result.data.status === PaymentStatus.PENDING,
      };

      setState((prevState) => ({
        ...prevState,
        // Auto-fill form with payment data
        selectedChain: result.data?.chainId as SUPPORTED_CHAINS_IDS,
        selectedToken: result.data?.tokenSymbol as SUPPORTED_TOKENS,
        recipientAddress: result.data?.merchant,
        amount: formattedData.formattedAmount,
        isPaymentMode: true,
        paymentLoading: {
          ...prevState.paymentLoading,
          isLoading: false,
          data: formattedData,
          error: null,
        },
      }));

      toast.success("Payment request loaded successfully!", {
        description: `${formattedData.formattedAmount} ${
          result.data.tokenSymbol
        } to ${result.data.merchant.slice(0, 8)}...`,
      });
    } catch (error: any) {
      console.error("Error loading payment request:", error);
      setState((prevState) => ({
        ...prevState,
        paymentLoading: {
          ...prevState.paymentLoading,
          isLoading: false,
          error: error.message || "Unexpected error loading payment request",
        },
      }));
    }
  };

  const clearPaymentMode = () => {
    setState((prevState) => ({
      ...prevState,
      isPaymentMode: false,
      paymentLoading: {
        paymentId: "",
        isLoading: false,
        data: null,
        error: null,
      },
    }));
  };

  const handleTransfer = async () => {
    if (
      !state.selectedToken ||
      !state.recipientAddress ||
      !state.amount ||
      !state.selectedChain
    ) {
      toast.error("Please fill all the fields");
      return;
    }

    // Validate source chain balance if specific chains are selected
    if (state.selectedSourceChains.length > 0) {
      const selectedChainsBalance = availableChains
        .filter((chain) => state.selectedSourceChains.includes(chain.chainId))
        .reduce((sum, chain) => sum + parseFloat(chain.balance || "0"), 0);

      if (selectedChainsBalance < parseFloat(state.amount)) {
        toast.error("Insufficient balance on selected source chains", {
          description: `Available: ${selectedChainsBalance.toFixed(6)} ${
            state.selectedToken
          }`,
        });
        return;
      }
    }

    setState({ ...state, isTransferring: true });

    try {
      const result = await executeTransfer({
        token: state.selectedToken,
        amount: state.amount,
        chainId: state.selectedChain,
        recipient: state.recipientAddress,
        sourceChains:
          state.selectedSourceChains.length > 0
            ? state.selectedSourceChains
            : undefined,
      });

      console.log("result", result);

      // Check if result has transactionHash (success case) or error property
      if (result && "transactionHash" in result) {
        // If this was a payment request fulfillment, mark it as paid
        if (state.isPaymentMode && state.paymentLoading.data && walletAddress) {
          try {
            const paymentId =
              parsePaymentId(state.paymentLoading.paymentId) ||
              parseInt(state.paymentLoading.paymentId, 10);

            console.log("💳 [Transfer] Marking payment as paid...");
            console.log("💳 [Transfer] Payment ID:", paymentId);
            console.log("💳 [Transfer] Payer (wallet):", walletAddress);
            console.log(
              "💳 [Transfer] Merchant (recipient):",
              state.recipientAddress,
            );

            if (!isNaN(paymentId) && paymentId > 0) {
              // Call markAsPaid with the payer address (connected wallet), not merchant
              const markResult = await markAsPaid(paymentId, walletAddress);

              console.log("✅ [Transfer] Mark as paid result:", markResult);

              if (markResult.success) {
                toast.success("Payment fulfilled successfully!", {
                  description: `Payment request ${formatPaymentId(
                    paymentId,
                  )} has been marked as paid`,
                });
              } else {
                console.error(
                  "❌ [Transfer] Failed to mark as paid:",
                  markResult.error,
                );
                toast.warning("Transfer completed but status update failed", {
                  description:
                    markResult.error || "Please contact the merchant",
                  duration: 7000,
                });
              }
            }
          } catch (error: any) {
            console.error(
              "❌ [Transfer] Error marking payment as paid:",
              error,
            );
            console.error("❌ [Transfer] Error details:", error?.message);
            toast.warning("Transfer completed but status update failed", {
              description: "Please contact the merchant to verify payment",
              duration: 7000,
            });
          }
        }

        // Clear form on successful transfer
        setState({
          ...state,
          amount: "",
          recipientAddress: undefined,
          isTransferring: false,
          isPaymentMode: false,
          paymentLoading: {
            paymentId: "",
            isLoading: false,
            data: null,
            error: null,
          },
        });
      }
    } catch (error: unknown) {
      console.error("Unexpected error in handleTransfer:", error);
    }
  };

  const isValidTransferAmount = state.amount && state.amount !== "";

  return (
    <div className="flex flex-col gap-y-4 py-4">
      {/* Payment ID Section */}
      <Card className="border-none py-3 !shadow-[var(--ck-connectbutton-box-shadow)] !rounded-[var(--ck-connectbutton-border-radius)] bg-accent-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Pay with Payment ID (Optional)
          </CardTitle>
          <CardDescription>
            Enter a payment ID to auto-fill transfer details for a payment
            request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter payment ID (e.g., #000042 or 42)"
                value={state.paymentLoading.paymentId}
                onChange={handlePaymentIdChange}
                disabled={state.paymentLoading.isLoading}
                className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button
              onClick={loadPaymentRequest}
              disabled={
                state.paymentLoading.isLoading ||
                !state.paymentLoading.paymentId.trim()
              }
              variant="outline"
              className="px-4"
            >
              {state.paymentLoading.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Load"
              )}
            </Button>
          </div>

          {/* Error State */}
          {state.paymentLoading.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">
                {state.paymentLoading.error}
              </span>
            </div>
          )}

          {/* Payment Data Display */}
          {state.paymentLoading.data && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Payment Request Loaded
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPaymentMode}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-gray-600">Payment ID</Label>
                  <div className="font-mono">
                    {formatPaymentId(
                      parsePaymentId(state.paymentLoading.paymentId) || 0,
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div>
                    <Badge
                      variant={
                        state.paymentLoading.data.status ===
                        PaymentStatus.PENDING
                          ? "default"
                          : state.paymentLoading.data.status ===
                              PaymentStatus.FULFILLED
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {state.paymentLoading.data.statusLabel}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Amount</Label>
                  <div>
                    {state.paymentLoading.data.formattedAmount}{" "}
                    {state.paymentLoading.data.tokenSymbol}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Merchant</Label>
                  <div className="font-mono text-xs">
                    {state.paymentLoading.data.merchant.slice(0, 8)}...
                    {state.paymentLoading.data.merchant.slice(-6)}
                  </div>
                </div>
              </div>

              {/* Warning for non-pending payments */}
              {state.paymentLoading.data.status !== PaymentStatus.PENDING && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      {state.paymentLoading.data.status ===
                      PaymentStatus.FULFILLED
                        ? "This payment request has already been fulfilled"
                        : "This payment request has been cancelled"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="w-full space-y-4">
        <ChainSelect
          selectedChain={state.selectedChain}
          handleSelect={handleChainSelect}
          isTestnet={isTestnet}
          disabled={state.isPaymentMode}
          chainLabel={
            state.isPaymentMode ? "Destination Chain (Auto-filled)" : undefined
          }
        />
        <TokenSelect
          selectedToken={state.selectedToken}
          selectedChain={state.selectedChain.toString()}
          handleTokenSelect={handleTokenSelect}
          isTestnet={isTestnet}
          disabled={state.isPaymentMode}
        />
        {/* Source Chain Selector - shown only when token is selected */}
        {state.selectedToken && availableChains.length > 0 && (
          <SourceChainSelector
            availableChains={availableChains}
            selectedChainIds={state.selectedSourceChains}
            onSelectionChange={handleSourceChainsChange}
            destinationChainId={state.selectedChain}
            tokenSymbol={state.selectedToken}
            disabled={isLoadingBalances}
          />
        )}
      </div>
      <div className="w-full flex items-center gap-x-2 shadow-[var(--ck-connectbutton-box-shadow)] rounded-[var(--ck-connectbutton-border-radius)]">
        <Input
          type="text"
          placeholder={
            state.isPaymentMode
              ? "Merchant address (auto-filled)"
              : "Recipient address"
          }
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={
            state.recipientAddress
              ? nexusSdk?.utils.truncateAddress(state.recipientAddress, 6, 6)
              : ""
          }
          onChange={handleRecipientAddressChange}
          disabled={!state.selectedToken || state.isPaymentMode}
        />
      </div>
      <div className="w-full flex items-center gap-x-2 shadow-[var(--ck-connectbutton-box-shadow)] rounded-[var(--ck-connectbutton-border-radius)]">
        <Input
          type="text"
          placeholder={
            state.isPaymentMode ? "Payment amount (auto-filled)" : "Amount"
          }
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={state.amount}
          onChange={handleAmountChange}
          disabled={!state.selectedToken || state.isPaymentMode}
        />
      </div>

      {/* Transfer Simulation Preview */}
      {state.selectedToken &&
        state.amount &&
        state.recipientAddress &&
        parseFloat(state.amount) > 0 && (
          <SimulationPreview
            simulation={simulation}
            isSimulating={isSimulating}
            simulationError={simulationError}
            title="Transfer Cost Estimate"
            className="w-full"
          />
        )}

      <Button
        variant="connectkit"
        className="w-full font-semibold"
        onClick={handleTransfer}
        disabled={!isValidTransferAmount || state.isTransferring || isMarking}
      >
        {state.isTransferring || isMarking ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {state.isPaymentMode ? "Fulfilling Payment..." : "Transferring..."}
          </>
        ) : state.isPaymentMode ? (
          "Fulfill Payment Request"
        ) : (
          "Continue"
        )}
      </Button>
      {intentModal && (
        <IntentModal
          intentModal={intentModal}
          setIntentModal={setIntentModal}
        />
      )}

      {allowanceModal && (
        <AllowanceModal
          allowanceModal={allowanceModal}
          setAllowanceModal={setAllowanceModal}
        />
      )}
    </div>
  );
};

export default NexusTransfer;
