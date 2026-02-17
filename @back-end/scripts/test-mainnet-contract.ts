import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Testing PaymentRequest contract on Polygon Mainnet...\n");

  const contractAddress = "0xde97e0707A81600db65228e72dC0D8256C7DCe5B";

  // Get the contract instance
  const PaymentRequest = await ethers.getContractAt(
    "PaymentRequest",
    contractAddress
  );

  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 Network:", (await ethers.provider.getNetwork()).name);
  console.log("🆔 Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("");

  // Test read functions
  try {
    const currentPaymentId = await PaymentRequest.getCurrentPaymentId();
    console.log("✅ Current Payment ID:", currentPaymentId.toString());

    const owner = await PaymentRequest.owner();
    console.log("✅ Contract Owner:", owner);

    const isUSDCSupported = await PaymentRequest.isTokenSupported("USDC");
    const isUSDTSupported = await PaymentRequest.isTokenSupported("USDT");
    console.log("\n💰 Supported Tokens:");
    console.log("   USDC:", isUSDCSupported ? "✅" : "❌");
    console.log("   USDT:", isUSDTSupported ? "✅" : "❌");

    const supportedChains = [1, 10, 137, 42161, 43114, 8453, 56];
    const chainNames = [
      "Ethereum",
      "Optimism",
      "Polygon",
      "Arbitrum",
      "Avalanche",
      "Base",
      "BNB",
    ];

    console.log("\n🌐 Supported Chains:");
    for (let i = 0; i < supportedChains.length; i++) {
      const isSupported = await PaymentRequest.isChainSupported(
        supportedChains[i]
      );
      console.log(
        `   ${chainNames[i]} (${supportedChains[i]}):`,
        isSupported ? "✅" : "❌"
      );
    }

    console.log("\n✅ All contract read functions working correctly!");
    console.log("\n🎯 Next steps:");
    console.log("1. Connect your wallet to Polygon Mainnet in the frontend");
    console.log("2. Create a payment request from the 'Payment Request' tab");
    console.log("3. Use the generated Payment ID to fulfill payments");
    console.log(
      "\n⚠️  Note: Make sure your wallet is connected to Polygon Mainnet (Chain ID: 137)"
    );
  } catch (error) {
    console.error("❌ Error testing contract:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
