"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Check, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { CHAIN_METADATA } from "@avail-project/nexus-core";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

export interface SourceChainOption {
  chainId: number;
  chainName: string;
  balance: string;
  hasBalance: boolean;
  logo: string;
}

interface SourceChainSelectorProps {
  availableChains: SourceChainOption[];
  selectedChainIds: number[];
  onSelectionChange: (chainIds: number[]) => void;
  destinationChainId: number;
  tokenSymbol?: string;
  disabled?: boolean;
}

export const SourceChainSelector: React.FC<SourceChainSelectorProps> = ({
  availableChains,
  selectedChainIds,
  onSelectionChange,
  destinationChainId,
  tokenSymbol = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filter out destination chain from available chains
  const selectableChains = availableChains.filter(
    (chain) => chain.chainId !== destinationChainId,
  );

  // Calculate total available balance from selected chains
  const getTotalBalance = () => {
    if (selectedChainIds.length === 0) {
      // If nothing selected, show total of all available chains
      return selectableChains
        .reduce((sum, chain) => sum + parseFloat(chain.balance || "0"), 0)
        .toFixed(6);
    }
    return selectableChains
      .filter((chain) => selectedChainIds.includes(chain.chainId))
      .reduce((sum, chain) => sum + parseFloat(chain.balance || "0"), 0)
      .toFixed(6);
  };

  // Toggle chain selection
  const toggleChain = (chainId: number) => {
    if (selectedChainIds.includes(chainId)) {
      onSelectionChange(selectedChainIds.filter((id) => id !== chainId));
    } else {
      onSelectionChange([...selectedChainIds, chainId]);
    }
  };

  // Select all chains with balance
  const selectAll = () => {
    const allChainIds = selectableChains
      .filter((chain) => chain.hasBalance)
      .map((chain) => chain.chainId);
    onSelectionChange(allChainIds);
  };

  // Clear all selections
  const clearAll = () => {
    onSelectionChange([]);
  };

  // Get display text for the trigger button
  const getDisplayText = () => {
    if (selectedChainIds.length === 0) {
      return "All available chains";
    }
    if (selectedChainIds.length === 1) {
      const chain = selectableChains.find(
        (c) => c.chainId === selectedChainIds[0],
      );
      return chain?.chainName || "1 chain selected";
    }
    return `${selectedChainIds.length} chains selected`;
  };

  return (
    <div className="flex flex-col items-start gap-y-1 w-full">
      <Label className="text-sm font-semibold">Source Chains (Optional)</Label>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled || selectableChains.length === 0}
            className="w-full justify-between h-auto py-3 px-4 shadow-sm rounded-xl border-none hover:bg-accent"
          >
            <div className="flex flex-col items-start gap-1 flex-1">
              <span className="text-sm font-medium">{getDisplayText()}</span>
              <span className="text-xs text-muted-foreground">
                Total: {getTotalBalance()} {tokenSymbol}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md bg-card border border-muted rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Select Source Chains</DialogTitle>
            <DialogDescription>
              Choose which chains to use for this transfer. Leave empty to use
              all available chains automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="flex-1 text-xs"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="flex-1 text-xs"
              >
                Clear All
              </Button>
            </div>

            {/* Selected Count Badge */}
            {selectedChainIds.length > 0 && (
              <Badge variant="secondary" className="w-full justify-center">
                {selectedChainIds.length} of {selectableChains.length} chains
                selected
              </Badge>
            )}

            {/* Chain List */}
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {selectableChains.map((chain) => {
                  const isSelected = selectedChainIds.includes(chain.chainId);
                  const isDisabled = !chain.hasBalance;

                  return (
                    <button
                      key={chain.chainId}
                      onClick={() => !isDisabled && toggleChain(chain.chainId)}
                      disabled={isDisabled}
                      className={cn(
                        "w-full p-3 rounded-xl border-2 transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 bg-card",
                        isDisabled && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-input",
                          )}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>

                        {/* Chain Info */}
                        <div className="flex items-center gap-2 flex-1">
                          <Image
                            src={
                              chain.logo || CHAIN_METADATA[chain.chainId]?.logo
                            }
                            alt={chain.chainName}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div className="flex flex-col flex-1">
                            <span className="text-sm font-semibold text-foreground">
                              {chain.chainName}
                            </span>
                            <span
                              className={cn(
                                "text-xs",
                                chain.hasBalance
                                  ? "text-primary font-medium"
                                  : "text-muted-foreground",
                              )}
                            >
                              {parseFloat(chain.balance).toFixed(6)}{" "}
                              {tokenSymbol}
                            </span>
                          </div>
                        </div>

                        {/* Balance Badge */}
                        {!chain.hasBalance && (
                          <Badge variant="destructive" className="text-xs">
                            No Balance
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Summary */}
            <div className="p-3 bg-muted/30 rounded-xl border border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Available:
                </span>
                <span className="text-sm font-bold text-primary">
                  {getTotalBalance()} {tokenSymbol}
                </span>
              </div>
            </div>

            {/* Apply Button */}
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Apply Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
