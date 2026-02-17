import { ethers } from "hardhat";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

async function main() {
  console.log("🚀 Starting PaymentRequest contract deployment...");

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying from address:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");

  // Get the contract factory
  const PaymentRequest = await ethers.getContractFactory(
    "PaymentRequest",
    deployer,
  );

  console.log("📝 Deploying PaymentRequest contract...");

  // Deploy the contract
  const paymentRequest = await PaymentRequest.deploy();

  // Wait for deployment to be confirmed
  await paymentRequest.waitForDeployment();

  const contractAddress = await paymentRequest.getAddress();
  const networkName = (await ethers.provider.getNetwork()).name;
  const chainId = (await ethers.provider.getNetwork()).chainId;

  console.log("✅ PaymentRequest deployed successfully!");
  console.log(`📍 Contract address: ${contractAddress}`);
  console.log(`🌐 Network: ${networkName} (Chain ID: ${chainId})`);

  // Check supported tokens and chains
  const isUSDCSupported = await paymentRequest.isTokenSupported("USDC");
  const isUSDTSupported = await paymentRequest.isTokenSupported("USDT");
  const isPolygonSupported = await paymentRequest.isChainSupported(137);
  const isEthereumSupported = await paymentRequest.isChainSupported(1);

  console.log(`💰 Supported tokens:`);
  console.log(`   USDC: ${isUSDCSupported ? "✅" : "❌"}`);
  console.log(`   USDT: ${isUSDTSupported ? "✅" : "❌"}`);
  console.log(`🌐 Supported chains:`);
  console.log(`   Ethereum (1): ${isEthereumSupported ? "✅" : "❌"}`);
  console.log(`   Polygon (137): ${isPolygonSupported ? "✅" : "❌"}`);

  // Create deployment info object
  const deploymentInfo = {
    contractAddress,
    networkName: networkName === "unknown" ? "polygonAmoy" : networkName,
    chainId: Number(chainId),
    deploymentBlock: await ethers.provider.getBlockNumber(),
    deploymentTimestamp: Date.now(),
    supportedTokens: ["USDC", "USDT"],
    supportedChains: [1, 10, 137, 42161, 43114, 8453, 56],
    abi: PaymentRequest.interface.format("json"),
  };

  // Ensure deployments directory exists
  const deploymentsDir = join(__dirname, "..", "deployments");
  if (!existsSync(deploymentsDir)) {
    mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const fileName =
    chainId === 137n
      ? "polygon.json"
      : chainId === 80002n
      ? "polygonAmoy.json"
      : chainId === 56n
      ? "bsc.json"
      : `deployment-${chainId}.json`;

  const filePath = join(deploymentsDir, fileName);

  writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`💾 Deployment info saved to: ${filePath}`);

  console.log("\n🎯 Next steps:");
  console.log("1. Verify the contract on Polygonscan:");
  console.log(
    `   npx hardhat verify --network ${networkName} ${contractAddress}`,
  );
  console.log("2. Update frontend constants with the contract address and ABI");
  console.log("3. Test contract functions using Hardhat console or frontend");

  // Display some test data
  console.log("\n📊 Contract Info:");
  console.log(
    `Current Payment ID: ${await paymentRequest.getCurrentPaymentId()}`,
  );
  console.log(`Owner: ${await paymentRequest.owner()}`);
}

// Handle deployment errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
