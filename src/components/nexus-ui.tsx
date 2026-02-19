"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ArrowLeftRight, Zap } from "lucide-react";

// Import actual Nexus Elements components
import UnifiedBalance from "@/components/unified-balance/unified-balance";
import SwapWidget from "@/components/swaps/swap-widget";
import FastTransfer from "@/components/transfer/transfer";

interface NexusUIProps {
  isTestnet?: boolean;
}

const NexusUI: React.FC<NexusUIProps> = ({ isTestnet = false }) => {
  const [activeTab, setActiveTab] = useState("unified-balance");

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Nexus UI Elements
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore powerful cross-chain DeFi components powered by Avail Nexus
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="unified-balance"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-700 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:data-[state=inactive]:text-gray-300"
          >
            <BarChart3 className="h-4 w-4" />
            Unified Balance
          </TabsTrigger>
          <TabsTrigger
            value="swap"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-700 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:data-[state=inactive]:text-gray-300"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </TabsTrigger>
          <TabsTrigger
            value="fast-transfer"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-700 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:data-[state=inactive]:text-gray-300"
          >
            <Zap className="h-4 w-4" />
            Fast Transfer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unified-balance" className="mt-6">
          <div className="flex flex-col items-center justify-center">
            <UnifiedBalance />
          </div>
        </TabsContent>

        <TabsContent value="swap" className="mt-6">
          <div className="flex flex-col items-center justify-center">
            <SwapWidget />
          </div>
        </TabsContent>

        <TabsContent value="fast-transfer" className="mt-6">
          <div className="flex flex-col items-center justify-center">
            <FastTransfer />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
          About Nexus Elements
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Nexus Elements are prebuilt React components with full Nexus SDK
          integration, designed for plug-and-play cross-chain DeFi
          functionality. These components provide unified balances, swaps, and
          transfers across multiple blockchain networks.
        </p>
      </div>
    </div>
  );
};

export default NexusUI;
