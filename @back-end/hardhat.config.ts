import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

// Helper to clean private key (remove 0x prefix, quotes, and whitespace)
const getPrivateKey = (): string | undefined => {
  const key = process.env.PRIVATE_KEY;
  if (!key) return undefined;

  // Remove whitespace, quotes, and 0x prefix
  let cleaned = key.trim().replace(/["']/g, "");
  if (cleaned.startsWith("0x")) {
    cleaned = cleaned.slice(2);
  }

  // Validate length (should be 64 hex characters for 32 bytes)
  if (cleaned.length !== 64) {
    console.warn(
      `⚠️  Warning: Private key length is ${cleaned.length}, expected 64 hex characters`,
    );
  }

  return cleaned;
};

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com/",
      accounts: getPrivateKey() ? [getPrivateKey()!] : [],
      chainId: 137,
    },
    polygonAmoy: {
      url:
        process.env.POLYGON_AMOY_RPC_URL ||
        "https://rpc-amoy.polygon.technology/",
      accounts: getPrivateKey() ? [getPrivateKey()!] : [],
      chainId: 80002,
    },
    bsc: {
      url: process.env.BSC_RPC_URL || "https://bsc-dataseed1.binance.org/",
      accounts: getPrivateKey() ? [getPrivateKey()!] : [],
      chainId: 56,
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
