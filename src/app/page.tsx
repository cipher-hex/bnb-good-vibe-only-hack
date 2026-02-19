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
        return <NexusUI isTestnet={isTestnet} activeTab={activeTab} />;
      case "payment-request":
        return <CreatePaymentRequest isTestnet={isTestnet} />;
      default:
        return <NexusUI isTestnet={isTestnet} activeTab="unified-balance" />;
    }
  };

  // Get header content based on active tab
  const getHeaderContent = () => {
    switch (activeTab) {
      case "unified-balance":
        return {
          title: "Unified Balance",
          description:
            "View and manage your assets across all supported chains in one place.",
        };
      case "swap":
        return {
          title: "Gasless Swap",
          description:
            "Swap tokens seamlessly without worrying about gas fees on the destination chain.",
        };
      case "fast-transfer":
        return {
          title: "Fast Transfer",
          description:
            "Send funds quickly to any supported chain with instant execution.",
        };
      case "payment-request":
        return {
          title: "Create Payment Request",
          description:
            "Generate a payment request that customers can fulfill via cross-chain transfers.",
        };
      default:
        return {
          title: "Welcome to Trans-Pay",
          description:
            "Create payment requests, accept payments from any blockchain, and manage cross-chain transfers seamlessly.",
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <>
      <InitNexusOnConnect />
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isTestnet={isTestnet}
      />
      <main className="w-full min-h-screen bg-background">
        <div className="w-full pt-8 pb-12 flex flex-col gap-y-6 items-center justify-start px-4">
          <Card className="bg-card shadow-xl rounded-3xl border-border mx-auto w-[95%] max-w-4xl overflow-hidden">
            <CardHeader className="flex flex-col w-full items-center px-8 pt-8 pb-6">
              <CardTitle className="text-3xl font-bold text-foreground mb-2">
                {headerContent.title}
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground max-w-2xl text-base">
                {headerContent.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-8 pb-8">
              <div className="bg-secondary/30 rounded-2xl p-6">
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
