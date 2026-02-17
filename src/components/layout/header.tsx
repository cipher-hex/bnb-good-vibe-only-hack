"use client";
import React from "react";
import ConnectWallet from "../blocks/connect-wallet";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isTestnet: boolean;
}

const Header = ({ activeTab, onTabChange, isTestnet }: HeaderProps) => {
  const tabs = [
    { value: "unified-balance", label: "Unified Balance" },
    { value: "bridge", label: "Bridge" },
    { value: "transfer", label: "Transfer" },
    { value: "payment-request", label: "Payment Request" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-lg">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center">
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-[#1E293B]">Trans-Pay</span>
              <span className="text-xs text-[#64748B]">
                Cross-Chain Payment Requests
              </span>
            </div>
          </Link>
          <ConnectWallet />
        </div>
        
        <nav className="flex items-center justify-center gap-2 border-t border-[#E1ECF7] pt-4 relative">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`
                  px-6 py-3 rounded-xl font-medium transition-all duration-200
                  ${activeTab === tab.value
                    ? 'bg-[#2563EB] text-white shadow-md'
                    : 'bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] hover:shadow-sm'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
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
