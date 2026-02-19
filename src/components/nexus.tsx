import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import UnifiedBalance from "./unified-balance";
import NexusContentWrapper from "./blocks/nexus-content-wrapper";
import NexusTransfer from "./nexus-transfer";
import NexusBridge from "./bridge/nexus-bridge";
import CreatePaymentRequest from "./payment-request/create-payment-request";
import NexusUI from "./nexus-ui";
import {
  CheckCircle,
  Info,
  Zap,
  DollarSign,
  Globe,
  ArrowRightLeft,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface NexusProps {
  isTestnet: boolean;
  activeTab: string;
}

const Nexus = ({ isTestnet, activeTab }: NexusProps) => {
  return (
    <Card className="bg-white shadow-2xl rounded-3xl border-none mx-auto w-[95%] max-w-4xl overflow-hidden">
      <div className="bg-white">
        <CardHeader className="flex flex-col w-full items-center px-8 pt-8 pb-6">
          <CardTitle className="text-3xl font-bold text-[#1E293B] mb-2">
            Welcome to Trans-Pay
          </CardTitle>
          <CardDescription className="text-center text-[#64748B] max-w-2xl text-base">
            Create payment requests, accept payments from any blockchain, and
            manage cross-chain transfers seamlessly. The future of decentralized
            payments.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 md:px-8 pb-8">
          <div className="bg-[#F8FAFF] rounded-2xl p-6">
            <NexusContentWrapper>
              {/* Information Card for each tab */}
              <TabInfoCard activeTab={activeTab} />

              {activeTab === "nexus-ui" && <NexusUI isTestnet={isTestnet} />}
              {activeTab === "unified-balance" && <UnifiedBalance />}
              {activeTab === "bridge" && <NexusBridge isTestnet={isTestnet} />}
              {activeTab === "transfer" && (
                <NexusTransfer isTestnet={isTestnet} />
              )}
              {activeTab === "payment-request" && (
                <CreatePaymentRequest isTestnet={isTestnet} />
              )}
            </NexusContentWrapper>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

// Tab Information Card Component
const TabInfoCard = ({ activeTab }: { activeTab: string }) => {
  const tabInfo = {
    "nexus-ui": {
      title: "Nexus UI Elements",
      icon: <Zap className="w-5 h-5 text-orange-600" />,
      description:
        "Explore powerful cross-chain DeFi components powered by Avail Nexus Elements",
      features: [
        "Unified Balance component with cross-chain aggregation",
        "Cross-chain Swap functionality with intent-based routing",
        "Fast Transfer component for seamless asset movement",
        "Prebuilt React components with full Nexus SDK integration",
      ],
    },
    "unified-balance": {
      title: "Unified Balance Overview",
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      description:
        "View all your token balances across multiple blockchains in one place",
      features: [
        "Real-time balance aggregation across all supported networks",
        "Multi-chain portfolio tracking with USD values",
        "Quick overview of assets distribution per blockchain",
        "Instant refresh to get latest balance updates",
      ],
    },
    bridge: {
      title: "Cross-Chain Bridge",
      icon: <ArrowRightLeft className="w-5 h-5 text-green-600" />,
      description:
        "Transfer tokens seamlessly between different blockchain networks",
      features: [
        "Automatic route optimization for best rates and speed",
        "Support for major networks (Ethereum, Polygon, Arbitrum, etc.)",
        "Real-time fee estimation and transaction simulation",
        "Source chain selection for custom balance usage",
      ],
    },
    transfer: {
      title: "Direct Transfers & Payment Fulfillment",
      icon: <DollarSign className="w-5 h-5 text-purple-600" />,
      description:
        "Send tokens to any address or fulfill payment requests from any supported network",
      features: [
        "Cross-chain transfers to any wallet address",
        "Payment ID lookup to auto-fill merchant details",
        "Multi-chain source selection for optimal routing",
        "Automatic payment request completion on transfer",
      ],
    },
    "payment-request": {
      title: "Payment Request System",
      icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
      description:
        "Create secure on-chain payment requests with unique IDs for your business",
      features: [
        "Multi-blockchain support (Ethereum, Polygon, Base, etc.)",
        "Unique payment IDs for easy customer identification",
        "USDC/USDT token support for stable value transfers",
        "On-chain storage ensures payment request integrity",
      ],
    },
  };

  const info = tabInfo[activeTab as keyof typeof tabInfo];

  if (!info) return null;

  return (
    <Alert className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-start gap-4">
        <div className="mt-0.5">{info.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{info.title}</h3>
            <Info className="w-4 h-4 text-blue-500" />
          </div>
          <AlertDescription className="text-gray-700 mb-3">
            {info.description}
          </AlertDescription>
          <div className="space-y-1">
            {info.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default Nexus;
