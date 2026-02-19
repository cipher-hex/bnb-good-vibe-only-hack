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
    <header className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center">
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-foreground">
                Trans-Pay
              </span>
              <span className="text-xs text-muted-foreground">
                Cross-Chain Payment Requests
              </span>
            </div>
          </Link>
          <ConnectWallet />
        </div>

        <nav className="flex items-center justify-center gap-1 sm:gap-2 pt-2 relative">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center bg-muted/50 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => onTabChange(tab.value)}
                  className={`
                    flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 text-sm
                    ${
                      isActive
                        ? "bg-background text-foreground shadow-sm ring-1 ring-black/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
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
            <span className="absolute right-0 top-4 text-xs text-destructive bg-destructive/10 px-3 py-1 rounded-full hidden sm:inline-block">
              Devnet Mode
            </span>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
