"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, AlertTriangle, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { isAddress } from "viem";
import { useAccount, useSwitchChain } from "wagmi";

import { useCreatePaymentRequest } from "@/hooks/usePaymentRequest";
import {
  SUPPORTED_PAYMENT_TOKENS,
  SUPPORTED_CHAINS,
  formatPaymentId,
  getTokenInfo,
  POLYGON_CHAIN_ID,
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
    chainId: 137, // Default to Polygon
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

      // Support both Polygon and BNB Chain
      const supportedChainIds = [POLYGON_CHAIN_ID, BNB_CHAIN_ID];
      const defaultChainId = POLYGON_CHAIN_ID; // Default to Polygon

      console.log("🌐 [Payment Request] Current chain:", chain.id);
      console.log("🌐 [Payment Request] Supported chains:", supportedChainIds);

      if (!supportedChainIds.includes(chain.id)) {
        console.warn("⚠️ [Payment Request] Wrong network detected");

        toast.error("Wrong Network", {
          description: "Switching to Polygon Mainnet...",
        });

        try {
          console.log("🔄 [Payment Request] Attempting to switch network...");
          await switchChain({ chainId: defaultChainId });
          console.log("✅ [Payment Request] Network switched successfully");
          toast.success("Switched to Polygon Mainnet", {
            description: "You can now create payment requests",
          });
        } catch (error: any) {
          console.error(
            "❌ [Payment Request] Failed to switch network:",
            error,
          );
          toast.error("Network Switch Required", {
            description:
              "Please switch to Polygon or BNB Chain in your wallet to create payment requests",
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

      // Check if on correct network before submitting (support both Polygon and BNB)
      const supportedChainIds = [POLYGON_CHAIN_ID, BNB_CHAIN_ID];
      if (chain?.id && !supportedChainIds.includes(chain.id)) {
        console.warn("⚠️ [Create Form] Wrong network detected");
        toast.error("Wrong Network", {
          description:
            "Please switch to Polygon or BNB Chain to create payment requests",
        });

        try {
          console.log("🔄 [Create Form] Attempting to switch network...");
          await switchChain({ chainId: POLYGON_CHAIN_ID });
          toast.success("Switched to Polygon Mainnet");
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
        <Card className="border-green-500 bg-green-50">
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
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {createError}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Card className="border-none py-4 !shadow-[var(--ck-connectbutton-box-shadow)] !rounded-[var(--ck-connectbutton-border-radius)] bg-accent-foreground">
        <CardHeader>
          <CardTitle className="text-xl">Create Payment Request</CardTitle>
          <CardDescription>
            Generate a payment request that customers can fulfill via
            cross-chain transfers
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Merchant Address */}
            <div className="space-y-2">
              <Label
                htmlFor="merchantAddress"
                className="text-sm font-semibold"
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
                  className={`pr-20 ${
                    validationErrors.merchantAddress ? "border-red-500" : ""
                  }`}
                />
                {address && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={setMerchantToSelf}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 h-6"
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

            {/* Blockchain Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Destination Blockchain
              </Label>
              <Select
                value={formData.chainId.toString()}
                onValueChange={(value) =>
                  handleInputChange("chainId", parseInt(value))
                }
              >
                <SelectTrigger
                  className={validationErrors.chainId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select blockchain" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CHAINS.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{chain.icon}</span>
                        <div className="flex flex-col">
                          <span className="font-medium">{chain.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Chain ID: {chain.id} • {chain.symbol}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.chainId && (
                <p className="text-sm text-red-600">
                  {validationErrors.chainId}
                </p>
              )}
            </div>

            {/* Token Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Payment Token</Label>
              <Select
                value={formData.selectedToken}
                onValueChange={(value: SupportedPaymentToken) =>
                  handleInputChange("selectedToken", value)
                }
              >
                <SelectTrigger
                  className={
                    validationErrors.selectedToken ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_PAYMENT_TOKENS.map((token) => {
                    const tokenInfo = getTokenInfo(token);
                    return (
                      <SelectItem key={token} value={token}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{token}</span>
                          <span className="text-sm text-muted-foreground">
                            {tokenInfo.name}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {validationErrors.selectedToken && (
                <p className="text-sm text-red-600">
                  {validationErrors.selectedToken}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold">
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
                  className={`pr-20 ${
                    validationErrors.requestedAmount ? "border-red-500" : ""
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {formData.selectedToken}
                </div>
              </div>
              {validationErrors.requestedAmount && (
                <p className="text-sm text-red-600">
                  {validationErrors.requestedAmount}
                </p>
              )}
            </div>

            {/* Info Alert */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                Payment requests are stored on-chain. Customers can pay from any
                supported network and the funds will arrive on your selected
                blockchain.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isConnected || isCreating}
              className="w-full font-semibold"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
