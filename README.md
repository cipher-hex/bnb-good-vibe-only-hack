# Trans-Pay: Cross-Chain Payment & Bridging Platform

## 🚩 Problem Statement

The current Web3 landscape is heavily fragmented. Users hold assets across multiple blockchains (Ethereum, Polygon, Base, BNB Chain, etc.), making simple tasks like payments and transfers cumbersome.

- **Fragmentation**: Users have to manually switch networks and bridge funds to pay a merchant or use a dApp on a different chain.
- **Complex UX**: The process often involves multiple steps—checking balances, finding a bridge, approving tokens, waiting for finality, and then making the actual transaction.
- **Gas Fee Management**: Users need native gas tokens on every chain they interact with, leading to "dust" balances and stuck funds.

## 💡 Our Solution

**Trans-Pay** leverages the power of **Avail Nexus** to abstract away the complexity of cross-chain interactions. We provide a unified interface where users can view their total net worth and execute transactions without worrying about the underlying chain mechanics.

By using **Intent-Based Transactions**, Trans-Pay allows users to express _what_ they want to do (e.g., "Pay 100 USDC to Alice on Base"), and the system handles _how_ it happens (bridging, swapping, and transferring) in the background.

## 🌟 Key Features

### 1. 💰 Unified Balance

View your aggregated token balance across all supported chains in one place. No need to switch networks to see how much USDC you have on Polygon vs. Arbitrum.

### 2. 💸 Cross-Chain Payment Requests

- **Merchants** can create on-chain payment requests (Invoices) specifying the amount and token they want to receive.
- **Payers** can fulfill these requests using funds from **any** supported source chain.
- The system automatically handles the bridging and transfer, ensuring the merchant receives the exact amount on their preferred chain.
- **Smart Contract Support**: Payment Request contracts are deployed on **Polygon** and **BNB Chain**.

### 3. 🌉 Smart Bridging

Seamlessly move assets between chains. Our intuitive bridge interface calculates the best route, handles allowances, and provides real-time progress tracking of your transaction across networks.

### 4. ⚡ Bridge & Execute (DeFi Integration)

Combine bridging and execution into a single flow.

- _Example_: Bridge USDC from Ethereum to Base and immediately deposit it into Aave V3.
- Saves time and gas by bundling intent steps.

## 🛠️ Technical Architecture

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: Zustand, React Query
- **Icons**: Lucide React

### Web3 Integration

- **SDK**: `@avail-project/nexus-core` (Avail Nexus SDK)
- **Hooks**: Wagmi v2
- **Client**: Viem
- **Wallet Connection**: ConnectKit / WalletConnect

### Smart Contracts

- **Language**: Solidity (v0.8.20)
- **Framework**: Hardhat
- **Security**: OpenZeppelin (Ownable, ReentrancyGuard)
- **Deployments**:
  - **Polygon Mainnet**: `0x78252F885Be985e9F9B96FADCe971Ee801cDD06B`
  - **BNB Chain Mainnet**: `0x78252F885Be985e9F9B96FADCe971Ee801cDD06B`
  - **Polygon Amoy (Testnet)**: `0x78252F885Be985e9F9B96FADCe971Ee801cDD06B`

## ⛓️ Supported Chains

Trans-Pay supports operations across major EVM-compatible networks:

- Ethereum Mainnet (1)
- Optimism (10)
- Polygon (137)
- Arbitrum One (42161)
- Avalanche C-Chain (43114)
- Base (8453)
- BNB Chain (56)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/trans-pay.git
   cd trans-pay
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Get this from https://cloud.walletconnect.com/
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

   # Optional: Toggle testnet mode (default: false)
   NEXT_PUBLIC_ENABLE_TESTNET=false
   ```

4. **Run the Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

### Smart Contract Deployment (Optional)

If you want to deploy your own version of the PaymentRequest contract:

1. Navigate to the backend folder:

   ```bash
   cd @back-end
   ```

2. Setup contract environment:
   Create `.env` in `@back-end`:

   ```env
   PRIVATE_KEY=your_wallet_private_key
   POLYGONSCAN_API_KEY=your_polygonscan_api_key
   BSCSCAN_API_KEY=your_bscscan_api_key
   ```

3. Deploy:

   ```bash
   # Deploy to Polygon
   npx hardhat run scripts/deploy.ts --network polygon

   # Deploy to BNB Chain
   npx hardhat run scripts/deploy.ts --network bsc
   ```

## 📱 User Flow

1. **Connect Wallet**: Use any supported wallet (MetaMask, Rainbow, etc.).
2. **View Balance**: See your unified net worth on the dashboard.
3. **Create Request**: Go to "Payment Request", enter amount and token. Share the generated Payment ID.
4. **Pay Request**: Go to "Transfer", enter the Payment ID. The system finds the request and allows you to pay from any chain.

## 📄 License

This project is licensed under the MIT License.
