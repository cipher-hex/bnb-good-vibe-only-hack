"use client";
import React from "react";
import ConnectWallet from "../blocks/connect-wallet";
import Link from "next/link";
import { BarChart3, ArrowLeftRight, Zap, CreditCard } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isTestnet: boolean;
}

// Tab configuration with icons
const tabs = [
  {
    value: "unified-balance",
    label: "Unified Balance",
    shortLabel: "Balance",
    icon: BarChart3,
  },
  { value: "swap", label: "Swap", shortLabel: "Swap", icon: ArrowLeftRight },
  {
    value: "fast-transfer",
    label: "Fast Transfer",
    shortLabel: "Transfer",
    icon: Zap,
  },
  {
    value: "payment-request",
    label: "Payment Request",
    shortLabel: "Payment",
    icon: CreditCard,
  },
];

const Header = ({ activeTab, onTabChange, isTestnet }: HeaderProps) => {
  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-lg">
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center">
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-[#1E293B]">
                Trans-Pay
              </span>
              <span className="text-xs text-[#64748B]">
                Cross-Chain Payment Requests
              </span>
            </div>
          </Link>
          <ConnectWallet />
        </div>

        <nav className="flex items-center justify-center gap-1 sm:gap-2 border-t border-[#E1ECF7] pt-4 relative">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => onTabChange(tab.value)}
                  className={`
                    flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow-md"
                        : "bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] hover:shadow-sm"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-sm">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
          {isTestnet && (
            <span className="absolute right-0 text-xs text-[#EF4444] bg-[#FEE2E2] px-3 py-1 rounded-full">
              Devnet Mode
            </span>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
