import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing PaymentRequest contract on Polygon Amoy...\n");

  // Contract address from deployment
  const contractAddress = "0x78252F885Be985e9F9B96FADCe971Ee801cDD06B";

  // Get the contract instance
  const PaymentRequest = await ethers.getContractFactory("PaymentRequest");
  const paymentRequest = PaymentRequest.attach(contractAddress);

  try {
    console.log("📍 Contract Address:", contractAddress);
    console.log("🌐 Network:", (await ethers.provider.getNetwork()).name);
    console.log(
      "🔢 Chain ID:",
      Number((await ethers.provider.getNetwork()).chainId)
    );

    // Test read functions
    console.log("\n✅ Testing READ functions:");

    const currentPaymentId = await paymentRequest.getCurrentPaymentId();
    console.log("  📊 Current Payment ID:", currentPaymentId.toString());

    const owner = await paymentRequest.owner();
    console.log("  👤 Contract Owner:", owner);

    const isUSDCSupported = await paymentRequest.isTokenSupported("USDC");
    console.log("  💰 USDC Supported:", isUSDCSupported ? "✅" : "❌");

    const isUSDTSupported = await paymentRequest.isTokenSupported("USDT");
    console.log("  💰 USDT Supported:", isUSDTSupported ? "✅" : "❌");

    const isPolygonSupported = await paymentRequest.isChainSupported(137);
    console.log(
      "  🌐 Polygon (137) Supported:",
      isPolygonSupported ? "✅" : "❌"
    );

    const isEthereumSupported = await paymentRequest.isChainSupported(1);
    console.log(
      "  🌐 Ethereum (1) Supported:",
      isEthereumSupported ? "✅" : "❌"
    );

    console.log("\n🎉 All contract reads successful!");
    console.log("✅ Contract is accessible and functioning correctly");
  } catch (error: any) {
    console.error("\n❌ Error testing contract:");
    console.error(error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
