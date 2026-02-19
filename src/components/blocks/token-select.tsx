import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Image from "next/image";
import {
  SUPPORTED_TOKENS,
  TESTNET_TOKEN_METADATA,
  TOKEN_METADATA,
} from "@avail-project/nexus-core";

const TokenSelect = ({
  selectedToken,
  selectedChain,
  handleTokenSelect,
  isTestnet = false,
  disabled = false,
}: {
  selectedToken?: SUPPORTED_TOKENS;
  selectedChain: string;
  handleTokenSelect: (token: SUPPORTED_TOKENS) => void;
  isTestnet?: boolean;
  disabled?: boolean;
}) => {
  const tokenData = isTestnet ? TESTNET_TOKEN_METADATA : TOKEN_METADATA;
  const selectedTokenData = Object.entries(tokenData)?.find(([, token]) => {
    return token.symbol === selectedToken;
  });
  return (
    <Select
      value={selectedToken}
      onValueChange={(value) =>
        !disabled && handleTokenSelect(value as SUPPORTED_TOKENS)
      }
    >
      <SelectTrigger
        disabled={disabled}
        className="w-full shadow-sm rounded-xl border-none focus-visible:ring-1 focus-visible:ring-ring bg-card"
      >
        <SelectValue placeholder="Select a token">
          {selectedChain && selectedTokenData && (
            <div className="flex items-center gap-2">
              <Image
                src={selectedTokenData[1].icon}
                alt={selectedTokenData[1].symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
              {selectedToken}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover rounded-xl border border-border">
        {Object.entries(tokenData)?.map(([, token]) => (
          <SelectItem
            key={token.symbol}
            value={token.symbol}
            className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-accent focus:text-accent-foreground"
          >
            <div className="flex items-center gap-2 my-1">
              <Image
                src={token.icon}
                alt={token.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <span>
                  {isTestnet ? `${token.symbol} (Testnet)` : token.symbol}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TokenSelect;
