"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isAddress } from "viem";
import { useAccount, useSwitchChain } from "wagmi";

import { useCreatePaymentRequest } from "@/hooks/usePaymentRequest";
import {
  SUPPORTED_PAYMENT_TOKENS,
  SUPPORTED_CHAINS,
  formatPaymentId,
  getTokenInfo,
  BNB_CHAIN_ID,
} from "@/constants/paymentRequest";
import {
  PaymentRequestFormData,
  PaymentRequestComponentProps,
  SupportedPaymentToken,
} from "@/types/payment-request";

interface CreatePaymentRequestProps extends PaymentRequestComponentProps {
  className?: string;
}

const CreatePaymentRequest: React.FC<CreatePaymentRequestProps> = ({
  isTestnet = false,
  onSuccess,
  onError,
  className = "",
}) => {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  // Form state (extended with chain selection)
  const [formData, setFormData] = useState<PaymentRequestFormData>({
    merchantAddress: "" as `0x${string}`,
    chainId: 56, // Default to BNB Chain
    selectedToken: "USDC" as SupportedPaymentToken,
    requestedAmount: "",
  });

  // UI state
  const [createdPaymentId, setCreatedPaymentId] = useState<number | null>(null);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(
    null,
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);

  // Hook for creating payment requests
  const { createPaymentRequest, isCreating, createError } =
    useCreatePaymentRequest(isTestnet);

  // Supported tokens are now cross-chain
  const supportedTokens = SUPPORTED_PAYMENT_TOKENS;

  // Check and switch to appropriate network when component loads
  // Supports both Polygon and BNB Chain for payment requests
  useEffect(() => {
    const checkAndSwitchNetwork = async () => {
      if (!isConnected || !chain) {
        console.log("⏸️ [Payment Request] Wallet not connected yet");
        return;
      }

      // Use only BNB Chain for payment requests
      const supportedChainIds = [BNB_CHAIN_ID];
      const defaultChainId = BNB_CHAIN_ID; // Default to BNB Chain

      console.log("🌐 [Payment Request] Current chain:", chain.id);
      console.log("🌐 [Payment Request] Supported chains:", supportedChainIds);

      if (!supportedChainIds.includes(chain.id)) {
        console.warn("⚠️ [Payment Request] Wrong network detected");

        toast.error("Wrong Network", {
          description: "Switching to BNB Chain Mainnet...",
        });

        try {
          console.log("🔄 [Payment Request] Attempting to switch network...");
          await switchChain({ chainId: defaultChainId });
          console.log("✅ [Payment Request] Network switched successfully");
          toast.success("Switched to BNB Chain Mainnet", {
            description: "You can now create payment requests",
          });
        } catch (error: any) {
          console.error(
            "❌ [Payment Request] Failed to switch network:",
            error,
          );
          toast.error("Network Switch Required", {
            description:
              "Please switch to BNB Chain in your wallet to create payment requests",
            duration: 5000,
          });
        }
      } else {
        console.log("✅ [Payment Request] Already on supported network");
      }
    };

    checkAndSwitchNetwork();
  }, [isConnected, chain, switchChain]);

  // Validation function
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Validate merchant address
    if (!formData.merchantAddress) {
      errors.merchantAddress = "Merchant address is required";
    } else if (!isAddress(formData.merchantAddress)) {
      errors.merchantAddress = "Please enter a valid Ethereum address";
    }

    // Validate chain selection
    if (!formData.chainId) {
      errors.chainId = "Please select a blockchain";
    }

    // Validate token selection
    if (!formData.selectedToken) {
      errors.selectedToken = "Please select a token";
    }

    // Validate amount
    if (!formData.requestedAmount) {
      errors.requestedAmount = "Amount is required";
    } else {
      const amount = parseFloat(formData.requestedAmount);
      if (isNaN(amount) || amount <= 0) {
        errors.requestedAmount = "Please enter a valid amount greater than 0";
      } else if (amount > 1000000) {
        errors.requestedAmount = "Amount too large (max: 1,000,000)";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      console.log("📋 [Create Form] Form submitted");
      console.log("📋 [Create Form] Form data:", formData);

      if (!isConnected) {
        console.warn("⚠️ [Create Form] Wallet not connected");
        toast.error("Please connect your wallet first");
        return;
      }

      // Check if on correct network before submitting (only BNB Chain)
      const supportedChainIds = [BNB_CHAIN_ID];
      if (chain?.id && !supportedChainIds.includes(chain.id)) {
        console.warn("⚠️ [Create Form] Wrong network detected");
        toast.error("Wrong Network", {
          description: "Please switch to BNB Chain to create payment requests",
        });

        try {
          console.log("🔄 [Create Form] Attempting to switch network...");
          await switchChain({ chainId: BNB_CHAIN_ID });
          toast.success("Switched to BNB Chain Mainnet");
        } catch (error) {
          console.error("❌ [Create Form] Failed to switch network:", error);
          return;
        }
      }

      if (!validateForm()) {
        console.warn("⚠️ [Create Form] Form validation failed");
        toast.error("Please fix the form errors");
        return;
      }

      try {
        console.log("🚀 [Create Form] Calling createPaymentRequest hook...");
        const result = await createPaymentRequest(
          formData.merchantAddress,
          formData.selectedToken,
          formData.chainId,
          formData.requestedAmount,
        );

        console.log("📥 [Create Form] Received result:", result);

        if (result.success && result.paymentId && result.transactionHash) {
          console.log("✅ [Create Form] Payment request created successfully!");
          console.log("🎯 [Create Form] Payment ID:", result.paymentId);
          console.log(
            "📝 [Create Form] Transaction hash:",
            result.transactionHash,
          );

          setCreatedPaymentId(result.paymentId);
          setTransactionHash(result.transactionHash as `0x${string}`);

          toast.success("Payment request created successfully!", {
            description: `Payment ID: ${formatPaymentId(result.paymentId)}`,
            duration: 5000,
          });

          // Reset form
          setFormData({
            merchantAddress: "" as `0x${string}`,
            chainId: 137, // Reset to Polygon
            selectedToken: "USDC",
            requestedAmount: "",
          });
          setValidationErrors({});

          // Call onSuccess callback if provided
          onSuccess?.(result.paymentId);
        } else {
          console.error(
            "❌ [Create Form] Payment request creation failed:",
            result.error,
          );
          toast.error("Failed to create payment request", {
            description: result.error,
          });
          onError?.(result.error || "Unknown error");
        }
      } catch (error: any) {
        console.error("❌ [Create Form] Unexpected error:", error);
        console.error("❌ [Create Form] Error details:", error?.message);
        toast.error("Unexpected error occurred");
        onError?.(error.message || "Unexpected error");
      }
    },
    [
      formData,
      isConnected,
      chain,
      switchChain,
      validateForm,
      createPaymentRequest,
      onSuccess,
      onError,
    ],
  );

  // Handle input changes
  const handleInputChange = useCallback(
    (field: string, value: string | number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear validation error for this field
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [validationErrors],
  );

  // Copy payment ID to clipboard
  const copyPaymentId = useCallback(async () => {
    if (createdPaymentId) {
      const formattedId = formatPaymentId(createdPaymentId);
      await navigator.clipboard.writeText(formattedId);
      setShowCopiedFeedback(true);
      toast.success("Payment ID copied to clipboard!");

      setTimeout(() => setShowCopiedFeedback(false), 2000);
    }
  }, [createdPaymentId]);

  // Set max amount to self address (for testing)
  const setMerchantToSelf = useCallback(() => {
    if (address) {
      handleInputChange("merchantAddress", address);
    }
  }, [address, handleInputChange]);

  return (
    <div className={`flex flex-col gap-y-4 py-4 ${className}`}>
      {/* Success State - Show created payment ID */}
      {createdPaymentId && (
        <Card className="border-green-500 bg-green-50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="flex-1">
                <div className="text-lg font-semibold text-green-800 mb-1">
                  Payment Request Created!
                </div>
                <div className="text-sm text-green-700 mb-2">
                  Share this Payment ID with your customer:
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-lg font-mono bg-white px-3 py-1"
                  >
                    {formatPaymentId(createdPaymentId)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyPaymentId}
                    className="h-8 px-2 text-green-600 hover:text-green-700"
                  >
                    {showCopiedFeedback ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            {transactionHash && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="text-sm text-green-700 mb-1 font-medium">
                  Transaction Hash:
                </div>
                <a
                  href={`https://polygonscan.com/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:text-green-800 hover:underline font-mono break-all flex items-start gap-1"
                >
                  <span>{transactionHash}</span>
                  <svg
                    className="w-3 h-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {createError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 text-sm">{createError}</span>
        </div>
      )}

      {/* Main Form */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Merchant Address */}
            <div className="space-y-2">
              <Label
                htmlFor="merchantAddress"
                className="text-sm font-semibold text-gray-700"
              >
                Merchant Address
              </Label>
              <div className="relative">
                <Input
                  id="merchantAddress"
                  type="text"
                  placeholder="0x..."
                  value={formData.merchantAddress}
                  onChange={(e) =>
                    handleInputChange("merchantAddress", e.target.value)
                  }
                  className={`pr-20 h-12 rounded-xl bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-100 ${
                    validationErrors.merchantAddress ? "border-red-500" : ""
                  }`}
                />
                {address && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={setMerchantToSelf}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 h-7 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    Use Mine
                  </Button>
                )}
              </div>
              {validationErrors.merchantAddress && (
                <p className="text-sm text-red-600">
                  {validationErrors.merchantAddress}
                </p>
              )}
            </div>

            {/* Blockchain, Token, Amount Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Blockchain Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Destination Blockchain
                </Label>
                <Select
                  value={formData.chainId.toString()}
                  onValueChange={(value) =>
                    handleInputChange("chainId", parseInt(value))
                  }
                >
                  <SelectTrigger
                    className={`h-12 rounded-xl bg-white border-blue-100 focus:ring-blue-100 ${
                      validationErrors.chainId ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select Chain" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {SUPPORTED_CHAINS.map((chain) => (
                      <SelectItem
                        key={chain.id}
                        value={chain.id.toString()}
                        className="rounded-lg my-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{chain.icon}</span>
                          <span className="font-medium">{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.chainId && (
                  <p className="text-xs text-red-600">
                    {validationErrors.chainId}
                  </p>
                )}
              </div>

              {/* Token Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Payment Token
                </Label>
                <Select
                  value={formData.selectedToken}
                  onValueChange={(value: SupportedPaymentToken) =>
                    handleInputChange("selectedToken", value)
                  }
                >
                  <SelectTrigger
                    className={`h-12 rounded-xl bg-white border-blue-100 focus:ring-blue-100 ${
                      validationErrors.selectedToken ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select Token" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {SUPPORTED_PAYMENT_TOKENS.map((token) => {
                      const tokenInfo = getTokenInfo(token);
                      return (
                        <SelectItem
                          key={token}
                          value={token}
                          className="rounded-lg my-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{token}</span>
                            <span className="text-xs text-muted-foreground">
                              {tokenInfo.name}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {validationErrors.selectedToken && (
                  <p className="text-xs text-red-600">
                    {validationErrors.selectedToken}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label
                  htmlFor="amount"
                  className="text-sm font-semibold text-gray-700"
                >
                  Requested Amount
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.000001"
                    min="0"
                    placeholder="0.0"
                    value={formData.requestedAmount}
                    onChange={(e) =>
                      handleInputChange("requestedAmount", e.target.value)
                    }
                    className={`pr-16 h-12 rounded-xl bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-100 ${
                      validationErrors.requestedAmount ? "border-red-500" : ""
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                    {formData.selectedToken}
                  </div>
                </div>
                {validationErrors.requestedAmount && (
                  <p className="text-xs text-red-600">
                    {validationErrors.requestedAmount}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isConnected || isCreating}
              className="w-full h-12 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Request...
                </>
              ) : !isConnected ? (
                "Connect Wallet to Create"
              ) : (
                "Create Payment Request"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePaymentRequest;
