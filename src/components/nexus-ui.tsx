"use client";

import React from "react";

// Import actual Nexus Elements components
import UnifiedBalance from "@/components/unified-balance/unified-balance";
import SwapWidget from "@/components/swaps/swap-widget";
import FastTransferWithPayment from "@/components/nexus-ui/fast-transfer-with-payment";

interface NexusUIProps {
  isTestnet?: boolean;
  activeTab?: string;
}

const NexusUI: React.FC<NexusUIProps> = ({
  isTestnet = false,
  activeTab = "unified-balance",
}) => {
  const renderContent = () => {
    switch (activeTab) {
      case "unified-balance":
        return (
          <div className="flex flex-col items-center justify-center p-4 rounded-xl">
            <UnifiedBalance />
          </div>
        );
      case "swap":
        return (
          <div className="flex flex-col items-center justify-center">
            <SwapWidget />
          </div>
        );
      case "fast-transfer":
        return (
          <div className="flex flex-col items-center justify-center">
            <FastTransferWithPayment isTestnet={isTestnet} />
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="w-full max-w-4xl mx-auto">{renderContent()}</div>;
};

export default NexusUI;
