"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Search, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useSwitchChain } from "wagmi";
import { useGetPaymentRequest } from "@/hooks/usePaymentRequest";
import {
  formatPaymentId,
  parsePaymentId,
  getChainInfo,
  BNB_CHAIN_ID,
  PAYMENT_STATUS_LABELS,
} from "@/constants/paymentRequest";
import { PaymentStatus } from "@/types/payment-request";
import type {
  SUPPORTED_CHAINS_IDS,
  SUPPORTED_TOKENS,
} from "@avail-project/nexus-core";

export interface PaymentData {
  merchant: `0x${string}`;
  tokenSymbol: string;
  chainId: number;
  amount: string;
  status: PaymentStatus;
  timestamp: number;
  paidAt?: number | null;
  payer?: `0x${string}` | null;
  formattedAmount: string;
  chainName: string;
  createdAt: Date;
  paidAtDate: Date | null;
  statusLabel: string;
  isActive: boolean;
}

export interface PaymentLoaderProps {
  isTestnet: boolean;
  onPaymentLoaded: (data: {
    chainId: SUPPORTED_CHAINS_IDS;
    token: SUPPORTED_TOKENS;
    recipient: `0x${string}`;
    amount: string;
    paymentId: string;
    paymentData: PaymentData;
  }) => void;
  onPaymentCleared: () => void;
  isPaymentMode: boolean;
  paymentData: PaymentData | null;
  className?: string;
}

const PaymentLoader: React.FC<PaymentLoaderProps> = ({
  isTestnet,
  onPaymentLoaded,
  onPaymentCleared,
  isPaymentMode,
  paymentData,
  className = "",
}) => {
  const [paymentId, setPaymentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { getPaymentRequest } = useGetPaymentRequest(
    null,
    isTestnet,
    BNB_CHAIN_ID,
  );

  const handlePaymentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentId(e.target.value);
    setError(null);
  };

  const loadPaymentRequest = async () => {
    if (!paymentId.trim()) {
      toast.error("Please enter a payment ID");
      return;
    }

    const targetChainId = BNB_CHAIN_ID;

    if (chain?.id !== targetChainId) {
      toast.error("Wrong Network", {
        description:
          "Please switch to BNB Chain Mainnet to load payment requests",
      });

      try {
        await switchChain({ chainId: targetChainId });
        toast.success("Switched to BNB Chain Mainnet");
      } catch (error: any) {
        setError("Please switch to BNB Chain Mainnet in your wallet");
        return;
      }
    }

    const parsedId = parsePaymentId(paymentId) || parseInt(paymentId, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      setError("Invalid payment ID format");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getPaymentRequest(parsedId);

      if (!result.success) {
        setError(result.error || "Failed to load payment request");
        setIsLoading(false);
        return;
      }

      if (!result.data) {
        setError("Payment request not found");
        setIsLoading(false);
        return;
      }

      const chainInfo = getChainInfo(result.data.chainId);

      const formattedData: PaymentData = {
        ...result.data,
        formattedAmount: (parseFloat(result.data.amount) / 1000000).toString(),
        chainName: chainInfo?.name || `Chain ${result.data.chainId}`,
        createdAt: new Date(result.data.timestamp * 1000),
        paidAtDate: result.data.paidAt
          ? new Date(result.data.paidAt * 1000)
          : null,
        statusLabel: PAYMENT_STATUS_LABELS[result.data.status],
        isActive: result.data.status === PaymentStatus.Pending,
      };

      onPaymentLoaded({
        chainId: result.data.chainId as SUPPORTED_CHAINS_IDS,
        token: result.data.tokenSymbol as SUPPORTED_TOKENS,
        recipient: result.data.merchant,
        amount: formattedData.formattedAmount,
        paymentId: paymentId,
        paymentData: formattedData,
      });

      toast.success("Payment request loaded successfully!", {
        description: `${formattedData.formattedAmount} ${result.data.tokenSymbol} to ${result.data.merchant.slice(0, 8)}...`,
      });

      setIsLoading(false);
    } catch (error: any) {
      console.error("Error loading payment request:", error);
      setError(error.message || "Unexpected error loading payment request");
      setIsLoading(false);
    }
  };

  const clearPayment = () => {
    setPaymentId("");
    setError(null);
    onPaymentCleared();
  };

  return (
    <Card
      className={`border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <Search className="w-5 h-5" />
          Pay with Payment ID (Optional)
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Enter a payment ID to auto-fill transfer details for a payment request
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Enter payment ID (e.g., #000042 or 42)"
              value={paymentId}
              onChange={handlePaymentIdChange}
              disabled={isLoading || isPaymentMode}
              className="border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-950/50 focus:border-blue-400"
            />
          </div>
          <Button
            onClick={loadPaymentRequest}
            disabled={isLoading || !paymentId.trim() || isPaymentMode}
            className="px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load"}
          </Button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">
              {error}
            </span>
          </div>
        )}

        {paymentData && (
          <div className="mt-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800 dark:text-green-200">
                  Payment Request Loaded
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearPayment}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-gray-600 dark:text-gray-400">
                  Payment ID
                </Label>
                <div className="font-mono text-gray-900 dark:text-gray-100">
                  {formatPaymentId(parsePaymentId(paymentId) || 0)}
                </div>
              </div>
              <div>
                <Label className="text-gray-600 dark:text-gray-400">
                  Status
                </Label>
                <div>
                  <Badge
                    variant={
                      paymentData.status === PaymentStatus.Pending
                        ? "default"
                        : paymentData.status === PaymentStatus.Paid
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {paymentData.statusLabel}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-600 dark:text-gray-400">
                  Amount
                </Label>
                <div className="text-gray-900 dark:text-gray-100">
                  {paymentData.formattedAmount} {paymentData.tokenSymbol}
                </div>
              </div>
              <div>
                <Label className="text-gray-600 dark:text-gray-400">
                  Merchant
                </Label>
                <div className="font-mono text-xs text-gray-900 dark:text-gray-100">
                  {paymentData.merchant.slice(0, 8)}...
                  {paymentData.merchant.slice(-6)}
                </div>
              </div>
            </div>

            {paymentData.status !== PaymentStatus.Pending && (
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    {paymentData.status === PaymentStatus.Paid
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
  );
};

export default PaymentLoader;
