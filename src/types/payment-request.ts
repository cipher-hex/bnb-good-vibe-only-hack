/**
 * Payment Request Types
 * TypeScript definitions for the payment request system
 */

/**
 * Enum matching the smart contract's PaymentStatus enum
 */
export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Cancelled = 2
}

/**
 * Payment request data structure matching the smart contract
 */
export interface PaymentRequestData {
  merchant: `0x${string}`;
  tokenSymbol: SupportedPaymentToken;
  chainId: number;
  amount: string;
  timestamp: number;
  status: PaymentStatus;
  payer: `0x${string}` | null;
  paidAt: number | null;
}

/**
 * Form data for creating a payment request
 */
export interface PaymentRequestFormData {
  merchantAddress: `0x${string}`;
  chainId: number;
  selectedToken: 'USDC' | 'USDT';
  requestedAmount: string;
}

/**
 * Supported payment tokens (USDC and USDT across multiple chains)
 */
export type SupportedPaymentToken = 'USDC' | 'USDT';

/**
 * Token information for display purposes
 */
export interface TokenInfo {
  symbol: SupportedPaymentToken;
  name: string;
  decimals: number;
  logo?: string;
}

/**
 * Payment request creation response from the hook
 */
export interface PaymentRequestCreationResult {
  success: boolean;
  paymentId?: number;
  transactionHash?: string;
  error?: string;
}

/**
 * Payment request retrieval response from the hook
 */
export interface PaymentRequestRetrievalResult {
  success: boolean;
  data?: PaymentRequestData;
  error?: string;
  exists: boolean;
}

/**
 * Payment marking result from the hook
 */
export interface PaymentMarkingResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Payment request state for the store
 */
export interface PaymentRequestState {
  // Recently created payment IDs
  recentPaymentIds: number[];
  
  // Cached payment request data
  cachedRequests: Record<number, PaymentRequestData>;
  
  // Loading states
  isCreating: boolean;
  isLoading: boolean;
  isMarking: boolean;
  
  // Error states
  createError: string | null;
  loadError: string | null;
  markError: string | null;
  
  // Current form data
  formData: PaymentRequestFormData;
}

/**
 * Payment request validation result
 */
export interface PaymentRequestValidation {
  isValid: boolean;
  errors: {
    merchantAddress?: string;
    chainId?: string;
    selectedToken?: string;
    requestedAmount?: string;
  };
}

/**
 * Smart contract event data types
 */
export interface PaymentRequestCreatedEvent {
  paymentId: bigint;
  merchant: string;
  tokenSymbol: string;
  chainId: bigint;
  amount: bigint;
  timestamp: bigint;
}

export interface PaymentFulfilledEvent {
  paymentId: bigint;
  payer: string;
  paidAt: bigint;
}

export interface PaymentCancelledEvent {
  paymentId: bigint;
  cancelledAt: bigint;
}

/**
 * Formatted payment request data for display
 */
export interface FormattedPaymentRequestData extends Omit<PaymentRequestData, 'amount' | 'timestamp' | 'paidAt'> {
  formattedAmount: string;
  tokenSymbol: SupportedPaymentToken;
  chainId: number;
  chainName: string; // Human-readable chain name
  createdAt: Date;
  paidAtDate: Date | null;
  statusLabel: string;
  isActive: boolean; // true if status is Pending
}

/**
 * Payment ID formatting options
 */
export interface PaymentIdFormatOptions {
  prefix?: string;
  minLength?: number;
  showCopyButton?: boolean;
}

/**
 * Props for payment request components
 */
export interface PaymentRequestComponentProps {
  isTestnet?: boolean;
  onSuccess?: (paymentId: number) => void;
  onError?: (error: string) => void;
}

/**
 * Payment loading state for transfer component
 */
export interface PaymentLoadingState {
  paymentId: string;
  isLoading: boolean;
  data: FormattedPaymentRequestData | null;
  error: string | null;
}
