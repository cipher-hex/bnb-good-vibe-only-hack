"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, ArrowLeftRight, Zap } from "lucide-react";

// Import actual Nexus Elements components
import UnifiedBalance from "@/components/unified-balance/unified-balance";
import SwapWidget from "@/components/swaps/swap-widget";
import FastTransferWithPayment from "@/components/nexus-ui/fast-transfer-with-payment";

interface NexusUIProps {
  isTestnet?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const NexusUI: React.FC<NexusUIProps> = ({
  isTestnet = false,
  activeTab: externalActiveTab,
  onTabChange,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState("unified-balance");

  // Use external tab control if provided, otherwise use internal state
  const activeTab = externalActiveTab ?? internalActiveTab;
  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 bg-blue-100 dark:bg-blue-900/40 p-1 rounded-xl">
          <TabsTrigger
            value="unified-balance"
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all
              data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md
              data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-200/50
              dark:data-[state=active]:bg-blue-500 dark:data-[state=active]:text-white
              dark:data-[state=inactive]:text-blue-300 dark:data-[state=inactive]:hover:bg-blue-800/50"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Unified Balance</span>
            <span className="sm:hidden">Balance</span>
          </TabsTrigger>
          <TabsTrigger
            value="swap"
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all
              data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md
              data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-200/50
              dark:data-[state=active]:bg-blue-500 dark:data-[state=active]:text-white
              dark:data-[state=inactive]:text-blue-300 dark:data-[state=inactive]:hover:bg-blue-800/50"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </TabsTrigger>
          <TabsTrigger
            value="fast-transfer"
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all
              data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md
              data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-200/50
              dark:data-[state=active]:bg-blue-500 dark:data-[state=active]:text-white
              dark:data-[state=inactive]:text-blue-300 dark:data-[state=inactive]:hover:bg-blue-800/50"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Fast Transfer</span>
            <span className="sm:hidden">Transfer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unified-balance" className="mt-6">
          <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-xl border border-blue-100 dark:border-blue-900">
            <UnifiedBalance className="[&_*]:text-gray-900 dark:[&_*]:text-gray-100" />
          </div>
        </TabsContent>

        <TabsContent value="swap" className="mt-6">
          <div className="flex flex-col items-center justify-center">
            <SwapWidget />
          </div>
        </TabsContent>

        <TabsContent value="fast-transfer" className="mt-6">
          <div className="flex flex-col items-center justify-center">
            <FastTransferWithPayment isTestnet={isTestnet} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NexusUI;
