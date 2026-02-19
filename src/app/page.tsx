"use client";
import { useState } from "react";
import Nexus from "@/components/nexus";
import Header from "@/components/layout/header";
import IntentProgress from "@/components/shared/intent-progress";
import { useIntentProgress } from "@/hooks/useIntentProgress";
import { InitNexusOnConnect } from "@/components/nexus/InitNexusOnConnect";

export default function Home() {
  // Use Polygon Mainnet (where PaymentRequest contract is deployed)
  // Contract Address: 0xde97e0707A81600db65228e72dC0D8256C7DCe5B
  const isTestnet = false;
  const [activeTab, setActiveTab] = useState("nexus-ui");
  const { isProgressVisible, currentStep, hideProgress } = useIntentProgress();

  return (
    <>
      <InitNexusOnConnect />
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isTestnet={isTestnet}
      />
      <main className="w-full min-h-screen bg-[#EFF6FF]">
        <div className="w-full pt-8 pb-12 flex flex-col gap-y-6 items-center justify-start">
          <Nexus isTestnet={isTestnet} activeTab={activeTab} />
        </div>
      </main>
      <IntentProgress
        currentStep={currentStep}
        isVisible={isProgressVisible}
        onClose={hideProgress}
      />
    </>
  );
}
