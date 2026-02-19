"use client";

import React, { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import FastTransfer from "@/components/transfer/transfer";
import PaymentLoader, { type PaymentData } from "./payment-loader";
import { useMarkPaymentAsPaid } from "@/hooks/usePaymentRequest";
import { formatPaymentId, parsePaymentId } from "@/constants/paymentRequest";
import type { SUPPORTED_CHAINS_IDS, SUPPORTED_TOKENS } from "@avail-project/nexus-core";

interface FastTransferWithPaymentProps {
  isTestnet?: boolean;
}

interface PaymentState {
  isPaymentMode: boolean;
  paymentId: string;
  paymentData: PaymentData | null;
  prefill: {
    token: SUPPORTED_TOKENS;
    chainId: SUPPORTED_CHAINS_IDS;
    amount: string;
    recipient: `0x${string}`;
  } | undefined;
}

const FastTransferWithPayment: React.FC<FastTransferWithPaymentProps> = ({
  isTestnet = false,
}) => {
  const { address: walletAddress } = useAccount();
  const { markAsPaid } = useMarkPaymentAsPaid(isTestnet);

  const [paymentState, setPaymentState] = useState<PaymentState>({
    isPaymentMode: false,
    paymentId: "",
    paymentData: null,
    prefill: undefined,
  });

  const handlePaymentLoaded = useCallback((data: {
    chainId: SUPPORTED_CHAINS_IDS;
    token: SUPPORTED_TOKENS;
    recipient: `0x${string}`;
    amount: string;
    paymentId: string;
    paymentData: PaymentData;
  }) => {
    setPaymentState({
      isPaymentMode: true,
      paymentId: data.paymentId,
      paymentData: data.paymentData,
      prefill: {
        token: data.token,
        chainId: data.chainId,
        amount: data.amount,
        recipient: data.recipient,
      },
    });
  }, []);

  const handlePaymentCleared = useCallback(() => {
    setPaymentState({
      isPaymentMode: false,
      paymentId: "",
      paymentData: null,
      prefill: undefined,
    });
  }, []);

  const handleTransferComplete = useCallback(async (explorerUrl?: string) => {
    if (paymentState.isPaymentMode && paymentState.paymentData && walletAddress) {
      try {
        const paymentId = parsePaymentId(paymentState.paymentId) || parseInt(paymentState.paymentId, 10);

        if (!isNaN(paymentId) && paymentId > 0) {
          const markResult = await markAsPaid(paymentId, walletAddress);

          if (markResult.success) {
            toast.success("Payment fulfilled successfully!", {
              description: `Payment request ${formatPaymentId(paymentId)} has been marked as paid`,
            });
          } else {
            toast.warning("Transfer completed but status update failed", {
              description: markResult.error || "Please contact the merchant",
              duration: 7000,
            });
          }
        }
      } catch (error: any) {
        console.error("Error marking payment as paid:", error);
        toast.warning("Transfer completed but status update failed", {
          description: "Please contact the merchant to verify payment",
          duration: 7000,
        });
      }
    }

    // Clear payment state after completion
    handlePaymentCleared();
  }, [paymentState, walletAddress, markAsPaid, handlePaymentCleared]);

  const handleTransferError = useCallback((message: string) => {
    toast.error("Transfer failed", { description: message });
  }, []);

  return (
    <div className="w-full flex flex-col gap-4">
      <PaymentLoader
        isTestnet={isTestnet}
        onPaymentLoaded={handlePaymentLoaded}
        onPaymentCleared={handlePaymentCleared}
        isPaymentMode={paymentState.isPaymentMode}
        paymentData={paymentState.paymentData}
      />
      
      <FastTransfer
        prefill={paymentState.prefill}
        onComplete={handleTransferComplete}
        onError={handleTransferError}
      />
    </div>
  );
};

export default FastTransferWithPayment;
