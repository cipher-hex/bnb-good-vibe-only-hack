/**
 * Payment Request Constants
 * Contract addresses, ABIs, and multi-chain information for the payment request system
 */

import { SupportedPaymentToken, TokenInfo } from "@/types/payment-request";

/**
 * PaymentRequest contract address on Polygon mainnet (where the contract is deployed)
 * Deployed on Polygon Mainnet at block 78307766
 * Deployment timestamp: 2025-10-28
 */
export const PAYMENT_REQUEST_CONTRACT_ADDRESS =
  "0xde97e0707A81600db65228e72dC0D8256C7DCe5B" as const;

/**
 * PaymentRequest contract address on Polygon Amoy testnet (for testing)
 * Deployed contract address
 */
export const PAYMENT_REQUEST_CONTRACT_ADDRESS_TESTNET =
  "0x78252F885Be985e9F9B96FADCe971Ee801cDD06B" as const;

/**
 * Polygon Chain ID (where the PaymentRequest contract is deployed)
 */
export const POLYGON_CHAIN_ID = 137;

/**
 * Polygon Amoy Testnet Chain ID
 */
export const POLYGON_AMOY_CHAIN_ID = 80002;

/**
 * Supported blockchain networks for payment requests
 */
export const SUPPORTED_CHAINS = [
  { id: 1, name: "Ethereum", symbol: "ETH", icon: "⟠" },
  { id: 10, name: "Optimism", symbol: "ETH", icon: "🔴" },
  { id: 137, name: "Polygon", symbol: "MATIC", icon: "⬣" },
  { id: 42161, name: "Arbitrum", symbol: "ETH", icon: "🔵" },
  { id: 43114, name: "Avalanche", symbol: "AVAX", icon: "🔺" },
  { id: 8453, name: "Base", symbol: "ETH", icon: "🔵" },
  { id: 56, name: "BNB Chain", symbol: "BNB", icon: "🟡" },
] as const;

/**
 * Supported payment token information (cross-chain)
 */
export const SUPPORTED_PAYMENT_TOKEN_INFO: Record<
  SupportedPaymentToken,
  TokenInfo
> = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
  },
} as const;

/**
 * PaymentRequest contract ABI
 * Verified against deployed contract on Polygon Amoy testnet
 * Contract Address: 0x78252F885Be985e9F9B96FADCe971Ee801cDD06B
 */
export const PAYMENT_REQUEST_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InvalidAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidChainId",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMerchant",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidTokenSymbol",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "PaymentAlreadyCancelled",
    type: "error",
  },
  {
    inputs: [],
    name: "PaymentAlreadyFulfilled",
    type: "error",
  },
  {
    inputs: [],
    name: "PaymentRequestNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [],
    name: "UnauthorizedCancellation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "cancelledAt",
        type: "uint256",
      },
    ],
    name: "PaymentCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "paidAt",
        type: "uint256",
      },
    ],
    name: "PaymentFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "merchant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "tokenSymbol",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "PaymentRequestCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
    ],
    name: "addSupportedChain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "tokenSymbol",
        type: "string",
      },
    ],
    name: "addSupportedToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
    ],
    name: "cancelPaymentRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "merchant",
        type: "address",
      },
      {
        internalType: "string",
        name: "tokenSymbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "createPaymentRequest",
    outputs: [
      {
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentPaymentId",
    outputs: [
      {
        internalType: "uint256",
        name: "currentId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
    ],
    name: "getPaymentRequest",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "merchant",
            type: "address",
          },
          {
            internalType: "string",
            name: "tokenSymbol",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "chainId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "enum PaymentRequest.PaymentStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "payer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "paidAt",
            type: "uint256",
          },
        ],
        internalType: "struct PaymentRequest.PaymentRequestData",
        name: "requestData",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
    ],
    name: "isChainSupported",
    outputs: [
      {
        internalType: "bool",
        name: "supported",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "tokenSymbol",
        type: "string",
      },
    ],
    name: "isTokenSupported",
    outputs: [
      {
        internalType: "bool",
        name: "supported",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "payer",
        type: "address",
      },
    ],
    name: "markAsPaid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "nextPaymentId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "paymentId",
        type: "uint256",
      },
    ],
    name: "paymentExists",
    outputs: [
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "paymentRequests",
    outputs: [
      {
        internalType: "address",
        name: "merchant",
        type: "address",
      },
      {
        internalType: "string",
        name: "tokenSymbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "enum PaymentRequest.PaymentStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "paidAt",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
    ],
    name: "removeSupportedChain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "tokenSymbol",
        type: "string",
      },
    ],
    name: "removeSupportedToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "supportedChains",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "supportedTokens",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/**
 * Helper function to get contract address based on network
 */
export const getPaymentRequestContractAddress = (
  isTestnet: boolean
): `0x${string}` => {
  return (
    isTestnet
      ? PAYMENT_REQUEST_CONTRACT_ADDRESS_TESTNET
      : PAYMENT_REQUEST_CONTRACT_ADDRESS
  ) as `0x${string}`;
};

/**
 * Helper function to get token info by symbol
 */
export const getTokenInfo = (symbol: SupportedPaymentToken): TokenInfo => {
  return SUPPORTED_PAYMENT_TOKEN_INFO[symbol];
};

/**
 * Helper function to get chain info by ID
 */
export const getChainInfo = (chainId: number) => {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
};

/**
 * Helper function to check if a chain is supported
 */
export const isChainSupported = (chainId: number): boolean => {
  return SUPPORTED_CHAINS.some((chain) => chain.id === chainId);
};

/**
 * Payment ID formatting configuration
 */
export const PAYMENT_ID_CONFIG = {
  PREFIX: "#",
  MIN_LENGTH: 6,
  FILL_CHAR: "0",
} as const;

/**
 * Helper function to format payment ID for display
 */
export const formatPaymentId = (paymentId: number): string => {
  return `${PAYMENT_ID_CONFIG.PREFIX}${paymentId
    .toString()
    .padStart(PAYMENT_ID_CONFIG.MIN_LENGTH, PAYMENT_ID_CONFIG.FILL_CHAR)}`;
};

/**
 * Helper function to parse payment ID from formatted string
 */
export const parsePaymentId = (formattedId: string): number | null => {
  const cleanId = formattedId.replace(PAYMENT_ID_CONFIG.PREFIX, "");
  const parsed = parseInt(cleanId, 10);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Supported payment token symbols array
 */
export const SUPPORTED_PAYMENT_TOKENS: SupportedPaymentToken[] = [
  "USDC",
  "USDT",
] as const;

/**
 * Status labels for payment requests
 */
export const PAYMENT_STATUS_LABELS = {
  0: "Pending",
  1: "Paid",
  2: "Cancelled",
} as const;
