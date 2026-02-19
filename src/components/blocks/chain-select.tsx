import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  CHAIN_METADATA,
  MAINNET_CHAINS,
  SUPPORTED_CHAINS_IDS,
  TESTNET_CHAINS,
} from "@avail-project/nexus-core";
import { Label } from "../ui/label";
import Image from "next/image";

const ChainSelect = ({
  selectedChain,
  handleSelect,
  chainLabel = "Destination Chain",
  isTestnet = false,
  disabled = false,
}: {
  selectedChain: SUPPORTED_CHAINS_IDS;
  handleSelect: (chainId: SUPPORTED_CHAINS_IDS) => void;
  chainLabel?: string;
  isTestnet?: boolean;
  disabled?: boolean;
}) => {
  const chains = isTestnet ? TESTNET_CHAINS : MAINNET_CHAINS;
  const chainData = CHAIN_METADATA;
  return (
    <Select
      value={selectedChain?.toString() ?? ""}
      onValueChange={(value) => {
        if (!disabled) {
          handleSelect(parseInt(value) as SUPPORTED_CHAINS_IDS);
        }
      }}
    >
      <div className="flex flex-col items-start gap-y-1">
        {chainLabel && (
          <Label className="text-sm font-semibold">{chainLabel}</Label>
        )}
        <SelectTrigger
          disabled={disabled}
          className="w-full shadow-sm rounded-xl border-none focus-visible:ring-1 focus-visible:ring-ring bg-card"
        >
          <SelectValue>
            {!!selectedChain && (
              <div className="flex items-center gap-2">
                <Image
                  src={CHAIN_METADATA[selectedChain]?.logo}
                  alt={CHAIN_METADATA[selectedChain]?.name ?? ""}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                {CHAIN_METADATA[selectedChain]?.name}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
      </div>

      <SelectContent className="bg-popover rounded-xl border border-border">
        {chains.map((chainId) => {
          return (
            <SelectItem
              key={chainId}
              value={chainId.toString()}
              className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-accent focus:text-accent-foreground"
            >
              <div className="flex items-center gap-2 my-1">
                <Image
                  src={CHAIN_METADATA[chainId]?.logo}
                  alt={chainData[chainId]?.name ?? ""}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                {chainData[chainId]?.name}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default ChainSelect;
