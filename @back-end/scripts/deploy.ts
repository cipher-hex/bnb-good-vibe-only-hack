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

  // Create simplified deployment info object
  const deploymentInfo = {
    contractAddress,
    chainId: Number(chainId),
    deploymentTimestamp: Date.now(),
    abi: PaymentRequest.interface.format(),
  };

  // Ensure deployments directory exists
  const deploymentsDir = join(__dirname, "..", "deployments");
  if (!existsSync(deploymentsDir)) {
    mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const fileName =
    chainId === BigInt(137)
      ? "polygon.json"
      : chainId === BigInt(80002)
      ? "polygonAmoy.json"
      : chainId === BigInt(56)
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
