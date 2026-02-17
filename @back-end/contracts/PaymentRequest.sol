// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentRequest
 * @dev Smart contract for creating and managing payment requests on Polygon
 * @notice Merchants can create payment requests and payers can fulfill them via cross-chain transfers
 */
contract PaymentRequest is Ownable, ReentrancyGuard {
    // Payment status enumeration
    enum PaymentStatus {
        Pending,
        Paid,
        Cancelled
    }

    // Payment request data structure
    struct PaymentRequestData {
        address merchant;        // Address of the merchant requesting payment
        string tokenSymbol;      // Token symbol ("USDC" or "USDT")
        uint256 chainId;         // Target blockchain ID where merchant wants to receive payment
        uint256 amount;          // Amount requested in wei (6 decimals for USDC/USDT)
        uint256 timestamp;       // Timestamp when request was created
        PaymentStatus status;    // Current status of the payment request
        address payer;           // Address of the payer (set when payment is fulfilled)
        uint256 paidAt;          // Timestamp when payment was fulfilled
    }

    // State variables
    uint256 public nextPaymentId;
    mapping(uint256 => PaymentRequestData) public paymentRequests;
    
    // Supported token symbols
    mapping(string => bool) public supportedTokens;
    
    // Supported blockchain IDs
    mapping(uint256 => bool) public supportedChains;
    
    // Events
    event PaymentRequestCreated(
        uint256 indexed paymentId,
        address indexed merchant,
        string tokenSymbol,
        uint256 chainId,
        uint256 amount,
        uint256 timestamp
    );
    
    event PaymentFulfilled(
        uint256 indexed paymentId,
        address indexed payer,
        uint256 paidAt
    );
    
    event PaymentCancelled(
        uint256 indexed paymentId,
        uint256 cancelledAt
    );

    // Custom errors for better gas efficiency
    error InvalidTokenSymbol();
    error InvalidChainId();
    error InvalidAmount();
    error InvalidMerchant();
    error PaymentRequestNotFound();
    error PaymentAlreadyFulfilled();
    error PaymentAlreadyCancelled();
    error UnauthorizedCancellation();

    constructor() Ownable(msg.sender) {
        nextPaymentId = 1000; // Start payment IDs from 1000
        
        // Initialize supported tokens
        supportedTokens["USDC"] = true;
        supportedTokens["USDT"] = true;
        
        // Initialize supported blockchain IDs
        supportedChains[1] = true;      // Ethereum
        supportedChains[10] = true;     // Optimism
        supportedChains[137] = true;    // Polygon
        supportedChains[42161] = true;  // Arbitrum
        supportedChains[43114] = true;  // Avalanche
        supportedChains[8453] = true;   // Base
        supportedChains[56] = true;     // BNB Chain
    }

    /**
     * @dev Creates a new payment request
     * @param merchant Address of the merchant requesting payment
     * @param tokenSymbol Token symbol ("USDC" or "USDT")
     * @param chainId Target blockchain ID where merchant wants to receive payment
     * @param amount Amount to be paid in wei (6 decimals for USDC/USDT)
     * @return paymentId The unique ID of the created payment request
     */
    function createPaymentRequest(
        address merchant,
        string memory tokenSymbol,
        uint256 chainId,
        uint256 amount
    ) external returns (uint256 paymentId) {
        // Validate inputs
        if (!supportedTokens[tokenSymbol]) {
            revert InvalidTokenSymbol();
        }
        if (!supportedChains[chainId]) {
            revert InvalidChainId();
        }
        if (amount == 0) {
            revert InvalidAmount();
        }
        if (merchant == address(0)) {
            revert InvalidMerchant();
        }

        paymentId = nextPaymentId++;
        
        // Store payment request
        paymentRequests[paymentId] = PaymentRequestData({
            merchant: merchant,
            tokenSymbol: tokenSymbol,
            chainId: chainId,
            amount: amount,
            timestamp: block.timestamp,
            status: PaymentStatus.Pending,
            payer: address(0),
            paidAt: 0
        });

        emit PaymentRequestCreated(paymentId, merchant, tokenSymbol, chainId, amount, block.timestamp);
    }

    /**
     * @dev Retrieves payment request data by ID
     * @param paymentId The ID of the payment request
     * @return requestData The complete payment request data
     */
    function getPaymentRequest(uint256 paymentId) 
        external 
        view 
        returns (PaymentRequestData memory requestData) 
    {
        if (paymentId == 0 || paymentId >= nextPaymentId) {
            revert PaymentRequestNotFound();
        }
        return paymentRequests[paymentId];
    }

    /**
     * @dev Marks a payment request as paid
     * @param paymentId The ID of the payment request
     * @param payer Address of the payer
     * @notice Only the merchant or contract owner can call this function
     */
    function markAsPaid(uint256 paymentId, address payer) 
        external 
        nonReentrant 
    {
        if (paymentId == 0 || paymentId >= nextPaymentId) {
            revert PaymentRequestNotFound();
        }

        PaymentRequestData storage request = paymentRequests[paymentId];
        
        // Check if payment is already fulfilled or cancelled
        if (request.status == PaymentStatus.Paid) {
            revert PaymentAlreadyFulfilled();
        }
        if (request.status == PaymentStatus.Cancelled) {
            revert PaymentAlreadyCancelled();
        }

        // Only merchant or owner can mark as paid
        if (msg.sender != request.merchant && msg.sender != owner()) {
            revert UnauthorizedCancellation(); // Reuse error for gas efficiency
        }

        // Update payment status
        request.status = PaymentStatus.Paid;
        request.payer = payer;
        request.paidAt = block.timestamp;

        emit PaymentFulfilled(paymentId, payer, block.timestamp);
    }

    /**
     * @dev Cancels a payment request
     * @param paymentId The ID of the payment request to cancel
     * @notice Only the merchant can cancel their own payment request
     */
    function cancelPaymentRequest(uint256 paymentId) 
        external 
        nonReentrant 
    {
        if (paymentId == 0 || paymentId >= nextPaymentId) {
            revert PaymentRequestNotFound();
        }

        PaymentRequestData storage request = paymentRequests[paymentId];

        // Check if payment is already fulfilled
        if (request.status == PaymentStatus.Paid) {
            revert PaymentAlreadyFulfilled();
        }

        // Check if payment is already cancelled
        if (request.status == PaymentStatus.Cancelled) {
            revert PaymentAlreadyCancelled();
        }

        // Only merchant can cancel
        if (msg.sender != request.merchant) {
            revert UnauthorizedCancellation();
        }

        // Update status to cancelled
        request.status = PaymentStatus.Cancelled;

        emit PaymentCancelled(paymentId, block.timestamp);
    }

    /**
     * @dev Checks if a payment request exists
     * @param paymentId The ID to check
     * @return exists True if the payment request exists
     */
    function paymentExists(uint256 paymentId) external view returns (bool exists) {
        return paymentId > 0 && paymentId < nextPaymentId;
    }

    /**
     * @dev Gets the current payment ID counter
     * @return currentId The next payment ID that will be assigned
     */
    function getCurrentPaymentId() external view returns (uint256 currentId) {
        return nextPaymentId;
    }

    /**
     * @dev Checks if a token symbol is supported
     * @param tokenSymbol Token symbol to check
     * @return supported True if the token is supported
     */
    function isTokenSupported(string memory tokenSymbol) external view returns (bool supported) {
        return supportedTokens[tokenSymbol];
    }
    
    /**
     * @dev Checks if a chain ID is supported
     * @param chainId Chain ID to check
     * @return supported True if the chain is supported
     */
    function isChainSupported(uint256 chainId) external view returns (bool supported) {
        return supportedChains[chainId];
    }
    
    /**
     * @dev Adds support for a new token symbol (only owner)
     * @param tokenSymbol Token symbol to add
     */
    function addSupportedToken(string memory tokenSymbol) external onlyOwner {
        supportedTokens[tokenSymbol] = true;
    }
    
    /**
     * @dev Adds support for a new chain ID (only owner)
     * @param chainId Chain ID to add
     */
    function addSupportedChain(uint256 chainId) external onlyOwner {
        supportedChains[chainId] = true;
    }
    
    /**
     * @dev Removes support for a token symbol (only owner)
     * @param tokenSymbol Token symbol to remove
     */
    function removeSupportedToken(string memory tokenSymbol) external onlyOwner {
        supportedTokens[tokenSymbol] = false;
    }
    
    /**
     * @dev Removes support for a chain ID (only owner)
     * @param chainId Chain ID to remove
     */
    function removeSupportedChain(uint256 chainId) external onlyOwner {
        supportedChains[chainId] = false;
    }
}
