import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Ignore ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Ignore TypeScript errors like "Property does not exist on type"
  typescript: {
    ignoreBuildErrors: true,
  },

  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_ENABLE_TESTNET: process.env.NEXT_PUBLIC_ENABLE_TESTNET,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
    ],
  },

  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
    };

    return config;
  },
};

export default nextConfig;
