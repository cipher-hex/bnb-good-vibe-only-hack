import { useState, useEffect, useCallback } from "react";
import { useNexus } from "@/provider/NexusProvider";
import {
  SUPPORTED_TOKENS,
  SUPPORTED_CHAINS_IDS,
  CHAIN_METADATA,
  MAINNET_CHAINS,
  TESTNET_CHAINS,
} from "@avail-project/nexus-core";
import { SourceChainOption } from "@/components/blocks/source-chain-selector";

interface UseSourceChainBalancesParams {
  selectedToken?: SUPPORTED_TOKENS;
  destinationChainId: SUPPORTED_CHAINS_IDS;
  isTestnet: boolean;
}

interface UseSourceChainBalancesReturn {
  availableChains: SourceChainOption[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalBalance: string;
}

export const useSourceChainBalances = ({
  selectedToken,
  destinationChainId,
  isTestnet,
}: UseSourceChainBalancesParams): UseSourceChainBalancesReturn => {
  const { nexusSdk } = useNexus();
  const [availableChains, setAvailableChains] = useState<SourceChainOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!nexusSdk || !selectedToken) {
      setAvailableChains([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use the more efficient getUnifiedBalance method to fetch only the specific token
      const tokenAsset: any = await nexusSdk.getUnifiedBalance(selectedToken);
      const supportedChains = isTestnet ? TESTNET_CHAINS : MAINNET_CHAINS;

      console.log("Fetched balance for", selectedToken, ":", tokenAsset);

      // Access the breakdown from the UserAsset - it might be in .value or directly on the object
      const breakdown = tokenAsset?.value?.breakdown || tokenAsset?.breakdown;
      
      if (!tokenAsset || !breakdown || breakdown.length === 0) {
        // No balances for this token
        console.log("No balance data found for", selectedToken);
        setAvailableChains([]);
        return;
      }

      // Build a map of chainId -> balance from the breakdown
      const balanceMap = new Map<number, string>();
      breakdown.forEach((chainBreakdown: any) => {
        const chainId = chainBreakdown.chain?.id;
        const balance = chainBreakdown.balance || "0";
        if (chainId) {
          balanceMap.set(chainId, balance);
        }
      });

      console.log("Balance map:", balanceMap);

      // Create source chain options from supported chains
      const chains: SourceChainOption[] = supportedChains
        .filter((chainId) => chainId !== destinationChainId)
        .map((chainId) => {
          const balance = balanceMap.get(chainId) || "0";
          const hasBalance = parseFloat(balance) > 0;

          return {
            chainId,
            chainName: CHAIN_METADATA[chainId]?.name || `Chain ${chainId}`,
            balance,
            hasBalance,
            logo: CHAIN_METADATA[chainId]?.logo || "",
          };
        })
        .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));

      console.log("Available chains:", chains);
      setAvailableChains(chains);
    } catch (err) {
      console.error("Error fetching source chain balances:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
      setAvailableChains([]);
    } finally {
      setIsLoading(false);
    }
  }, [nexusSdk, selectedToken, destinationChainId, isTestnet]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const totalBalance = availableChains
    .reduce((sum, chain) => sum + parseFloat(chain.balance || "0"), 0)
    .toFixed(6);

  return {
    availableChains,
    isLoading,
    error,
    refetch: fetchBalances,
    totalBalance,
  };
};
