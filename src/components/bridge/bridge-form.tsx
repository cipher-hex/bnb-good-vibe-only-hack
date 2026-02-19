"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBridgeForm } from "@/hooks/useBridgeForm";
import { useBridgeTransaction } from "@/hooks/useBridgeTransaction";
import { useBridgeStore, bridgeSelectors } from "@/store/bridgeStore";
import { cn } from "@/lib/utils";
import { Infinity } from "lucide-react";
import ChainSelect from "../blocks/chain-select";
import TokenSelect from "../blocks/token-select";
import { SimulationPreview } from "../shared/simulation-preview";
import { UserAsset } from "@avail-project/nexus-core";
import { SourceChainSelector } from "../blocks/source-chain-selector";
import { useSourceChainBalances } from "@/hooks/useSourceChainBalances";

interface BridgeFormProps {
  isTestnet: boolean;
  availableBalance: UserAsset[];
  onSubmit: () => void;
  isSubmitting?: boolean;
}

/**
 * Bridge form component for chain, token, and amount selection
 */
export const BridgeForm: React.FC<BridgeFormProps> = ({
  availableBalance,
  onSubmit,
  isSubmitting = false,
  isTestnet,
}) => {
  const {
    selectedChain,
    selectedToken,
    bridgeAmount,
    canSubmit,
    validation,
    handleChainSelect,
    handleTokenSelect,
    handleAmountChange,
    setMaxAmount,
    selectedTokenBalance,
    submissionState,
  } = useBridgeForm(availableBalance);

  // Get simulation data from the bridge transaction hook
  const { simulation, isSimulating } = useBridgeTransaction();
  const simulationError = useBridgeStore(bridgeSelectors.simulationError);
  const error = useBridgeStore(bridgeSelectors.error);

  // Source chain selection
  const sourceChains = useBridgeStore(bridgeSelectors.sourceChains);
  const setSourceChains = useBridgeStore((state) => state.setSourceChains);

  // Get source chain balances
  const { availableChains, isLoading: isLoadingBalances } =
    useSourceChainBalances({
      selectedToken,
      destinationChainId: selectedChain,
      isTestnet,
    });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit && !isSubmitting) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="w-full space-y-4">
      {/* Chain Selection */}
      <div className="space-y-2">
        <ChainSelect
          selectedChain={selectedChain}
          handleSelect={handleChainSelect}
          isTestnet={isTestnet}
        />
      </div>

      {/* Token Selection */}
      <div className="space-y-2">
        <TokenSelect
          selectedToken={selectedToken}
          selectedChain={selectedChain?.toString() ?? ""}
          handleTokenSelect={handleTokenSelect}
          isTestnet={isTestnet}
        />
      </div>

      {/* Source Chain Selection */}
      {selectedToken && (
        <div className="space-y-2">
          <SourceChainSelector
            selectedChainIds={sourceChains.map((chain) => Number(chain))}
            onSelectionChange={(chainIds) => setSourceChains(chainIds as any)}
            availableChains={availableChains}
            destinationChainId={selectedChain}
            tokenSymbol=""
            disabled={isSubmitting}
          />
        </div>
      )}

      {/* Amount Input */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="text"
            placeholder="0.0"
            value={bridgeAmount || ""}
            onChange={handleAmountChange}
            disabled={!selectedToken || isSubmitting}
            className={cn(
              "h-12 pr-20",
              validation.errorMessage ? "border-destructive" : "",
            )}
          />
          {selectedToken && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {selectedToken}
            </div>
          )}
          {selectedToken && parseFloat(selectedTokenBalance) > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={setMaxAmount}
              className="h-auto p-0 text-xs text-primary absolute right-3 top-1/2 -translate-y-1/2 hover:bg-transparent hover:text-primary/80 cursor-pointer"
            >
              <Infinity className="w-4 h-4" />
            </Button>
          )}
        </div>

        {validation.errorMessage && (selectedToken || bridgeAmount) && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-2 py-1">
            <strong>Error:</strong> {validation.errorMessage}
          </div>
        )}

        {validation.warningMessage && (
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
            <strong>Warning:</strong> {validation.warningMessage}
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
            <strong>Transaction Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Simulation Preview */}
      {selectedToken && bridgeAmount && parseFloat(bridgeAmount) > 0 && (
        <SimulationPreview
          simulation={simulation}
          isSimulating={isSimulating}
          simulationError={simulationError}
          title="Bridge Cost Estimate"
          className="w-full"
        />
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        className="w-full font-semibold"
        disabled={!submissionState.ready || isSubmitting}
      >
        {isSubmitting
          ? "Processing..."
          : (submissionState.reason ?? "Continue")}
      </Button>
    </form>
  );
};
