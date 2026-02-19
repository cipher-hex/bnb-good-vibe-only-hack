"use client";
import { useState } from "react";
import Header from "@/components/layout/header";
import IntentProgress from "@/components/shared/intent-progress";
import { useIntentProgress } from "@/hooks/useIntentProgress";
import { InitNexusOnConnect } from "@/components/nexus/InitNexusOnConnect";
import NexusUI from "@/components/nexus-ui";
import CreatePaymentRequest from "@/components/payment-request/create-payment-request";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const isTestnet = false;
  const [activeTab, setActiveTab] = useState("unified-balance");
  const { isProgressVisible, currentStep, hideProgress } = useIntentProgress();

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "unified-balance":
      case "swap":
      case "fast-transfer":
        return (
          <NexusUI
            isTestnet={isTestnet}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );
      case "payment-request":
        return <CreatePaymentRequest isTestnet={isTestnet} />;
      default:
        return (
          <NexusUI
            isTestnet={isTestnet}
            activeTab="unified-balance"
            onTabChange={setActiveTab}
          />
        );
    }
  };

  return (
    <>
      <InitNexusOnConnect />
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isTestnet={isTestnet}
      />
      <main className="w-full min-h-screen bg-[#EFF6FF]">
        <div className="w-full pt-8 pb-12 flex flex-col gap-y-6 items-center justify-start px-4">
          <Card className="bg-white shadow-2xl rounded-3xl border-none mx-auto w-[95%] max-w-4xl overflow-hidden">
            <CardHeader className="flex flex-col w-full items-center px-8 pt-8 pb-6">
              <CardTitle className="text-3xl font-bold text-[#1E293B] mb-2">
                Welcome to Trans-Pay
              </CardTitle>
              <CardDescription className="text-center text-[#64748B] max-w-2xl text-base">
                Create payment requests, accept payments from any blockchain,
                and manage cross-chain transfers seamlessly. The future of
                decentralized payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-8 pb-8">
              <div className="bg-[#F8FAFF] rounded-2xl p-6">
                {renderContent()}
              </div>
            </CardContent>
          </Card>
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
